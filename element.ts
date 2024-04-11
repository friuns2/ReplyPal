




/**
 * Sets the value of an element and triggers an "Enter" keydown event.
 * @class Element
 * @method SetValue
 * @param {string} name - The value to set on the element.
 * @param {boolean} enter - Whether or not to trigger an "Enter" keydown event.
 */
interface Element {SetValue (name: string, enter?: boolean): Promise<void>;}
