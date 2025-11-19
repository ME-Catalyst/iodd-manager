"""
Circuit Breaker Pattern Implementation
Prevents cascading failures by failing fast when a service is unavailable
"""
import time
import logging
from enum import Enum
from typing import Callable, Any, Optional
from functools import wraps
from dataclasses import dataclass
from threading import Lock

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"      # Normal operation, requests pass through
    OPEN = "open"          # Circuit is open, requests fail immediately
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Circuit breaker configuration"""
    failure_threshold: int = 5          # Failures before opening circuit
    success_threshold: int = 2          # Successes in half-open to close
    timeout: float = 60.0               # Seconds to wait before half-open
    expected_exception: type = Exception  # Exception type to catch


class CircuitBreaker:
    """
    Circuit Breaker implementation for protecting against cascading failures.

    Usage:
        breaker = CircuitBreaker(name="redis", failure_threshold=3, timeout=30)

        @breaker
        def call_redis():
            redis_client.get("key")
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        success_threshold: int = 2,
        timeout: float = 60.0,
        expected_exception: type = Exception
    ):
        self.name = name
        self.config = CircuitBreakerConfig(
            failure_threshold=failure_threshold,
            success_threshold=success_threshold,
            timeout=timeout,
            expected_exception=expected_exception
        )

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: Optional[float] = None
        self._lock = Lock()

        logger.info(
            f"Circuit breaker '{name}' initialized: "
            f"failure_threshold={failure_threshold}, timeout={timeout}s"
        )

    @property
    def state(self) -> CircuitState:
        """Get current circuit state"""
        with self._lock:
            # Auto-transition from OPEN to HALF_OPEN after timeout
            if (
                self._state == CircuitState.OPEN
                and self._last_failure_time
                and time.time() - self._last_failure_time >= self.config.timeout
            ):
                logger.info(f"Circuit '{self.name}' transitioning OPEN → HALF_OPEN (timeout expired)")
                self._state = CircuitState.HALF_OPEN
                self._success_count = 0

            return self._state

    def _on_success(self):
        """Handle successful operation"""
        with self._lock:
            self._failure_count = 0

            if self._state == CircuitState.HALF_OPEN:
                self._success_count += 1
                logger.debug(
                    f"Circuit '{self.name}' success in HALF_OPEN "
                    f"({self._success_count}/{self.config.success_threshold})"
                )

                if self._success_count >= self.config.success_threshold:
                    logger.info(f"Circuit '{self.name}' transitioning HALF_OPEN → CLOSED (recovered)")
                    self._state = CircuitState.CLOSED
                    self._success_count = 0

    def _on_failure(self, exception: Exception):
        """Handle failed operation"""
        with self._lock:
            self._failure_count += 1
            self._last_failure_time = time.time()

            if self._state == CircuitState.HALF_OPEN:
                logger.warning(
                    f"Circuit '{self.name}' failed in HALF_OPEN, transitioning → OPEN: {exception}"
                )
                self._state = CircuitState.OPEN
                self._success_count = 0
                self._failure_count = 0

            elif self._state == CircuitState.CLOSED:
                logger.warning(
                    f"Circuit '{self.name}' failure {self._failure_count}/"
                    f"{self.config.failure_threshold}: {exception}"
                )

                if self._failure_count >= self.config.failure_threshold:
                    logger.error(
                        f"Circuit '{self.name}' transitioning CLOSED → OPEN "
                        f"(threshold reached: {self._failure_count} failures)"
                    )
                    self._state = CircuitState.OPEN

    def __call__(self, func: Callable) -> Callable:
        """Decorator for protecting function calls"""
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            return self.call(func, *args, **kwargs)
        return wrapper

    def call(self, func: Callable, *args, **kwargs) -> Any:
        """
        Execute function with circuit breaker protection

        Raises:
            CircuitBreakerOpenException: If circuit is open
        """
        current_state = self.state  # This may trigger OPEN → HALF_OPEN transition

        if current_state == CircuitState.OPEN:
            raise CircuitBreakerOpenException(
                f"Circuit breaker '{self.name}' is OPEN (service unavailable)"
            )

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result

        except self.config.expected_exception as e:
            self._on_failure(e)
            raise

    def reset(self):
        """Manually reset circuit breaker to CLOSED state"""
        with self._lock:
            logger.info(f"Circuit '{self.name}' manually reset to CLOSED")
            self._state = CircuitState.CLOSED
            self._failure_count = 0
            self._success_count = 0
            self._last_failure_time = None

    def get_stats(self) -> dict:
        """Get circuit breaker statistics"""
        with self._lock:
            return {
                "name": self.name,
                "state": self._state.value,
                "failure_count": self._failure_count,
                "success_count": self._success_count,
                "last_failure_time": self._last_failure_time,
                "config": {
                    "failure_threshold": self.config.failure_threshold,
                    "success_threshold": self.config.success_threshold,
                    "timeout": self.config.timeout,
                }
            }


class CircuitBreakerOpenException(Exception):
    """Exception raised when circuit breaker is open"""
    pass


# Global circuit breaker registry for monitoring
_circuit_breakers: dict[str, CircuitBreaker] = {}


def get_circuit_breaker(
    name: str,
    failure_threshold: int = 5,
    success_threshold: int = 2,
    timeout: float = 60.0,
    expected_exception: type = Exception
) -> CircuitBreaker:
    """
    Get or create a circuit breaker by name.
    Ensures only one circuit breaker instance per name.
    """
    if name not in _circuit_breakers:
        _circuit_breakers[name] = CircuitBreaker(
            name=name,
            failure_threshold=failure_threshold,
            success_threshold=success_threshold,
            timeout=timeout,
            expected_exception=expected_exception
        )

    return _circuit_breakers[name]


def get_all_circuit_breakers() -> dict[str, CircuitBreaker]:
    """Get all registered circuit breakers"""
    return _circuit_breakers.copy()


def get_all_stats() -> list[dict]:
    """Get statistics for all circuit breakers"""
    return [breaker.get_stats() for breaker in _circuit_breakers.values()]
