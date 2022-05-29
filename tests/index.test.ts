import { Eventer } from '../src/index';

describe('firing an event with a listener', () => {
	describe('listener is called', () => {
		test('regular listener is called multiple times', () => {
			type Events = {
				helloEvent: {}
			}
	
			const eventer = new Eventer<Events>();
			const listener = jest.fn();
			eventer
				.addEventListener('helloEvent', listener)
				.dispatchEvent('helloEvent')
				.dispatchEvent('helloEvent');
	
			expect(listener).toBeCalledTimes(2);
		});
	
		test('one-time listener is called only once', () => {
			type Events = {
				helloEvent: {}
			}
	
			const eventer = new Eventer<Events>();
			const listener = jest.fn();
			eventer
				.addEventListener('helloEvent', listener, { once: true })
				.dispatchEvent('helloEvent')
				.dispatchEvent('helloEvent');
	
			expect(listener).toBeCalledTimes(1);
		});
	});

	test('data is passing to a listener', () => {
		type Events = {
			helloEvent: {
				eventData: string
			}
		}

		const helloEventData: Events['helloEvent'] = {
			eventData: 'Hello there!'
		}

		const eventer = new Eventer<Events>();
		const listener = jest.fn();
		eventer
			.addEventListener('helloEvent', listener)
			.dispatchEvent('helloEvent', helloEventData)

		expect(listener).toBeCalledWith(helloEventData);
	});
})

describe('firing an event with a listener removed', () => {
	test('listener removed BEFORE the event fires and is not called', () => {
		type Events = {
			helloEvent: {}
		}

		const eventer = new Eventer<Events>();
		const listener = jest.fn();
		eventer
			.addEventListener('helloEvent', listener)
			.removeEventListener('helloEvent', listener)
			.dispatchEvent('helloEvent')

			expect(listener).not.toBeCalled();
	})

	test('listener removed AFTER the event fires and is not called second time', () => {
		type Events = {
			helloEvent: {}
		}

		const eventer = new Eventer<Events>();
		const listener = jest.fn();
		eventer
			.addEventListener('helloEvent', listener)
			.dispatchEvent('helloEvent')
			.removeEventListener('helloEvent', listener)
			.dispatchEvent('helloEvent');

		expect(listener).toBeCalledTimes(1);
	});

	test('different listener removed from the second event and is not called when main event is fired', () => {
		type Events = {
			helloEvent: {},
			byeEvent: {}
		}
	
		const eventer = new Eventer<Events>();
		const helloListener = jest.fn();
		const byeListener = jest.fn();
		eventer
			.addEventListener('helloEvent', helloListener)
			.addEventListener('byeEvent', byeListener)
			.removeEventListener('byeEvent', byeListener)
			.dispatchEvent('helloEvent');
	
		expect(helloListener).toBeCalledTimes(1);
		expect(byeListener).not.toBeCalled();
	});

	test('one of the listeners removed and another one is not called twice', () => {
		type Events = {
			helloEvent: {},
		}
	
		const eventer = new Eventer<Events>();
		const listenerFirst = jest.fn();
		const listenerSecond = jest.fn();
		eventer
			.addEventListener('helloEvent', listenerFirst)
			.addEventListener('helloEvent', listenerSecond)
			.removeEventListener('helloEvent', listenerFirst)
			.dispatchEvent('helloEvent');
	
		expect(listenerFirst).not.toBeCalled();
	});

	describe('listener that wasn\'t added is removed and no error is thrown', () => {
		test('there ISN\'T a listener added beforehand', () => {
			type Events = {
				helloEvent: {}
			}
		
			const eventer = new Eventer<Events>();
			const listener = jest.fn();
			const fn = () => eventer.removeEventListener('helloEvent', listener);
		
			expect(fn).not.toThrow();
		});

		test('there IS another listener added beforehand', () => {
			type Events = {
				helloEvent: {}
			}
		
			const eventer = new Eventer<Events>();
			const listenerToAdd = jest.fn();
			eventer.addEventListener('helloEvent', listenerToAdd);
			const listenerToNotAdd = jest.fn();

			const fn = () => eventer.removeEventListener('helloEvent', listenerToNotAdd);
		
			expect(fn).not.toThrow();
		});
	})
});

