import type { ObjectiveLog } from './types'

export type LogRow = Pick<ObjectiveLog, 'objective_id' | 'log_date'>

export class LogIndex {
  private keys: Set<string>

  constructor(logs: LogRow[]) {
    this.keys = new Set(logs.map((l) => LogIndex.key(l.objective_id, l.log_date)))
  }

  static key(objectiveId: string, date: string) {
    return `${objectiveId}|${date}`
  }

  has(objectiveId: string, date: string) {
    return this.keys.has(LogIndex.key(objectiveId, date))
  }
}
