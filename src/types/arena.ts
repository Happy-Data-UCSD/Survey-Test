export interface ArenaItem {
    id: string
    label: string
    description: string
}

export interface MatchupLog {
    round: number
    leftId: string
    rightId: string
    winnerId: string
    eliminatedId: string
    timestamp: number
}
