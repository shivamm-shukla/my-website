export type RobotSceneOptions = { pose?: "wave" | "rest" | "think"; follow?: boolean; onReady?: () => void; onError?: () => void };
export type RobotSceneHandle = { dispose(): void };
export function createRobotScene(host: HTMLElement, options?: RobotSceneOptions): RobotSceneHandle;
