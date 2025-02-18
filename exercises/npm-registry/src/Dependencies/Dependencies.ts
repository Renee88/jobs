import { getDependencies, getPackage } from '../package';
import axios, { AxiosResponse } from 'axios';
import { NPMPackage, Dependencies } from '../types';
import { Dependency } from './types';

export class DependencyTree {
    private pack?: Dependency;

    constructor(){
        // empty ctor
    }

    public static async getDependencyTree(name: string, version: string, dependencies: Dependencies | undefined): Promise<Dependency> {
        const dependencyTree: DependencyTree = new DependencyTree();

        dependencyTree.pack = dependencies ? await Package.createPackage(name, version, dependencies) : new LeafDependency(name, version);
        return dependencyTree.pack;
    }
}

class LeafDependency implements Dependency{
    private name: string;
    private version: string;

    constructor(name: string, version: string) {
        this.name = name;
        this.version = version;
    }

    public getName(): string {
        return this.name;
    }

    public getVersion(): string {
        return this.version;
    }

    public getDependencies(): Dependency[] {
        return [];
    }
}

class Package implements Dependency {
    private name: string;
    private version: string;
    private dependencies: Dependency[] = [];

    private constructor(name: string, version: string){
        this.name = name;
        this.version = version;
    }

    public getName(): string {
        return this.name;
    }

    public getVersion(): string {
        return this.version;
    }

    public getDependencies(): Dependency[] {
        return this.dependencies;
    }

    public static async createPackage(name:string, version:string, dependencies: Dependencies | undefined): Promise<Dependency>{
        const dependencyArr: Dependency[] = [];
        let depEntries = dependencies ? Object.entries(dependencies) : [];
        const pack: Package = new Package(name, version);

        for(let [name, version] of depEntries){
            const dependencies  = await getDependencies(name, version);
            if(Package.isParentDependency(dependencies)){
                dependencyArr.push(await Package.createPackage(name, version, dependencies))
            } else {
                dependencyArr.push(new LeafDependency(name, version));
            }
        }
        pack.dependencies = dependencyArr;
        
        return pack;
    }

    private static isParentDependency(dependencies: Dependencies | undefined): boolean {
        return undefined !== dependencies;
    }
}