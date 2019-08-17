"use strict";

var isPrototype = require("../prototype/is");

var objectToString = Object.prototype.toString
  , objectTaggedString = objectToString.call(new Error());

module.exports = function (value) {
	if (!value) return false;

	// Sanity check (reject objects which do not expose common Error interface)
	try {
		if (typeof value.message !== "string") return false;
	} catch (error) {
		return false;
	}

	// Ensure its native Error object (has [[ErrorData]] slot)
	// Note: it's not 100% precise as string tag may be overriden
	// and other objects can be hacked to expose it
	if (objectToString.call(value) !== objectTaggedString) return false;

	return !isPrototype(value);
};
