import { Resource, ResourceStatus } from './resource';
import { fetchResource } from './client';
import { urls } from '../helpers/urls';
import { Datatype, datatypeFromUrl } from './datatypes';
import { Agent } from './agent';

type callback = (resource: Resource) => void;

/** An in memory store that has a bunch of useful methods for retrieving and */
export class Store {
  /** The default store URL, where to send commits and where to create new instances */
  baseUrl: string;
  /** All the resources of the store */
  resources: Map<string, Resource>;
  /** A list of all functions that need to be called when a certain resource is updated */
  subscribers: Map<string, Array<callback>>;
  /** Current Agent, used for signing commits. Is required for posting things. */
  agent?: Agent;

  constructor(base_url: string) {
    this.baseUrl = base_url;
    this.resources = new Map();
    this.subscribers = new Map();
  }

  /** Adds a Resource to the store. Replaces existing. Notifies subscribers */
  addResource(resource: Resource): void {
    this.resources.set(resource.getSubject(), resource);
    this.notify(resource);
  }

  /** Fetches a resource by URL, replaces the one in the store. */
  async fetchResource(subject: string): Promise<Resource> {
    if (this.resources.get(subject) == undefined) {
      const fetched = await fetchResource(subject);
      this.addResource(fetched);
      return fetched;
    }
  }

  /** Returns the URL of the companion server */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /** Returns the Currently set Agent, throws an error if there is none. Make sure to first run `store.setAgent()`. */
  getAgent(): Agent {
    if (this.agent == null) {
      throw new Error('No agent has been set. Run store.setAgent()');
    }
    return this.agent;
  }

  /**
   * Gets a resource by URL. Fetches and parses it if it's not available in the store. Instantly returns an empty loading resource, while
   * the fetching is done in the background .
   */
  getResourceLoading(subject: string): Resource {
    const found = this.resources.get(subject);
    if (found == undefined) {
      this.fetchResource(subject);
      const newR = new Resource(subject);
      newR.setStatus(ResourceStatus.loading);
      this.resources.set(subject, newR);
      return newR;
    }
    return found;
  }

  /**
   * Gets a resource by URL. Fetches and parses it if it's not available in the store. Not recommended to use this for rendering, because
   * it might cause resources to be fetched multiple times.
   */
  async getResourceAsync(subject: string): Promise<Resource> {
    const found = this.resources.get(subject);
    if (found == undefined) {
      const newR = await this.fetchResource(subject);
      return newR;
    }
    return found;
  }

  /** Gets a property by URL. */
  async getProperty(subject: string): Promise<Property | null> {
    const resource = await this.getResourceAsync(subject);
    const prop = new Property();
    const datatypeUrl = resource.get(urls.properties.datatype);
    if (datatypeUrl == null) {
      throw new Error(`Property ${subject} has no datatype: ${resource.getPropVals()}`);
    }
    const classTypeURL = resource.get(urls.properties.classType).toString();
    prop.classType = classTypeURL;
    prop.datatype = datatypeFromUrl(datatypeUrl.toString());
    return prop;
  }

  /** Let's subscribers know that a resource has been changed. Time to update your views! */
  notify(resource: Resource): void {
    const subject = resource.getSubject();
    const subscribers = this.subscribers.get(subject);
    if (subscribers == undefined) {
      return;
    }
    subscribers.map(callback => {
      callback(resource);
    });
  }

  /** Sets the current Agent, used for signing commits */
  setAgent(agent: Agent): void {
    this.agent = agent;
  }

  /** Registers a callback for when the a resource is updated. */
  subscribe(subject: string, callback: callback): void {
    let callbackArray = this.subscribers.get(subject);
    if (callbackArray == undefined) {
      callbackArray = [];
    }
    callbackArray.push(callback);
    this.subscribers.set(subject, callbackArray);
  }

  /** Unregisters the callback (see `subscribe()`) */
  unsubscribe(subject: string, callback: callback): void {
    let callbackArray = this.subscribers.get(subject);
    callbackArray = callbackArray.filter(item => item !== callback);
    this.subscribers.set(subject, callbackArray);
  }
}

export class Property {
  subject: string;
  datatype: Datatype;
  shortname: string;
  description: string;
  classType?: string;
}