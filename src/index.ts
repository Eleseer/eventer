
type EmptyObject = Record<string, never>;

type DataParam = {
	[key: string]: any;
}

/**
 * @param T event data
 */
type ListenerCb<T extends DataParam> = (data: T) => void;

/**
 * @param T event data
 */
type ListenerEntry<T extends DataParam> = {
	listener: ListenerCb<T>,
	once: boolean
}

/**
 * @param key event name
 * @param value event data
 */
type Events = {
	[key: string]: DataParam
}

export default class <T extends Events> {
	#events: {
		[key in keyof T]?: ListenerEntry<T[key]>[]
	} = {};

	/**
	 * Adds `listener` to event `eventName`.
	 * @param eventName name of the event to listen to.
	 * @param listener listener function.
	 * @returns this.
	 */
	on<key extends keyof T>(eventName: key, listener: ListenerCb<T[key]>) {
		const eventNode = this.#getEventNode(eventName);

		eventNode.push({
			listener,
			once: false
		});

		return this;
	}

	/**
	 * Adds `listener` to event `eventName` that runs only **once**.
	 * @param eventName name of the event to listen to.
	 * @param listener listener function.
	 * @returns this.
	 */
	once<key extends keyof T>(eventName: key, listener: ListenerCb<T[key]>) {
		const eventNode = this.#getEventNode(eventName);

		eventNode.push({
			listener,
			once: true
		});

		return this;
	}

	/**
	 * Removes `listener` from event `eventName`.
	 * @param eventName name of the event.
	 * @param listener listener function.
	 * @returns this.
	 */
	removeListener<key extends keyof T, data extends T[key]>(eventName: key, listener: ListenerCb<data>) {
		if(this.#eventNodeExists(eventName))
			return;
		
		const eventNode = this.#getEventNode(eventName);
		const listenerEntryIndex = eventNode.findIndex(listenerEntry => listenerEntry.listener === listener);
		if(listenerEntryIndex === -1)
			return;

		eventNode.splice(listenerEntryIndex, 1);
		
		return this;
	}

	/**
	 * Dispatches event `eventName` **without** any data. 
	 * @param eventName name of the event.
	 */
	fire<key extends keyof T & (T[key] extends EmptyObject ? string : never)>(eventName: key): this;
	/**
	 * Dispatches event `eventName` **with** `data`. 
	 * @param eventName name of the event.
	 */
	fire<key extends keyof T, data extends (T[key] extends EmptyObject ? never : T[key])>(eventName: key, eventData: data): this;
	fire<key extends keyof T>(eventName: key, eventData: T[key] = {} as T[key]) {
		if(!this.#eventNodeExists(eventName))
			return;

		const eventNode = this.#getEventNode(eventName);
		const itemsToRemove = [];
		for(let i = 0; i < eventNode.length; i++) {
			const listenerEntry = eventNode[i];
			listenerEntry.listener(eventData);

			if(listenerEntry.once)
			 itemsToRemove.push(listenerEntry);
		}
		for(const el of itemsToRemove) {
			const index = eventNode.indexOf(el);
			eventNode.splice(index, 1);
		}

		return this;
	}

	/**
	 * Returns an array of listener entries (internal objects that represent a single listener) 
	 * for a given event `eventName`.
	 * 
	 * @param eventName name of the event.
	 * @returns an array of listener entries — internal objects that represent a single listener.
	 */
	#getEventNode<key extends keyof T>(eventName: key) {
		let eventNode = this.#events[eventName];
		if(!eventNode) {
			eventNode = [];
			this.#events[eventName] = eventNode;
		}
		return eventNode as ListenerEntry<T[key]>[];
	}

	/**
	 * Checks if an array of listener entries — internal objects that represent a single listener, - if defined.
	 * 
	 * @param eventName name of the event.
	 */
	#eventNodeExists(eventName: keyof T) {
		return this.#events[eventName] !== undefined;
	}
}