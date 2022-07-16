[![Node.js CI](https://github.com/Eleseer/eventer/actions/workflows/node.js.yml/badge.svg)](https://github.com/Eleseer/eventer/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/Eleseer/eventer/branch/main/graph/badge.svg?token=2RBZLFAQNA)](https://codecov.io/gh/Eleseer/eventer)

# Eventer

A simple JS **typed** event system, similar to the native one (i.e. *reinventing the wheel*).

Docs are available at the [project page](https://eleseer.github.io/eventer/).

## Table of Contents 
* [Installation](#installation)
* [Usage](#usage)
* [Features](#features)
  * [Add listeners, fire events, remove listeners](#features-basic)
  * [Firing events just once](#features-firing-just-once)
  * [Firing events without listeners](#features-fire-without-listeners)
  * [Removing never-added listeners](#features-remove-not-added-listeners)
* [Type checking](#features-type-checking)
  * [Adding listeners](#features-type-checking-adding-listeners)
  * [Removing listeners](#features-type-checking-removing-listeners)
  * [Firing events](#features-type-checking-firing-events)

## <a name="installation"></a> Installation

Using NPM

```bash
npm i @aliser/eventer
```

## <a name="usage"></a> Usage

**Setup**

```ts
import Eventer from '@aliser/eventer';

/**
A type describing your events, where:
* - propertyName — an event name, a string.
* - propertyValue — an object with data expected in by the event or an empty object, if event has no data. 
*/ 
type Events = {
	hello: { // event with data
		msg: string
	},
	bye: { } // event without data, — is dataless
}

/*
* Create a listener that accepts data with the data type specified. If event has no data, don't specify anything.
*/
const helloListener = ({ msg }: Events['hello']) => {
	console.log(msg);
}
const byeListener = () => {
	console.log('Bye, world!');
}
```
---
* **Use `Eventer` in class through inheritance**

```ts
class Foo extends Eventer<Events> {
	constructor() {
		super();
	}
}
const foo = new Foo();

// add <helloListener> listener to <hello> event
foo.addEventListener('hello', helloListener);
// fire <hello> event with some data
foo.dispatchEvent('hello', { msg: 'Hello, world!' });
// > Hello, world!

// remove <helloListener> from <hello> event
foo.removeEventListener('hello', helloListener);

// fire <hello> event with some data, again
foo.dispatchEvent('hello', { msg: 'Hello, world!' });
// no message is printed
```

* **Or create `Eventer` instance**

```ts
const eventer = new Eventer<Events>();

// add <helloListener> listener to <hello> event
eventer.addEventListener('hello', helloListener);
// fire <hello> event with some data
eventer.dispatchEvent('hello', { msg: 'Hello, world!' });
// > Hello, world!

// remove <helloListener> from <hello> event
eventer.removeEventListener('hello', helloListener);

// fire <hello> event with some data, again
eventer.dispatchEvent('hello', { msg: 'Hello, world!' });
// no message is printed
```

## <a name="features"></a> Features

**Setup**

```ts
import Eventer from '@aliser/eventer';

type Events = {
	hello: {
		msg: string
	},
	bye: { }
}

const eventer = new Eventer<Events>();

const helloListener = ({ msg }: Events['hello']) => {
	console.log(msg);
}
const byeListener = () => {
	console.log('Bye, World!');
}
```
---
### <a name="features-basic"></a> **Add listeners, fire events, remove listeners**

```ts
eventer.addEventListener('hello', helloListener);

eventer.dispatchEvent('hello', { msg: 'Hello, World!' });
// > Hello, World!

eventer.removeEventListener('hello', helloListener);

// =============
// or use chaining!
eventer
	.addEventListener('hello', helloListener)
	.dispatchEvent('hello', { msg: 'Hello, World!' }) // > Hello, World!
	.removeEventListener('hello', helloListener);
```
<br>

### <a name="features-firing-just-once"></a> **Firing events just once**
```ts
eventer.addEventListener('hello', helloListener, { once: true });

eventer.dispatchEvent('hello', { msg: 'Hello, World!' });
// > Hello, World!

eventer.dispatchEvent('hello', { msg: 'Hello, World!' });
// nothing is printed, no error is thrown
```
<br>

### <a name="features-fire-without-listeners"></a> **Firing events without listeners**

Doesn't throw any errors.

```ts
eventer.dispatchEvent('bye');
// nothing is printed, no error is thrown
```
<br>

### <a name="features-remove-not-added-listeners"></a> **Removing never-added listeners**

Doesn't throw any errors.

```ts
eventer.removeEventListener('hello', helloListener);
// nothing is printed, no error is thrown
```
<br>

### <a name="features-type-checking"></a> **Get a little bit of advanced (*and often confusing*) type-checking**
#### <a name="features-type-checking-adding-listeners"></a> **Adding listeners**
> Adding a listener to an event that **doesn't exist**. 

```ts
eventer.addEventListener('someEvent', helloListener);
/*                       ^^^^^^^^^^^
* error: Argument of type '"someEvent"' is not assignable to parameter of type '"hello" | "bye"'.
*/
```
<br>

> Adding a listener that **expects data** to an event that **doesn't provide** any data.
```ts
eventer.addEventListener('bye', helloListener);
/*                              ^^^^^^^^^^^^^
* error: Argument of type '({ msg }: Events['hello']) => void' is not assignable to parameter of type '() => void'.
*/
```
<br>

> Adding a listener that **expects different data** from that passed in by the event.
```ts
const someEventListener = ({ counter }: { counter: number }) => {
	console.log('The total count is: ' + counter);
}
eventer.addEventListener('hello', someEventListener);
/*                                ^^^^^^^^^^^^^^^^^
* error: Argument of type '({ counter }: { counter: number; }) => void' is not assignable to parameter of type '(data: { msg: string; }) => void'.
  Types of parameters '__0' and 'data' are incompatible.
    Property 'counter' is missing in type '{ msg: string; }' but required in type '{ counter: number; }'.
*/
```
<br>

#### <a name="features-type-checking-removing-listeners"></a> **Removing listeners**
> Removing a listener that **expects data** from an event that **doesn't provide** any data.
```ts
eventer.removeEventListener('bye', helloListener);
/*                                 ^^^^^^^^^^^^^
* error: Argument of type '({ msg }: Events['hello']) => void' is not assignable to parameter of type '() => void'.
*/
```
<br>

> Removing a listener from an event that **doesn't exist**.

```ts
eventer.removeEventListener('someEvent', helloListener);
/*                          ^^^^^^^^^^^
* error: Argument of type '"someEvent"' is not assignable to parameter of type '"hello" | "bye"'.
*/
```
<br>

#### <a name="features-type-checking-firing-events"></a> **Firing events**

> Firing an event that **requires data** *without* providing **any data**.

In this case, because **no data** is given, Typescript checks againts events that have **no data** and will show errors depending on how these events are defined:


* `Events` has **no** *dataless* events.

```ts
type Events = {
	hello: {
		msg: string
	},
	someEventWithData: {
		counter: number
	}
}

. . .

eventer.dispatchEvent('hello');
/*                    ^^^^^^^
* error: Argument of type 'string' is not assignable to parameter of type 'never'.
*/
```

* `Events` has **one or more** *dataless* events.

```ts
type Events = {
	hello: {
		msg: string
	},
	bye: { }, // first dataless event
	someEvent: { }, // second dataless event
	someEventWithData: {
		counter: number
	}
}

. . .

eventer.dispatchEvent('hello');
/*                    ^^^^^^^
* error: Argument of type '"hello"' is not assignable to parameter of type '"bye" | "someEvent"'.
*/
```

<br>

> Firing an event that **requires data** *with* **wrong data**.

```ts
eventer.dispatchEvent('hello', { total: 127 });
/*                               ^^^^^^^^^^
* error: Argument of type '{ total: number; }' is not assignable to parameter of type '{ msg: string; }'.
  Object literal may only specify known properties, and 'total' does not exist in type '{ msg: string; }'.
*/
```

<br>

> Firing an event that **doesn't need data** *with* **any data**.

In a case where data is provided — *in this case* — Typescript filters through all events where **data is required** and checks againts what was found using **event names**:

* `Events` has **no** events *with data*.

```ts
type Events = {
	bye: { },
	strangeEvent: { }
}

. . .

eventer.dispatchEvent('bye', { total: 127 });
/*                    ^^^^^         
* error: Argument of type 'string' is not assignable to parameter of type 'never'.
*/
```

* `Events` has **one or more** events *with data*.

```ts
type Events = {
	hello: { // event with data 1
		msg: string
	},
	eventWithData: { // event with data 2
		data: number
	}
	bye: { }
}

. . .

eventer.dispatchEvent('bye', { total: 127 });
/*                    ^^^^^         
* error: Argument of type '"bye"' is not assignable to parameter of type '"hello" | "eventWithData"'.
*/
```

<br>

> Firing an event that **doesn't exist**.

Typescript will search for event with a given name and show other events **with or without data** — depending on whether it was provided.

* **No data** is provided.

```ts
eventer.dispatchEvent('someEvent');
/*                    ^^^^^^^^^^^
* error: Argument of type '"someEvent"' is not assignable to parameter of type '"bye"'.
*/
```

* **Some data** is provided.

```ts
eventer.dispatchEvent('someEvent', { someData: 'beep boop' });
/*                    ^^^^^^^^^^^
* error: Argument of type '"someEvent"' is not assignable to parameter of type '"hello"'.
*/
```