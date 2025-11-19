"""
OpenTelemetry Distributed Tracing Setup
Provides end-to-end request tracing across services
"""
import logging
import os
from typing import Optional

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.sqlite3 import SQLite3Instrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.trace import Status, StatusCode

logger = logging.getLogger(__name__)

# Configuration
OTEL_ENABLED = os.getenv('OTEL_ENABLED', 'false').lower() == 'true'
OTEL_SERVICE_NAME = os.getenv('OTEL_SERVICE_NAME', 'greenstack-api')
OTEL_SERVICE_VERSION = os.getenv('OTEL_SERVICE_VERSION', '1.0.0')
OTEL_EXPORTER_ENDPOINT = os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4317')
OTEL_EXPORT_CONSOLE = os.getenv('OTEL_EXPORT_CONSOLE', 'false').lower() == 'true'


def setup_telemetry(app=None, service_name: Optional[str] = None):
    """
    Initialize OpenTelemetry distributed tracing

    Args:
        app: FastAPI application instance (optional)
        service_name: Override service name (optional)
    """
    if not OTEL_ENABLED:
        logger.info("OpenTelemetry tracing is disabled (set OTEL_ENABLED=true to enable)")
        return

    try:
        # Create resource with service information
        resource = Resource(attributes={
            SERVICE_NAME: service_name or OTEL_SERVICE_NAME,
            SERVICE_VERSION: OTEL_SERVICE_VERSION,
            "deployment.environment": os.getenv('ENVIRONMENT', 'development'),
        })

        # Create tracer provider
        tracer_provider = TracerProvider(resource=resource)

        # Add OTLP exporter (for Jaeger, Tempo, etc.)
        try:
            otlp_exporter = OTLPSpanExporter(endpoint=OTEL_EXPORTER_ENDPOINT)
            tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
            logger.info(f"OpenTelemetry OTLP exporter configured: {OTEL_EXPORTER_ENDPOINT}")
        except Exception as e:
            logger.warning(f"Failed to configure OTLP exporter: {e}")

        # Add console exporter for debugging
        if OTEL_EXPORT_CONSOLE:
            console_exporter = ConsoleSpanExporter()
            tracer_provider.add_span_processor(BatchSpanProcessor(console_exporter))
            logger.info("OpenTelemetry console exporter enabled")

        # Set global tracer provider
        trace.set_tracer_provider(tracer_provider)

        # Instrument libraries
        logger.info("Instrumenting libraries with OpenTelemetry...")

        # FastAPI instrumentation
        if app:
            FastAPIInstrumentor.instrument_app(app)
            logger.info("FastAPI instrumented for tracing")

        # HTTP requests instrumentation (for external API calls)
        RequestsInstrumentor().instrument()
        logger.info("Requests library instrumented for tracing")

        # Redis instrumentation (if available)
        try:
            RedisInstrumentor().instrument()
            logger.info("Redis instrumented for tracing")
        except Exception as e:
            logger.debug(f"Redis instrumentation skipped: {e}")

        # SQLite3 instrumentation
        try:
            SQLite3Instrumentor().instrument()
            logger.info("SQLite3 instrumented for tracing")
        except Exception as e:
            logger.debug(f"SQLite3 instrumentation skipped: {e}")

        # Logging instrumentation (correlate logs with traces)
        try:
            LoggingInstrumentor().instrument(set_logging_format=True)
            logger.info("Logging instrumented for trace correlation")
        except Exception as e:
            logger.debug(f"Logging instrumentation skipped: {e}")

        logger.info(f"OpenTelemetry tracing initialized for '{service_name or OTEL_SERVICE_NAME}'")

    except Exception as e:
        logger.error(f"Failed to initialize OpenTelemetry tracing: {e}", exc_info=True)


def get_tracer(name: str = __name__):
    """
    Get a tracer instance for manual instrumentation

    Args:
        name: Tracer name (usually __name__)

    Returns:
        Tracer instance
    """
    return trace.get_tracer(name)


def trace_function(name: Optional[str] = None):
    """
    Decorator to trace a function

    Usage:
        @trace_function("my_function")
        def my_function():
            pass
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            tracer = get_tracer()
            span_name = name or f"{func.__module__}.{func.__name__}"

            with tracer.start_as_current_span(span_name) as span:
                try:
                    # Add function arguments as attributes
                    if args:
                        span.set_attribute("function.args.count", len(args))
                    if kwargs:
                        span.set_attribute("function.kwargs.count", len(kwargs))

                    result = func(*args, **kwargs)
                    span.set_status(Status(StatusCode.OK))
                    return result

                except Exception as e:
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    span.record_exception(e)
                    raise

        return wrapper
    return decorator


# Example usage for manual tracing:
#
# from src.telemetry import get_tracer
#
# tracer = get_tracer(__name__)
#
# with tracer.start_as_current_span("process_device") as span:
#     span.set_attribute("device.id", device_id)
#     span.set_attribute("device.vendor", vendor_id)
#     # ... do work ...
#     span.add_event("Device processed successfully")
