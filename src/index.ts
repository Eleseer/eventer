
type Not<T, V> = V extends T ? never : V;
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

type KeysMatching<T, V> = { 
	[key in keyof T]-?: T[key] extends V ? key : never 
}[keyof T];

export class Eventer <T extends Not<EmptyObject, Events>> {
	#events: {
		[key in keyof T]?: ListenerEntry<T[key]>[]
	} = {};

	/**
	 * Adds `listener` to event `eventName`.
	 * @param eventName name of the event to listen to.
	 * @param listener listener function.
	 * @param once should listener be called just once?
	 * @returns this.
	 */
	addEventListener<key extends keyof T>(eventName: key, listener: ListenerCb<T[key]>, {
		once = false
	} = {}) {
		const eventNode = this.#getEventNode(eventName);

		eventNode.push({
			listener,
			once: once
		});

		return this;
	}

	/**
	 * Removes `listener` from event `eventName`.
	 * @param eventName name of the event.
	 * @param listener listener function.
	 * @returns this.
	 */
	removeEventListener<key extends keyof T>(eventName: key, listener: ListenerCb<T[key]>) {
		// shouldn't create new node on listener entry removal
		if(!this.#eventNodeExists(eventName))
			return this;
		
		const eventNode = this.#getEventNode(eventName);
		const listenerEntryIndex = eventNode.findIndex(listenerEntry => listenerEntry.listener === listener);
		if(listenerEntryIndex === -1)
			return this;

		eventNode.splice(listenerEntryIndex, 1);
		
		return this;
	}

	/**
	 * Dispatches event `eventName` **without** any data. 
	 * @param eventName name of the event.
	 */
	dispatchEvent<key extends KeysMatching<T, EmptyObject>>(eventName: key): this;
	/**
	* Dispatches event `eventName` **with** `data`. 
	* @param eventName name of the event.
	*/
	dispatchEvent<key extends keyof T, data extends Not<EmptyObject, T[key]>>(eventName: key, eventData: data): this;
	dispatchEvent<key extends keyof T>(eventName: key, eventData: T[key] = {} as T[key]) {
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
	 * Checks if an array of listener entries — internal objects that represent a single listener, - is defined.
	 * 
	 * @param eventName name of the event.
	 */
	#eventNodeExists(eventName: keyof T) {
		return this.#events[eventName] !== undefined;
	}
}