describe('firing an event with no listeners', () => {
	test('there is a listener for another event and it\'s not called', () => {
		type Events = {
			helloEvent: {},
			byeEvent: {}
		}
	
		const eventer = new Eventer<Events>();
		const listener = jest.fn();
		eventer
			.addEventListener('helloEvent', listener)
			.dispatchEvent('byeEvent');
	
		expect(listener).not.toBeCalled();
	});
})

describe('type checking', () => {
	describe('valid', () => {
		type MyEvents = {
			eventWithData: {
				msg: string
			},
			eventWithoutData: { }
		}

		let eventer: Eventer<MyEvents>;
		const listenerMsg = 'Hello world!';
		const listenerWithData = ({ msg }: MyEvents['eventWithData']) => {
			console.log(msg);
		}
		const listenerWithoutData = () => {
			console.log(listenerMsg);
		}

		test('Eventer initialization', () => {
			eventer	= new Eventer<MyEvents>();
		});

		describe('methods', () => {
			beforeEach(() => {
				eventer = new Eventer<MyEvents>();
			});

			test('adding a listener', () => {
				eventer.addEventListener('eventWithData', listenerWithData);
				eventer.addEventListener('eventWithData', listenerWithoutData);
				eventer.addEventListener('eventWithoutData', listenerWithoutData);
			});

			test('removing a listener', () => {
				eventer.removeEventListener('eventWithData', listenerWithData);
				eventer.removeEventListener('eventWithData', listenerWithoutData);
				eventer.removeEventListener('eventWithoutData', listenerWithoutData);
			});

			test('dispatching an event', () => {
				eventer.dispatchEvent('eventWithData', { msg: listenerMsg });
				eventer.dispatchEvent('eventWithoutData');
			});
		});
	});

	describe('invalid', () => { 
		type MyEvents = {
			eventWithData: {
				msg: string
			},
			eventWithoutData: { }
		}

		let eventer: Eventer<MyEvents>;
		const listenerMsg = 'Hello world!';
		const listenerWithData = ({ msg }: MyEvents['eventWithData']) => {
			console.log(msg);
		}
		const listenerWithDifferentData = (total: number) => {
			console.log(total);
		}
		const listenerWithoutData = () => {
			console.log(listenerMsg);
		}

		describe('Eventer initialization', () => {
			test('without specifying type', () => {
				// TODO: should give error
				eventer	= new Eventer();
			});

			test('with the empty object type', () => {
				// TODO: should give error
				eventer	= new Eventer<{ }>();
			});
		});

		describe('methods', () => {
			beforeEach(() => {
				eventer = new Eventer<MyEvents>();
			});

			describe('adding a listener', () => {
				test('to an event that doesn\'t exist', () => {
					// @ts-expect-error
					eventer.addEventListener('someEvent', listenerWithoutData);
				});

				describe('a listener WITH data in its type', () => {
					test('to an event WITHOUT any data in its type', () => {
						// @ts-expect-error
						eventer.addEventListener('eventWithoutData', listenerWithData);
					});

					test('to an event WITH a DIFFERENT data in its type', () => {
						// @ts-expect-error
						eventer.addEventListener('eventWithoutData', listenerWithDifferentData);
					});
				});
			});

			describe('removing a listener', () => {
				test('a listener WITH data in its type from an event WITHOUT any data in its type', () => {
					// @ts-expect-error
					eventer.removeEventListener('eventWithoutData', listenerWithData);
				})
				
				test('from an event that doesn\'t exist', () => {
					// @ts-expect-error
					eventer.removeEventListener('someEvent', listenerWithoutData);
				});
			});

			describe('dispatching an event', () => {
				describe('an event that REQUIRES data', () => {
					test('WITHOUT data', () => {
						// @ts-expect-error
						eventer.dispatchEvent('eventWithData');
					});

					test('WITH WRONG data', () => {
						// @ts-expect-error
						eventer.dispatchEvent('eventWithData', { total: 127 });
					})
				});

				describe('an event that DOESN\'T NEED data', () => {
					test('WITH data', () => {
						// @ts-expect-error
						eventer.dispatchEvent('eventWithoutData', { total: 127 });
					});
				});

				describe('that doesn\'t exists', () => {
					test('WITHOUT data', () => {
						// @ts-expect-error
						eventer.dispatchEvent('someEvent');
					});

					test('WITH data', () => {
						// @ts-expect-error
						eventer.dispatchEvent('someEvent', { msg: 'hello world' });
					});
				});
			});
		});
	});
});
