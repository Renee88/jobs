export interface Dependency {
    getName():string;
    getVersion():string;
    getDependencies():Dependency[]
}