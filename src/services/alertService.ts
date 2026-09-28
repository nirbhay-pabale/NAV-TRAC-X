import type { SecurityAlert, AlertRule, AccessDeniedLog } from '../types/domain';

export class AlertEngine {
  /**
   * Evaluates access denied events against configured alert rules
   */
  public evaluateDeniedLogs(
    logs: AccessDeniedLog[],
    rules: AlertRule[]
  ): SecurityAlert[] {
    const alerts: SecurityAlert[] = [];
    const activeRules = rules.filter((r) => r.isActive);

    // Group logs by document
    const docCounts: Record<string, number> = {};
    logs.forEach((l) => {
      docCounts[l.documentId] = (docCounts[l.documentId] || 0) + 1;
    });

    activeRules.forEach((rule) => {
      if (rule.groupingKey === 'Same Document') {
        Object.entries(docCounts).forEach(([docId, count]) => {
          if (count >= rule.denialThreshold) {
            alerts.push({
              id: `ALT-RULE-${rule.id}-${docId.slice(-4)}`,
              type: 'REPEATED_ACCESS_DENIED',
              severity: 'HIGH',
              timestamp: new Date().toISOString(),
              source: `Rule Engine (${rule.name})`,
              documentId: docId,
              message: `Anomaly Triggered: ${count} denied attempts on document ${docId} within time window.`,
              status: 'NEW',
            });
          }
        });
      }
    });

    return alerts;
  }
}

export const alertEngine = new AlertEngine();
