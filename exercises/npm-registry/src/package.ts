import { RequestHandler } from 'express';
import got from 'got';
import { DependencyTree } from './Dependencies/Dependencies';
import { Dependencies, NPMPackage } from './types';

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;

  try {
    const dependencies = await getDependencies(name, version);
    const dependencyTree = await DependencyTree.getDependencyTree(name, version, dependencies);

    return res.status(200).json({dependencyTree});
  } catch (error) {
    return next(error);
  }
};

export const getDependencies = async (name: string, version: string): Promise<Dependencies|undefined> => {
  const extractedVersion = version.replace('^', '');
  const npmPackage: NPMPackage = await got(
    `https://registry.npmjs.org/${name}`,
  ).json();

  return npmPackage.versions[extractedVersion].dependencies;
}
