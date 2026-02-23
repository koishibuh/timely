export interface ITask {
    id: number;
    icon: string;
    title: string;
    color: string;
    durationInMinutes: number;
}

export interface ITaskTime {
    title: string;
    starttime: number;
    endtime: number;
}