import React, { useMemo } from 'react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
  Button, Input, Skeleton
} from '@/components/ui';
import { AlertTriangle, Search } from 'lucide-react';

/**
 * ErrorsTab - Displays device error types with search functionality
 */
export const ErrorsTab = ({
  errors,
  loadingErrors,
  errorSearchQuery,
  setErrorSearchQuery
}) => {
  const filteredErrors = useMemo(() => {
    if (!errorSearchQuery) return errors;
    const query = errorSearchQuery.toLowerCase();
    return errors.filter(error =>
      (error.name && error.name.toLowerCase().includes(query)) ||
      (error.description && error.description.toLowerCase().includes(query)) ||
      (error.code && error.code.toString().includes(query)) ||
      (error.additional_code && error.additional_code.toString().includes(query))
    );
  }, [errors, errorSearchQuery]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="text-foreground text-xl flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-error" />
          </div>
          Error Types
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Standard IO-Link error codes supported by this device
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Box */}
        {errors.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search errors by name, code, or description..."
                value={errorSearchQuery}
                onChange={(e) => setErrorSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-error/50 focus:ring-error/20 text-sm"
              />
            </div>
          </div>
        )}

        {loadingErrors ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 bg-secondary" />
            ))}
          </div>
        ) : errors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No error types defined for this device
          </div>
        ) : filteredErrors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No errors match your search
            <Button
              variant="link"
              onClick={() => setErrorSearchQuery('')}
              className="mt-2 text-error"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredErrors.map((error) => (
              <div
                key={error.id}
                className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-border hover:border-error/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="px-3 py-1 rounded-md bg-error/20 border border-error/30">
                      <span className="text-error font-mono text-sm font-bold">
                        {error.code}/{error.additional_code}
                      </span>
                    </div>
                    <div className="px-3 py-1 rounded-md bg-muted/30 border border-border/30">
                      <span className="text-foreground font-mono text-xs">
                        0x{error.code.toString(16).toUpperCase().padStart(2, '0')}/0x{error.additional_code.toString(16).toUpperCase().padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-foreground font-semibold">{error.name}</h3>
                  </div>
                </div>
                {error.description && (
                  <p className="text-muted-foreground text-sm mt-2 ml-1">{error.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
