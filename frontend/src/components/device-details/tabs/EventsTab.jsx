import React, { useMemo } from 'react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
  Button, Input, Skeleton, Badge
} from '@/components/ui';
import { Radio, Search } from 'lucide-react';

/**
 * EventsTab - Displays device events with search functionality
 */
export const EventsTab = ({
  events,
  loadingEvents,
  eventSearchQuery,
  setEventSearchQuery
}) => {
  const filteredEvents = useMemo(() => {
    if (!eventSearchQuery) return events;
    const query = eventSearchQuery.toLowerCase();
    return events.filter(event =>
      (event.name && event.name.toLowerCase().includes(query)) ||
      (event.description && event.description.toLowerCase().includes(query)) ||
      (event.code && event.code.toString().includes(query)) ||
      (event.event_type && event.event_type.toLowerCase().includes(query))
    );
  }, [events, eventSearchQuery]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="text-foreground text-xl flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
            <Radio className="w-5 h-5 text-warning" />
          </div>
          Device Events
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Events that can be triggered by this device
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Box */}
        {events.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search events by name, code, type, or description..."
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-warning/50 focus:ring-yellow-500/20 text-sm"
              />
            </div>
          </div>
        )}

        {loadingEvents ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 bg-secondary" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events defined for this device
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events match your search
            <Button
              variant="link"
              onClick={() => setEventSearchQuery('')}
              className="mt-2 text-warning"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-border hover:border-warning/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="px-3 py-1 rounded-md bg-warning/20 border border-warning/30">
                      <span className="text-warning font-mono text-sm font-bold">
                        {event.code}
                      </span>
                    </div>
                    <div className="px-3 py-1 rounded-md bg-muted/30 border border-border/30">
                      <span className="text-foreground font-mono text-xs">
                        0x{event.code.toString(16).toUpperCase().padStart(4, '0')}
                      </span>
                    </div>
                    {event.event_type && (
                      <Badge className={`
                        ${event.event_type === 'Error' ? 'bg-error/20 text-error border-error/50' : ''}
                        ${event.event_type === 'Warning' ? 'bg-warning/20 text-warning border-warning/50' : ''}
                        ${event.event_type === 'Notification' ? 'bg-brand-green/20 text-brand-green border-brand-green/50' : ''}
                        font-semibold
                      `}>
                        {event.event_type}
                      </Badge>
                    )}
                    <h3 className="text-foreground font-semibold">{event.name}</h3>
                  </div>
                </div>
                {event.description && (
                  <p className="text-muted-foreground text-sm mt-2 ml-1">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
