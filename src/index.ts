
/**
 * The event data type.
 */
 export type EventData = { [key: string]: any };
/**
 * The events object type — represents the events provided to the `Eventer` through the generics.
 */
export type Events<Keys extends string = string> = { [key in Keys]: EventData };

/**
 * The event listener type.
 */
export type Listener<T extends EventData> = T extends EmptyObject ? () => void : (data: T) => void;

/**
 * The event listener entry (with some metadata).
 * 
 * @internal
 */
type ListenerEntry<T extends EventData> = {
	listener: Listener<T>,
	once: boolean
}

/**
 * An empty object type (can't hold values *at all*).
 */
 export type EmptyObject = Record<string, never>;
/** 
 * Gets the keys from an object type whose values are of a given type.
 * 
 * Lacks `[keyof T]` at the end for getting the actual keys out, but without it 
 * the *IntelliSense* and its messages are move readable.
 * 
 * {@link https://stackoverflow.com/a/54520829 Source @ stackoverflow} by {@link https://stackoverflow.com/users/2887218/jcalz jcalz}.
 * 
 * @internal
 * */
type KeysMatching<T, V> = { 
	[key in keyof T]-?: T[key] extends V ? key : never 
};

export default class Eventer <T extends Events> {
    /**
     * The event listener vault. Binds listeners with the events.
     * 
     * @internal
     */
	#listenerEntriesByEvent: {
        [key in keyof T]?: ListenerEntry<T[key]>[]  
    } = {};

    /**
     * **All** the listeners for a given events.
     * 
     * Creates an event body if it's not yet defined.
     * 
     * @internal
     */
	#getEventListenerEntries<key extends (keyof T extends any ? keyof T : never)>(event: key) {
		let listenerEntries: ListenerEntry<T[key]>[] | undefined = this.#listenerEntriesByEvent[event];
		if(!listenerEntries) {
			listenerEntries = [];
			this.#listenerEntriesByEvent[event] = listenerEntries;
		}

		return listenerEntries;
	}

	/**
	 * Adds `listener` to event `event`.
	 * 
	 * @param event name of the event to listen to.
	 * @param listener listener function.
	 * @param once should listener be called just once?
	 * @returns this.
	 */
	public addEventListener<key extends (keyof T & string)>(event: key, listener: Listener<T[key]>, {
		/** 									 ^^^^^^^^
		*		exposes keys to intelliSense so they'll show up as actual keys not «keyof Whatever»
		*/ 
		once = false
	} = {}) {
		const eventListenerEntries = this.#getEventListenerEntries(event);

		eventListenerEntries.push({
			listener,
			once
		});

		return this;
	}

	/**
	 * Removes `listener` from event `event`.
	 * @param event name of the event.
	 * @param listener listener function.
	 * @returns this.
	 */
	public removeEventListener<key extends (keyof T & string)>(event: key, listener: Listener<T[key]>) {
		/** 									    ^^^^^^^^
		*			exposes keys to intelliSense so they'll show up as actual keys not «keyof Whatever»
		*/ 
		const eventListenerEntries = this.#getEventListenerEntries(event);

        const eventEntryIndex = eventListenerEntries.findIndex(entry => entry.listener === listener);
        if(eventEntryIndex === -1)
            return this;

        eventListenerEntries.splice(eventEntryIndex, 1);
		
		return this;
	}

	/**
	 * Fires event `event` **without** any data. 
	 * @param event name of the event.
	 */
	public dispatchEvent<key extends KeysMatching<T, EmptyObject>[keyof T]>(event: key): this;
	/**
	* Fires event `event` **with** `data`. 
	* @param event name of the event.
	* @param data data to pass with the event.
	*/
    public dispatchEvent<key extends keyof Omit<T, KeysMatching<T, EmptyObject>[keyof T]>>(event: key, data: T[key]): this;
    public dispatchEvent<key extends keyof T>(event: key, data?: T[key]) {
		const eventListenerEntries = this.#getEventListenerEntries(event);
		if(!eventListenerEntries.length)
			return this;

		for(let i = eventListenerEntries.length - 1; i >= 0; i--) {
			const listenerEntry = eventListenerEntries[i];
			listenerEntry.listener(data!);

			if(listenerEntry.once)
				eventListenerEntries.splice(i, 1);
		}

		return this;
    }
}