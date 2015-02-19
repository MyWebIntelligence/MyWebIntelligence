// "use strict"; // apparently cannot delete __proto__ in strict mode?

delete Object.prototype.__proto__; // This does nothing as of Node 0.10 -_-#