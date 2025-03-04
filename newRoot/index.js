var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all2) => {
  for (var name3 in all2)
    __defProp(target, name3, { get: all2[name3], enumerable: true });
};
var __copyProps = (to, from3, except, desc) => {
  if (from3 && typeof from3 === "object" || typeof from3 === "function") {
    for (let key of __getOwnPropNames(from3))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from3[key], enumerable: !(desc = __getOwnPropDesc(from3, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// ../../node_modules/hashlru/index.js
var require_hashlru = __commonJS({
  "../../node_modules/hashlru/index.js"(exports, module) {
    module.exports = function(max) {
      if (!max) throw Error("hashlru must have a max value, of type number, greater than 0");
      var size = 0, cache3 = /* @__PURE__ */ Object.create(null), _cache = /* @__PURE__ */ Object.create(null);
      function update2(key, value) {
        cache3[key] = value;
        size++;
        if (size >= max) {
          size = 0;
          _cache = cache3;
          cache3 = /* @__PURE__ */ Object.create(null);
        }
      }
      return {
        has: function(key) {
          return cache3[key] !== void 0 || _cache[key] !== void 0;
        },
        remove: function(key) {
          if (cache3[key] !== void 0)
            cache3[key] = void 0;
          if (_cache[key] !== void 0)
            _cache[key] = void 0;
        },
        get: function(key) {
          var v = cache3[key];
          if (v !== void 0) return v;
          if ((v = _cache[key]) !== void 0) {
            update2(key, v);
            return v;
          }
        },
        set: function(key, value) {
          if (cache3[key] !== void 0) cache3[key] = value;
          else update2(key, value);
        },
        clear: function() {
          cache3 = /* @__PURE__ */ Object.create(null);
          _cache = /* @__PURE__ */ Object.create(null);
        }
      };
    };
  }
});

// ../../node_modules/merge-options/node_modules/is-plain-obj/index.js
var require_is_plain_obj = __commonJS({
  "../../node_modules/merge-options/node_modules/is-plain-obj/index.js"(exports, module) {
    "use strict";
    module.exports = (value) => {
      if (Object.prototype.toString.call(value) !== "[object Object]") {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return prototype === null || prototype === Object.prototype;
    };
  }
});

// ../../node_modules/merge-options/index.js
var require_merge_options = __commonJS({
  "../../node_modules/merge-options/index.js"(exports, module) {
    "use strict";
    var isOptionObject = require_is_plain_obj();
    var { hasOwnProperty } = Object.prototype;
    var { propertyIsEnumerable } = Object;
    var defineProperty = (object, name3, value) => Object.defineProperty(object, name3, {
      value,
      writable: true,
      enumerable: true,
      configurable: true
    });
    var globalThis2 = exports;
    var defaultMergeOptions = {
      concatArrays: false,
      ignoreUndefined: false
    };
    var getEnumerableOwnPropertyKeys = (value) => {
      const keys = [];
      for (const key in value) {
        if (hasOwnProperty.call(value, key)) {
          keys.push(key);
        }
      }
      if (Object.getOwnPropertySymbols) {
        const symbols = Object.getOwnPropertySymbols(value);
        for (const symbol3 of symbols) {
          if (propertyIsEnumerable.call(value, symbol3)) {
            keys.push(symbol3);
          }
        }
      }
      return keys;
    };
    function clone(value) {
      if (Array.isArray(value)) {
        return cloneArray(value);
      }
      if (isOptionObject(value)) {
        return cloneOptionObject(value);
      }
      return value;
    }
    function cloneArray(array) {
      const result = array.slice(0, 0);
      getEnumerableOwnPropertyKeys(array).forEach((key) => {
        defineProperty(result, key, clone(array[key]));
      });
      return result;
    }
    function cloneOptionObject(object) {
      const result = Object.getPrototypeOf(object) === null ? /* @__PURE__ */ Object.create(null) : {};
      getEnumerableOwnPropertyKeys(object).forEach((key) => {
        defineProperty(result, key, clone(object[key]));
      });
      return result;
    }
    var mergeKeys = (merged, source, keys, config) => {
      keys.forEach((key) => {
        if (typeof source[key] === "undefined" && config.ignoreUndefined) {
          return;
        }
        if (key in merged && merged[key] !== Object.getPrototypeOf(merged)) {
          defineProperty(merged, key, merge2(merged[key], source[key], config));
        } else {
          defineProperty(merged, key, clone(source[key]));
        }
      });
      return merged;
    };
    var concatArrays = (merged, source, config) => {
      let result = merged.slice(0, 0);
      let resultIndex = 0;
      [merged, source].forEach((array) => {
        const indices = [];
        for (let k = 0; k < array.length; k++) {
          if (!hasOwnProperty.call(array, k)) {
            continue;
          }
          indices.push(String(k));
          if (array === merged) {
            defineProperty(result, resultIndex++, array[k]);
          } else {
            defineProperty(result, resultIndex++, clone(array[k]));
          }
        }
        result = mergeKeys(result, array, getEnumerableOwnPropertyKeys(array).filter((key) => !indices.includes(key)), config);
      });
      return result;
    };
    function merge2(merged, source, config) {
      if (config.concatArrays && Array.isArray(merged) && Array.isArray(source)) {
        return concatArrays(merged, source, config);
      }
      if (!isOptionObject(source) || !isOptionObject(merged)) {
        return clone(source);
      }
      return mergeKeys(merged, source, getEnumerableOwnPropertyKeys(source), config);
    }
    module.exports = function(...options) {
      const config = merge2(clone(defaultMergeOptions), this !== globalThis2 && this || {}, defaultMergeOptions);
      let merged = { _: {} };
      for (const option of options) {
        if (option === void 0) {
          continue;
        }
        if (!isOptionObject(option)) {
          throw new TypeError("`" + option + "` is not an Option Object");
        }
        merged = merge2(merged, { _: option }, config);
      }
      return merged._;
    };
  }
});

// ../../node_modules/retry/lib/retry_operation.js
var require_retry_operation = __commonJS({
  "../../node_modules/retry/lib/retry_operation.js"(exports, module) {
    function RetryOperation(timeouts, options) {
      if (typeof options === "boolean") {
        options = { forever: options };
      }
      this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
      this._timeouts = timeouts;
      this._options = options || {};
      this._maxRetryTime = options && options.maxRetryTime || Infinity;
      this._fn = null;
      this._errors = [];
      this._attempts = 1;
      this._operationTimeout = null;
      this._operationTimeoutCb = null;
      this._timeout = null;
      this._operationStart = null;
      this._timer = null;
      if (this._options.forever) {
        this._cachedTimeouts = this._timeouts.slice(0);
      }
    }
    module.exports = RetryOperation;
    RetryOperation.prototype.reset = function() {
      this._attempts = 1;
      this._timeouts = this._originalTimeouts.slice(0);
    };
    RetryOperation.prototype.stop = function() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (this._timer) {
        clearTimeout(this._timer);
      }
      this._timeouts = [];
      this._cachedTimeouts = null;
    };
    RetryOperation.prototype.retry = function(err) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (!err) {
        return false;
      }
      var currentTime = (/* @__PURE__ */ new Date()).getTime();
      if (err && currentTime - this._operationStart >= this._maxRetryTime) {
        this._errors.push(err);
        this._errors.unshift(new Error("RetryOperation timeout occurred"));
        return false;
      }
      this._errors.push(err);
      var timeout = this._timeouts.shift();
      if (timeout === void 0) {
        if (this._cachedTimeouts) {
          this._errors.splice(0, this._errors.length - 1);
          timeout = this._cachedTimeouts.slice(-1);
        } else {
          return false;
        }
      }
      var self2 = this;
      this._timer = setTimeout(function() {
        self2._attempts++;
        if (self2._operationTimeoutCb) {
          self2._timeout = setTimeout(function() {
            self2._operationTimeoutCb(self2._attempts);
          }, self2._operationTimeout);
          if (self2._options.unref) {
            self2._timeout.unref();
          }
        }
        self2._fn(self2._attempts);
      }, timeout);
      if (this._options.unref) {
        this._timer.unref();
      }
      return true;
    };
    RetryOperation.prototype.attempt = function(fn, timeoutOps) {
      this._fn = fn;
      if (timeoutOps) {
        if (timeoutOps.timeout) {
          this._operationTimeout = timeoutOps.timeout;
        }
        if (timeoutOps.cb) {
          this._operationTimeoutCb = timeoutOps.cb;
        }
      }
      var self2 = this;
      if (this._operationTimeoutCb) {
        this._timeout = setTimeout(function() {
          self2._operationTimeoutCb();
        }, self2._operationTimeout);
      }
      this._operationStart = (/* @__PURE__ */ new Date()).getTime();
      this._fn(this._attempts);
    };
    RetryOperation.prototype.try = function(fn) {
      console.log("Using RetryOperation.try() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = function(fn) {
      console.log("Using RetryOperation.start() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = RetryOperation.prototype.try;
    RetryOperation.prototype.errors = function() {
      return this._errors;
    };
    RetryOperation.prototype.attempts = function() {
      return this._attempts;
    };
    RetryOperation.prototype.mainError = function() {
      if (this._errors.length === 0) {
        return null;
      }
      var counts = {};
      var mainError = null;
      var mainErrorCount = 0;
      for (var i = 0; i < this._errors.length; i++) {
        var error = this._errors[i];
        var message2 = error.message;
        var count = (counts[message2] || 0) + 1;
        counts[message2] = count;
        if (count >= mainErrorCount) {
          mainError = error;
          mainErrorCount = count;
        }
      }
      return mainError;
    };
  }
});

// ../../node_modules/retry/lib/retry.js
var require_retry = __commonJS({
  "../../node_modules/retry/lib/retry.js"(exports) {
    var RetryOperation = require_retry_operation();
    exports.operation = function(options) {
      var timeouts = exports.timeouts(options);
      return new RetryOperation(timeouts, {
        forever: options && (options.forever || options.retries === Infinity),
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime
      });
    };
    exports.timeouts = function(options) {
      if (options instanceof Array) {
        return [].concat(options);
      }
      var opts = {
        retries: 10,
        factor: 2,
        minTimeout: 1 * 1e3,
        maxTimeout: Infinity,
        randomize: false
      };
      for (var key in options) {
        opts[key] = options[key];
      }
      if (opts.minTimeout > opts.maxTimeout) {
        throw new Error("minTimeout is greater than maxTimeout");
      }
      var timeouts = [];
      for (var i = 0; i < opts.retries; i++) {
        timeouts.push(this.createTimeout(i, opts));
      }
      if (options && options.forever && !timeouts.length) {
        timeouts.push(this.createTimeout(i, opts));
      }
      timeouts.sort(function(a, b) {
        return a - b;
      });
      return timeouts;
    };
    exports.createTimeout = function(attempt, opts) {
      var random = opts.randomize ? Math.random() + 1 : 1;
      var timeout = Math.round(random * Math.max(opts.minTimeout, 1) * Math.pow(opts.factor, attempt));
      timeout = Math.min(timeout, opts.maxTimeout);
      return timeout;
    };
    exports.wrap = function(obj, options, methods) {
      if (options instanceof Array) {
        methods = options;
        options = null;
      }
      if (!methods) {
        methods = [];
        for (var key in obj) {
          if (typeof obj[key] === "function") {
            methods.push(key);
          }
        }
      }
      for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        var original = obj[method];
        obj[method] = function retryWrapper(original2) {
          var op = exports.operation(options);
          var args = Array.prototype.slice.call(arguments, 1);
          var callback = args.pop();
          args.push(function(err) {
            if (op.retry(err)) {
              return;
            }
            if (err) {
              arguments[0] = op.mainError();
            }
            callback.apply(this, arguments);
          });
          op.attempt(function() {
            original2.apply(obj, args);
          });
        }.bind(obj, original);
        obj[method].options = options;
      }
    };
  }
});

// ../../node_modules/retry/index.js
var require_retry2 = __commonJS({
  "../../node_modules/retry/index.js"(exports, module) {
    module.exports = require_retry();
  }
});

// ../../node_modules/@chainsafe/as-chacha20poly1305/lib/common/const.js
var require_const = __commonJS({
  "../../node_modules/@chainsafe/as-chacha20poly1305/lib/common/const.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TAG_LENGTH = exports.DATA_CHUNK_LENGTH = exports.NONCE_LENGTH = exports.KEY_LENGTH = void 0;
    exports.KEY_LENGTH = 32;
    exports.NONCE_LENGTH = 12;
    exports.DATA_CHUNK_LENGTH = 65536;
    exports.TAG_LENGTH = 16;
  }
});

// ../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/chacha20poly1305.js
var require_chacha20poly1305 = __commonJS({
  "../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/chacha20poly1305.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChaCha20Poly1305 = void 0;
    var const_1 = require_const();
    var ChaCha20Poly13052 = class {
      constructor(ctx3) {
        this.ctx = ctx3;
        const wasmKeyValue = ctx3.cpKey.value;
        this.wasmKeyArr = new Uint8Array(ctx3.memory.buffer, wasmKeyValue, const_1.KEY_LENGTH);
        const wasmNonceValue = ctx3.cpNonce.value;
        this.wasmNonceArr = new Uint8Array(ctx3.memory.buffer, wasmNonceValue, const_1.NONCE_LENGTH);
        const wasmAdValue = ctx3.cpAssociatedData.value;
        this.wasmAdArr = new Uint8Array(ctx3.memory.buffer, wasmAdValue, const_1.KEY_LENGTH);
        const wasmSealedValue = ctx3.cpInput.value;
        this.wasmInputArr = new Uint8Array(ctx3.memory.buffer, wasmSealedValue, const_1.DATA_CHUNK_LENGTH);
        const wasmChacha20OutputValue = ctx3.chacha20Output.value;
        this.wasmChacha20OutputArr = new Uint8Array(ctx3.memory.buffer, wasmChacha20OutputValue, const_1.DATA_CHUNK_LENGTH);
        const wasmPoly1305OutputValue = ctx3.poly1305Output.value;
        this.wasmPoly1305OutputArr = new Uint8Array(ctx3.memory.buffer, wasmPoly1305OutputValue, const_1.TAG_LENGTH);
        const wasmDebugValue = ctx3.debug.value;
        this.wasmDebugArr = new Uint32Array(ctx3.memory.buffer, wasmDebugValue, 64);
      }
      /**
       * Encode function
       */
      seal(key, nonce, plaintext, associatedData, dst) {
        this.init(key, nonce, associatedData);
        const resultLength = plaintext.length + const_1.TAG_LENGTH;
        let result;
        if (dst) {
          if (dst.length !== resultLength) {
            throw new Error("ChaCha20Poly1305: incorrect destination length");
          }
          result = dst;
        } else {
          result = new Uint8Array(resultLength);
        }
        const asDataLength = associatedData?.length ?? 0;
        this.sealUpdate(plaintext, asDataLength, result);
        result.set(this.wasmPoly1305OutputArr, plaintext.length);
        return result;
      }
      /**
       * Decode function
       */
      open(key, nonce, sealed, associatedData, dst) {
        this.init(key, nonce, associatedData);
        const sealedNoTag = sealed.subarray(0, sealed.length - const_1.TAG_LENGTH);
        let result;
        if (dst) {
          if (dst.length !== sealedNoTag.length) {
            throw new Error("ChaCha20Poly1305: incorrect destination length");
          }
          result = dst;
        } else {
          result = new Uint8Array(sealedNoTag.length);
        }
        const asDataLength = associatedData?.length ?? 0;
        this.openUpdate(sealedNoTag, asDataLength, result);
        const tag = sealed.subarray(sealed.length - const_1.TAG_LENGTH, sealed.length);
        const isTagValid = this.isSameTag(tag);
        return isTagValid ? result : null;
      }
      init(key, nonce, ad = new Uint8Array(0)) {
        if (key.length != const_1.KEY_LENGTH) {
          throw Error(`Invalid chacha20poly1305 key length ${key.length}, expect ${const_1.KEY_LENGTH}`);
        }
        if (ad.length > const_1.KEY_LENGTH) {
          throw Error(`Invalid ad length ${ad.length}, expect <= ${const_1.KEY_LENGTH}`);
        }
        if (nonce.length !== const_1.NONCE_LENGTH) {
          throw Error(`Invalid nonce length ${nonce.length}, expect ${const_1.NONCE_LENGTH}`);
        }
        this.wasmKeyArr.set(key);
        this.wasmNonceArr.set(nonce);
        this.wasmAdArr.set(ad);
      }
      openUpdate(data, asDataLength, dst) {
        this.commonUpdate(data, this.ctx.openUpdate, asDataLength, dst);
      }
      sealUpdate(data, asDataLength, dst) {
        this.commonUpdate(data, this.ctx.sealUpdate, asDataLength, dst);
      }
      commonUpdate(data, updateFn, asDataLength, dst) {
        const length3 = data.length;
        if (data.length <= const_1.DATA_CHUNK_LENGTH) {
          this.wasmInputArr.set(data);
          updateFn(true, true, length3, length3, asDataLength);
          dst.set(length3 === const_1.DATA_CHUNK_LENGTH ? this.wasmChacha20OutputArr : this.wasmChacha20OutputArr.subarray(0, length3));
          return;
        }
        for (let offset = 0; offset < length3; offset += const_1.DATA_CHUNK_LENGTH) {
          const end = Math.min(length3, offset + const_1.DATA_CHUNK_LENGTH);
          this.wasmInputArr.set(data.subarray(offset, end));
          const isFirst = offset === 0;
          const isLast = offset + const_1.DATA_CHUNK_LENGTH >= length3;
          updateFn(isFirst, isLast, end - offset, length3, asDataLength);
          dst.set(end - offset === const_1.DATA_CHUNK_LENGTH ? this.wasmChacha20OutputArr : this.wasmChacha20OutputArr.subarray(0, end - offset), offset);
        }
      }
      isSameTag(tag) {
        let isSameTag = true;
        for (let i = 0; i < const_1.TAG_LENGTH; i++) {
          if (this.wasmPoly1305OutputArr[i] !== tag[i]) {
            isSameTag = false;
            break;
          }
        }
        return isSameTag;
      }
    };
    exports.ChaCha20Poly1305 = ChaCha20Poly13052;
  }
});

// ../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/poly1305.js
var require_poly1305 = __commonJS({
  "../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/poly1305.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Poly1305 = void 0;
    var const_1 = require_const();
    var Poly13052 = class {
      constructor(ctx3) {
        this.ctx = ctx3;
        const wasmPoly1305KeyValue = ctx3.poly1305Key.value;
        this.wasmKeyArr = new Uint8Array(ctx3.memory.buffer, wasmPoly1305KeyValue, const_1.KEY_LENGTH);
        const wasmPoly1305InputValue = ctx3.poly1305Input.value;
        this.wasmInputArr = new Uint8Array(ctx3.memory.buffer, wasmPoly1305InputValue, const_1.DATA_CHUNK_LENGTH);
        const wasmPoly1305OutputValue = ctx3.poly1305Output.value;
        this.wasmOutputArr = new Uint8Array(ctx3.memory.buffer, wasmPoly1305OutputValue, const_1.TAG_LENGTH);
        const wasmPoly1305DebugValue = ctx3.debug.value;
        this.wasmDebugArr = new Uint32Array(ctx3.memory.buffer, wasmPoly1305DebugValue, 64);
      }
      init(key) {
        if (key.length != const_1.KEY_LENGTH) {
          throw Error(`Invalid poly1305 key length ${key.length}, expect ${const_1.KEY_LENGTH}`);
        }
        this.wasmKeyArr.set(key);
        this.ctx.poly1305Init();
      }
      update(data) {
        if (data.length <= const_1.DATA_CHUNK_LENGTH) {
          this.wasmInputArr.set(data);
          this.ctx.poly1305Update(data.length);
          return;
        }
        for (let offset = 0; offset < data.length; offset += const_1.DATA_CHUNK_LENGTH) {
          const end = Math.min(data.length, offset + const_1.DATA_CHUNK_LENGTH);
          this.wasmInputArr.set(data.subarray(offset, end));
          this.ctx.poly1305Update(end - offset);
        }
      }
      digest() {
        this.ctx.poly1305Digest();
        const out = new Uint8Array(const_1.TAG_LENGTH);
        out.set(this.wasmOutputArr);
        return out;
      }
    };
    exports.Poly1305 = Poly13052;
  }
});

// ../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/wasmCode.js
var require_wasmCode = __commonJS({
  "../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/wasmCode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.wasmCode = void 0;
    exports.wasmCode = Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0, 1, 58, 10, 96, 0, 0, 96, 2, 127, 127, 0, 96, 1, 127, 0, 96, 3, 127, 127, 127, 0, 96, 1, 127, 1, 127, 96, 4, 127, 127, 127, 127, 0, 96, 5, 127, 127, 127, 127, 127, 0, 96, 0, 1, 127, 96, 2, 127, 127, 1, 127, 96, 5, 127, 127, 127, 127, 127, 1, 127, 2, 13, 1, 3, 101, 110, 118, 5, 97, 98, 111, 114, 116, 0, 5, 3, 34, 33, 2, 8, 1, 4, 0, 4, 7, 0, 0, 3, 3, 2, 1, 9, 4, 2, 0, 3, 1, 2, 2, 1, 0, 0, 0, 5, 1, 1, 1, 6, 1, 6, 0, 5, 3, 1, 0, 1, 6, 238, 1, 47, 127, 0, 65, 32, 11, 127, 0, 65, 16, 11, 127, 0, 65, 128, 128, 4, 11, 127, 0, 65, 16, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 7, 226, 2, 23, 6, 109, 101, 109, 111, 114, 121, 2, 0, 21, 67, 72, 65, 67, 72, 65, 50, 48, 95, 73, 78, 80, 85, 84, 95, 76, 69, 78, 71, 84, 72, 3, 2, 23, 67, 72, 65, 67, 72, 65, 50, 48, 95, 67, 79, 85, 78, 84, 69, 82, 95, 76, 69, 78, 71, 84, 72, 3, 3, 13, 99, 104, 97, 99, 104, 97, 50, 48, 73, 110, 112, 117, 116, 3, 6, 11, 99, 104, 97, 99, 104, 97, 50, 48, 75, 101, 121, 3, 8, 15, 99, 104, 97, 99, 104, 97, 50, 48, 67, 111, 117, 110, 116, 101, 114, 3, 10, 14, 99, 104, 97, 99, 104, 97, 50, 48, 79, 117, 116, 112, 117, 116, 3, 12, 23, 99, 104, 97, 99, 104, 97, 50, 48, 83, 116, 114, 101, 97, 109, 88, 79, 82, 85, 112, 100, 97, 116, 101, 0, 15, 10, 75, 69, 89, 95, 76, 69, 78, 71, 84, 72, 3, 0, 10, 84, 65, 71, 95, 76, 69, 78, 71, 84, 72, 3, 1, 12, 112, 111, 108, 121, 49, 51, 48, 53, 73, 110, 105, 116, 0, 17, 14, 112, 111, 108, 121, 49, 51, 48, 53, 85, 112, 100, 97, 116, 101, 0, 20, 14, 112, 111, 108, 121, 49, 51, 48, 53, 68, 105, 103, 101, 115, 116, 0, 24, 13, 112, 111, 108, 121, 49, 51, 48, 53, 73, 110, 112, 117, 116, 3, 19, 11, 112, 111, 108, 121, 49, 51, 48, 53, 75, 101, 121, 3, 18, 14, 112, 111, 108, 121, 49, 51, 48, 53, 79, 117, 116, 112, 117, 116, 3, 20, 10, 111, 112, 101, 110, 85, 112, 100, 97, 116, 101, 0, 30, 10, 115, 101, 97, 108, 85, 112, 100, 97, 116, 101, 0, 32, 5, 99, 112, 75, 101, 121, 3, 37, 7, 99, 112, 78, 111, 110, 99, 101, 3, 39, 7, 99, 112, 73, 110, 112, 117, 116, 3, 43, 16, 99, 112, 65, 115, 115, 111, 99, 105, 97, 116, 101, 100, 68, 97, 116, 97, 3, 41, 5, 100, 101, 98, 117, 103, 3, 46, 8, 1, 33, 10, 195, 47, 33, 70, 1, 2, 127, 32, 0, 63, 0, 34, 2, 65, 16, 116, 34, 1, 75, 4, 64, 32, 2, 32, 0, 32, 1, 107, 65, 255, 255, 3, 106, 65, 128, 128, 124, 113, 65, 16, 118, 34, 1, 32, 2, 32, 1, 74, 27, 64, 0, 65, 0, 72, 4, 64, 32, 1, 64, 0, 65, 0, 72, 4, 64, 0, 11, 11, 11, 32, 0, 36, 5, 11, 82, 1, 3, 127, 32, 0, 65, 240, 255, 255, 255, 3, 75, 4, 64, 0, 11, 35, 5, 65, 16, 106, 34, 3, 32, 0, 65, 15, 106, 65, 112, 113, 34, 2, 65, 16, 32, 2, 65, 16, 75, 27, 34, 4, 106, 16, 1, 32, 3, 65, 16, 107, 34, 2, 32, 4, 54, 2, 0, 32, 2, 65, 1, 54, 2, 4, 32, 2, 32, 1, 54, 2, 8, 32, 2, 32, 0, 54, 2, 12, 32, 3, 11, 37, 1, 1, 127, 3, 64, 32, 1, 4, 64, 32, 0, 34, 2, 65, 1, 106, 33, 0, 32, 2, 65, 0, 58, 0, 0, 32, 1, 65, 1, 107, 33, 1, 12, 1, 11, 11, 11, 42, 1, 1, 127, 32, 0, 65, 240, 255, 255, 255, 3, 75, 4, 64, 65, 32, 65, 208, 0, 65, 54, 65, 42, 16, 0, 0, 11, 32, 0, 65, 0, 16, 2, 34, 1, 32, 0, 16, 3, 32, 1, 11, 67, 0, 65, 128, 3, 36, 4, 65, 128, 3, 36, 5, 65, 128, 128, 4, 16, 4, 36, 6, 35, 6, 36, 7, 65, 32, 16, 4, 36, 8, 35, 8, 36, 9, 65, 16, 16, 4, 36, 10, 35, 10, 36, 11, 65, 128, 128, 4, 16, 4, 36, 12, 35, 12, 36, 13, 65, 192, 0, 16, 4, 36, 14, 35, 14, 36, 15, 11, 83, 1, 1, 127, 65, 128, 2, 65, 0, 16, 2, 34, 1, 65, 128, 2, 16, 3, 32, 0, 69, 4, 64, 65, 12, 65, 2, 16, 2, 33, 0, 11, 32, 0, 65, 0, 54, 2, 0, 32, 0, 65, 0, 54, 2, 4, 32, 0, 65, 0, 54, 2, 8, 32, 0, 40, 2, 0, 26, 32, 0, 32, 1, 54, 2, 0, 32, 0, 32, 1, 54, 2, 4, 32, 0, 65, 128, 2, 54, 2, 8, 32, 0, 11, 10, 0, 65, 12, 65, 3, 16, 2, 16, 6, 11, 95, 0, 16, 7, 36, 16, 35, 16, 40, 2, 0, 36, 17, 65, 32, 16, 4, 36, 18, 65, 128, 128, 4, 16, 4, 36, 19, 65, 16, 16, 4, 36, 20, 35, 18, 36, 21, 35, 19, 36, 22, 35, 20, 36, 23, 65, 16, 16, 4, 36, 24, 35, 24, 36, 25, 65, 20, 16, 4, 36, 26, 35, 26, 36, 27, 65, 20, 16, 4, 36, 28, 35, 28, 36, 29, 65, 16, 16, 4, 36, 30, 35, 30, 36, 31, 65, 20, 16, 4, 36, 35, 35, 35, 36, 36, 11, 55, 0, 65, 32, 16, 4, 36, 37, 35, 37, 36, 38, 65, 12, 16, 4, 36, 39, 35, 39, 36, 40, 65, 32, 16, 4, 36, 41, 35, 41, 36, 42, 65, 128, 128, 4, 16, 4, 36, 43, 35, 43, 36, 44, 16, 7, 36, 45, 35, 45, 40, 2, 0, 36, 46, 11, 22, 0, 32, 1, 32, 2, 65, 255, 1, 113, 65, 4, 110, 65, 2, 116, 106, 32, 0, 54, 2, 0, 11, 188, 6, 1, 31, 127, 65, 229, 240, 193, 139, 6, 33, 5, 65, 238, 200, 129, 153, 3, 33, 6, 65, 178, 218, 136, 203, 7, 33, 14, 65, 244, 202, 129, 217, 6, 33, 7, 32, 2, 40, 2, 0, 34, 19, 33, 4, 32, 2, 65, 4, 106, 40, 2, 0, 34, 20, 33, 8, 32, 2, 65, 8, 106, 40, 2, 0, 34, 21, 33, 3, 32, 2, 65, 12, 106, 40, 2, 0, 34, 22, 33, 13, 32, 2, 65, 16, 106, 40, 2, 0, 34, 23, 33, 15, 32, 2, 65, 20, 106, 40, 2, 0, 34, 24, 33, 9, 32, 2, 65, 24, 106, 40, 2, 0, 34, 25, 33, 10, 32, 2, 65, 28, 106, 40, 2, 0, 34, 26, 33, 2, 32, 1, 40, 2, 0, 34, 27, 33, 11, 32, 1, 65, 4, 106, 40, 2, 0, 34, 28, 33, 16, 32, 1, 65, 8, 106, 40, 2, 0, 34, 29, 33, 12, 32, 1, 65, 12, 106, 40, 2, 0, 34, 30, 33, 1, 3, 64, 32, 18, 65, 20, 72, 4, 64, 32, 3, 32, 10, 32, 12, 32, 3, 32, 14, 106, 34, 3, 115, 65, 16, 119, 34, 14, 106, 34, 10, 115, 65, 12, 119, 34, 12, 32, 10, 32, 14, 32, 3, 32, 12, 106, 34, 3, 115, 65, 8, 119, 34, 14, 106, 34, 10, 115, 33, 12, 32, 13, 32, 2, 32, 1, 32, 7, 32, 13, 106, 34, 1, 115, 65, 16, 119, 34, 2, 106, 34, 13, 115, 65, 12, 119, 34, 7, 32, 13, 32, 2, 32, 1, 32, 7, 106, 34, 13, 115, 65, 8, 119, 34, 1, 106, 34, 2, 115, 33, 7, 32, 4, 32, 15, 32, 11, 32, 4, 32, 5, 106, 34, 4, 115, 65, 16, 119, 34, 5, 106, 34, 15, 115, 65, 12, 119, 34, 11, 32, 15, 32, 5, 32, 4, 32, 11, 106, 34, 4, 115, 65, 8, 119, 34, 5, 106, 34, 15, 115, 33, 11, 32, 10, 32, 1, 32, 8, 32, 9, 32, 16, 32, 6, 32, 8, 106, 34, 1, 115, 65, 16, 119, 34, 8, 106, 34, 6, 115, 65, 12, 119, 34, 9, 32, 6, 32, 8, 32, 1, 32, 9, 106, 34, 1, 115, 65, 8, 119, 34, 6, 106, 34, 9, 115, 65, 7, 119, 34, 10, 32, 4, 106, 34, 17, 115, 65, 16, 119, 34, 31, 106, 33, 8, 32, 2, 32, 5, 32, 12, 65, 7, 119, 34, 5, 32, 1, 106, 34, 32, 115, 65, 16, 119, 34, 33, 106, 33, 1, 32, 9, 32, 14, 32, 13, 32, 11, 65, 7, 119, 34, 9, 106, 34, 11, 115, 65, 16, 119, 34, 12, 106, 33, 4, 32, 15, 32, 6, 32, 3, 32, 7, 65, 7, 119, 34, 3, 106, 34, 6, 115, 65, 16, 119, 34, 7, 106, 34, 2, 32, 6, 32, 2, 32, 3, 115, 65, 12, 119, 34, 3, 106, 34, 14, 32, 7, 115, 65, 8, 119, 34, 16, 106, 34, 15, 32, 3, 115, 65, 7, 119, 33, 13, 32, 11, 32, 4, 32, 9, 115, 65, 12, 119, 34, 2, 106, 34, 7, 32, 12, 115, 65, 8, 119, 34, 12, 32, 4, 106, 34, 9, 32, 2, 115, 65, 7, 119, 33, 4, 32, 32, 32, 1, 32, 5, 115, 65, 12, 119, 34, 3, 106, 34, 6, 32, 33, 115, 65, 8, 119, 34, 11, 32, 1, 106, 34, 2, 32, 3, 115, 65, 7, 119, 33, 3, 32, 17, 32, 8, 32, 10, 115, 65, 12, 119, 34, 17, 106, 34, 5, 32, 31, 115, 65, 8, 119, 34, 1, 32, 8, 106, 34, 10, 32, 17, 115, 65, 7, 119, 33, 8, 32, 18, 65, 2, 106, 33, 18, 12, 1, 11, 11, 32, 5, 65, 229, 240, 193, 139, 6, 106, 32, 0, 65, 0, 16, 10, 32, 6, 65, 238, 200, 129, 153, 3, 106, 32, 0, 65, 4, 16, 10, 32, 14, 65, 178, 218, 136, 203, 7, 106, 32, 0, 65, 8, 16, 10, 32, 7, 65, 244, 202, 129, 217, 6, 106, 32, 0, 65, 12, 16, 10, 32, 4, 32, 19, 106, 32, 0, 65, 16, 16, 10, 32, 8, 32, 20, 106, 32, 0, 65, 20, 16, 10, 32, 3, 32, 21, 106, 32, 0, 65, 24, 16, 10, 32, 13, 32, 22, 106, 32, 0, 65, 28, 16, 10, 32, 15, 32, 23, 106, 32, 0, 65, 32, 16, 10, 32, 9, 32, 24, 106, 32, 0, 65, 36, 16, 10, 32, 10, 32, 25, 106, 32, 0, 65, 40, 16, 10, 32, 2, 32, 26, 106, 32, 0, 65, 44, 16, 10, 32, 11, 32, 27, 106, 32, 0, 65, 48, 16, 10, 32, 16, 32, 28, 106, 32, 0, 65, 52, 16, 10, 32, 12, 32, 29, 106, 32, 0, 65, 56, 16, 10, 32, 1, 32, 30, 106, 32, 0, 65, 60, 16, 10, 11, 97, 1, 4, 127, 65, 4, 33, 3, 65, 1, 33, 1, 3, 64, 32, 3, 34, 2, 65, 1, 107, 33, 3, 32, 2, 65, 255, 1, 113, 4, 64, 32, 1, 32, 0, 32, 4, 65, 255, 1, 113, 106, 34, 2, 45, 0, 0, 106, 33, 1, 32, 2, 32, 1, 58, 0, 0, 32, 1, 65, 8, 118, 33, 1, 32, 4, 65, 1, 106, 33, 4, 12, 1, 11, 11, 32, 1, 65, 0, 74, 4, 64, 65, 144, 1, 65, 208, 1, 65, 135, 2, 65, 4, 16, 0, 0, 11, 11, 8, 0, 32, 0, 32, 1, 16, 3, 11, 108, 1, 2, 127, 3, 64, 32, 6, 32, 1, 73, 4, 64, 35, 15, 32, 3, 32, 2, 16, 11, 32, 6, 33, 5, 3, 64, 32, 5, 32, 1, 73, 65, 0, 32, 5, 32, 6, 65, 64, 107, 73, 27, 4, 64, 32, 4, 32, 5, 106, 32, 0, 32, 5, 106, 45, 0, 0, 35, 15, 32, 5, 32, 6, 107, 106, 45, 0, 0, 115, 58, 0, 0, 32, 5, 65, 1, 106, 33, 5, 12, 1, 11, 11, 32, 3, 16, 12, 32, 6, 65, 64, 107, 33, 6, 12, 1, 11, 11, 35, 15, 65, 192, 0, 16, 13, 32, 1, 11, 14, 0, 35, 7, 32, 0, 35, 9, 35, 11, 35, 13, 16, 14, 11, 204, 4, 1, 1, 127, 35, 27, 32, 0, 45, 0, 0, 32, 0, 65, 1, 106, 45, 0, 0, 65, 8, 116, 114, 34, 1, 65, 255, 63, 113, 59, 1, 0, 35, 27, 65, 2, 106, 32, 1, 65, 13, 118, 32, 0, 65, 2, 106, 45, 0, 0, 32, 0, 65, 3, 106, 45, 0, 0, 65, 8, 116, 114, 34, 1, 65, 3, 116, 114, 65, 255, 63, 113, 59, 1, 0, 35, 27, 65, 4, 106, 32, 1, 65, 10, 118, 32, 0, 65, 4, 106, 45, 0, 0, 32, 0, 65, 5, 106, 45, 0, 0, 65, 8, 116, 114, 34, 1, 65, 6, 116, 114, 65, 131, 62, 113, 59, 1, 0, 35, 27, 65, 6, 106, 32, 1, 65, 7, 118, 32, 0, 65, 6, 106, 45, 0, 0, 32, 0, 65, 7, 106, 45, 0, 0, 65, 8, 116, 114, 34, 1, 65, 9, 116, 114, 65, 255, 63, 113, 59, 1, 0, 35, 27, 65, 8, 106, 32, 1, 65, 4, 118, 32, 0, 65, 8, 106, 45, 0, 0, 32, 0, 65, 9, 106, 45, 0, 0, 65, 8, 116, 114, 34, 1, 65, 12, 116, 114, 65, 255, 1, 113, 59, 1, 0, 35, 27, 65, 10, 106, 32, 1, 65, 1, 118, 65, 254, 63, 113, 59, 1, 0, 35, 27, 65, 12, 106, 32, 1, 65, 14, 118, 32, 0, 65, 10, 106, 45, 0, 0, 32, 0, 65, 11, 106, 45, 0, 0, 65, 8, 116, 114, 34, 1, 65, 2, 116, 114, 65, 255, 63, 113, 59, 1, 0, 35, 27, 65, 14, 106, 32, 1, 65, 11, 118, 32, 0, 65, 12, 106, 45, 0, 0, 32, 0, 65, 13, 106, 45, 0, 0, 65, 8, 116, 114, 34, 1, 65, 5, 116, 114, 65, 129, 63, 113, 59, 1, 0, 35, 27, 65, 16, 106, 32, 1, 65, 8, 118, 32, 0, 65, 14, 106, 45, 0, 0, 32, 0, 65, 15, 106, 45, 0, 0, 65, 8, 116, 114, 34, 1, 65, 8, 116, 114, 65, 255, 63, 113, 59, 1, 0, 35, 27, 65, 18, 106, 32, 1, 65, 5, 118, 65, 255, 0, 113, 59, 1, 0, 35, 31, 32, 0, 65, 16, 106, 45, 0, 0, 32, 0, 65, 17, 106, 45, 0, 0, 65, 8, 116, 114, 59, 1, 0, 35, 31, 65, 2, 106, 32, 0, 65, 18, 106, 45, 0, 0, 32, 0, 65, 19, 106, 45, 0, 0, 65, 8, 116, 114, 59, 1, 0, 35, 31, 65, 4, 106, 32, 0, 65, 20, 106, 45, 0, 0, 32, 0, 65, 21, 106, 45, 0, 0, 65, 8, 116, 114, 59, 1, 0, 35, 31, 65, 6, 106, 32, 0, 65, 22, 106, 45, 0, 0, 32, 0, 65, 23, 106, 45, 0, 0, 65, 8, 116, 114, 59, 1, 0, 35, 31, 65, 8, 106, 32, 0, 65, 24, 106, 45, 0, 0, 32, 0, 65, 25, 106, 45, 0, 0, 65, 8, 116, 114, 59, 1, 0, 35, 31, 65, 10, 106, 32, 0, 65, 26, 106, 45, 0, 0, 32, 0, 65, 27, 106, 45, 0, 0, 65, 8, 116, 114, 59, 1, 0, 35, 31, 65, 12, 106, 32, 0, 65, 28, 106, 45, 0, 0, 32, 0, 65, 29, 106, 45, 0, 0, 65, 8, 116, 114, 59, 1, 0, 35, 31, 65, 14, 106, 32, 0, 65, 30, 106, 45, 0, 0, 32, 0, 65, 31, 106, 45, 0, 0, 65, 8, 116, 114, 59, 1, 0, 11, 6, 0, 35, 21, 16, 16, 11, 166, 13, 1, 32, 127, 65, 0, 65, 128, 16, 35, 33, 27, 33, 34, 35, 29, 47, 1, 0, 33, 3, 35, 29, 65, 2, 106, 47, 1, 0, 33, 4, 35, 29, 65, 4, 106, 47, 1, 0, 33, 8, 35, 29, 65, 6, 106, 47, 1, 0, 33, 9, 35, 29, 65, 8, 106, 47, 1, 0, 33, 10, 35, 29, 65, 10, 106, 47, 1, 0, 33, 11, 35, 29, 65, 12, 106, 47, 1, 0, 33, 12, 35, 29, 65, 14, 106, 47, 1, 0, 33, 13, 35, 29, 65, 16, 106, 47, 1, 0, 33, 14, 35, 29, 65, 18, 106, 47, 1, 0, 33, 6, 35, 27, 47, 1, 0, 33, 17, 35, 27, 65, 2, 106, 47, 1, 0, 33, 18, 35, 27, 65, 4, 106, 47, 1, 0, 33, 20, 35, 27, 65, 6, 106, 47, 1, 0, 33, 22, 35, 27, 65, 8, 106, 47, 1, 0, 33, 24, 35, 27, 65, 10, 106, 47, 1, 0, 33, 26, 35, 27, 65, 12, 106, 47, 1, 0, 33, 29, 35, 27, 65, 14, 106, 47, 1, 0, 33, 30, 35, 27, 65, 16, 106, 47, 1, 0, 33, 31, 35, 27, 65, 18, 106, 47, 1, 0, 33, 33, 3, 64, 32, 2, 65, 16, 79, 4, 64, 32, 3, 32, 0, 32, 1, 106, 45, 0, 0, 32, 0, 32, 1, 65, 1, 106, 106, 45, 0, 0, 65, 8, 116, 114, 34, 15, 65, 255, 63, 113, 106, 34, 3, 32, 17, 108, 32, 4, 32, 0, 32, 1, 65, 2, 106, 106, 45, 0, 0, 32, 0, 32, 1, 65, 3, 106, 106, 45, 0, 0, 65, 8, 116, 114, 34, 16, 65, 3, 116, 32, 15, 65, 255, 255, 3, 113, 65, 13, 118, 114, 65, 255, 63, 113, 106, 34, 4, 32, 33, 65, 5, 108, 34, 15, 108, 106, 32, 8, 32, 0, 32, 1, 65, 4, 106, 106, 45, 0, 0, 32, 0, 32, 1, 65, 5, 106, 106, 45, 0, 0, 65, 8, 116, 114, 34, 19, 65, 6, 116, 32, 16, 65, 255, 255, 3, 113, 65, 10, 118, 114, 65, 255, 63, 113, 106, 34, 8, 32, 31, 65, 5, 108, 34, 16, 108, 106, 32, 9, 32, 0, 32, 1, 65, 6, 106, 106, 45, 0, 0, 32, 0, 32, 1, 65, 7, 106, 106, 45, 0, 0, 65, 8, 116, 114, 34, 21, 65, 9, 116, 32, 19, 65, 255, 255, 3, 113, 65, 7, 118, 114, 65, 255, 63, 113, 106, 34, 9, 32, 30, 65, 5, 108, 34, 19, 108, 106, 32, 10, 32, 0, 32, 1, 65, 8, 106, 106, 45, 0, 0, 32, 0, 32, 1, 65, 9, 106, 106, 45, 0, 0, 65, 8, 116, 114, 34, 23, 65, 12, 116, 32, 21, 65, 255, 255, 3, 113, 65, 4, 118, 114, 65, 255, 63, 113, 106, 34, 10, 32, 29, 65, 5, 108, 34, 21, 108, 106, 34, 32, 65, 255, 63, 113, 32, 11, 32, 23, 65, 255, 255, 3, 113, 65, 1, 118, 65, 255, 63, 113, 106, 34, 11, 32, 26, 65, 5, 108, 34, 27, 108, 106, 32, 12, 32, 0, 32, 1, 65, 10, 106, 106, 45, 0, 0, 32, 0, 32, 1, 65, 11, 106, 106, 45, 0, 0, 65, 8, 116, 114, 34, 28, 65, 2, 116, 32, 23, 65, 255, 255, 3, 113, 65, 14, 118, 114, 65, 255, 63, 113, 106, 34, 12, 32, 24, 65, 5, 108, 34, 23, 108, 106, 32, 13, 32, 0, 32, 1, 65, 12, 106, 106, 45, 0, 0, 32, 0, 32, 1, 65, 13, 106, 106, 45, 0, 0, 65, 8, 116, 114, 34, 25, 65, 5, 116, 32, 28, 65, 255, 255, 3, 113, 65, 11, 118, 114, 65, 255, 63, 113, 106, 34, 13, 32, 22, 65, 5, 108, 34, 28, 108, 106, 32, 14, 32, 25, 65, 255, 255, 3, 113, 65, 8, 118, 32, 0, 32, 1, 65, 14, 106, 106, 45, 0, 0, 32, 0, 32, 1, 65, 15, 106, 106, 45, 0, 0, 65, 8, 116, 114, 34, 25, 65, 8, 116, 114, 65, 255, 63, 113, 106, 34, 14, 32, 20, 65, 5, 108, 34, 7, 108, 106, 33, 5, 32, 11, 32, 21, 108, 32, 32, 65, 13, 118, 32, 5, 32, 6, 32, 34, 32, 25, 65, 255, 255, 3, 113, 65, 5, 118, 114, 65, 255, 255, 3, 113, 106, 34, 6, 32, 18, 65, 5, 108, 108, 106, 34, 32, 65, 13, 118, 106, 32, 3, 32, 18, 108, 106, 32, 4, 32, 17, 108, 106, 32, 8, 32, 15, 108, 106, 32, 9, 32, 16, 108, 106, 32, 10, 32, 19, 108, 106, 34, 25, 65, 255, 63, 113, 106, 32, 12, 32, 27, 108, 106, 32, 13, 32, 23, 108, 106, 32, 14, 32, 28, 108, 106, 33, 5, 32, 11, 32, 19, 108, 32, 25, 65, 13, 118, 32, 5, 32, 6, 32, 7, 108, 106, 34, 25, 65, 13, 118, 106, 32, 3, 32, 20, 108, 106, 32, 4, 32, 18, 108, 106, 32, 8, 32, 17, 108, 106, 32, 9, 32, 15, 108, 106, 32, 10, 32, 16, 108, 106, 34, 7, 65, 255, 63, 113, 106, 32, 12, 32, 21, 108, 106, 32, 13, 32, 27, 108, 106, 32, 14, 32, 23, 108, 106, 33, 5, 32, 11, 32, 16, 108, 32, 7, 65, 13, 118, 32, 5, 32, 6, 32, 28, 108, 106, 34, 28, 65, 13, 118, 106, 32, 3, 32, 22, 108, 106, 32, 4, 32, 20, 108, 106, 32, 8, 32, 18, 108, 106, 32, 9, 32, 17, 108, 106, 32, 10, 32, 15, 108, 106, 34, 7, 65, 255, 63, 113, 106, 32, 12, 32, 19, 108, 106, 32, 13, 32, 21, 108, 106, 32, 14, 32, 27, 108, 106, 33, 5, 32, 11, 32, 15, 108, 32, 7, 65, 13, 118, 32, 5, 32, 6, 32, 23, 108, 106, 34, 23, 65, 13, 118, 106, 32, 3, 32, 24, 108, 106, 32, 4, 32, 22, 108, 106, 32, 8, 32, 20, 108, 106, 32, 9, 32, 18, 108, 106, 32, 10, 32, 17, 108, 106, 34, 7, 65, 255, 63, 113, 106, 32, 12, 32, 16, 108, 106, 32, 13, 32, 19, 108, 106, 32, 14, 32, 21, 108, 106, 33, 5, 32, 11, 32, 17, 108, 32, 7, 65, 13, 118, 32, 5, 32, 6, 32, 27, 108, 106, 34, 27, 65, 13, 118, 106, 32, 3, 32, 26, 108, 106, 32, 4, 32, 24, 108, 106, 32, 8, 32, 22, 108, 106, 32, 9, 32, 20, 108, 106, 32, 10, 32, 18, 108, 106, 34, 7, 65, 255, 63, 113, 106, 32, 12, 32, 15, 108, 106, 32, 13, 32, 16, 108, 106, 32, 14, 32, 19, 108, 106, 33, 5, 32, 11, 32, 18, 108, 32, 7, 65, 13, 118, 32, 5, 32, 6, 32, 21, 108, 106, 34, 21, 65, 13, 118, 106, 32, 3, 32, 29, 108, 106, 32, 4, 32, 26, 108, 106, 32, 8, 32, 24, 108, 106, 32, 9, 32, 22, 108, 106, 32, 10, 32, 20, 108, 106, 34, 7, 65, 255, 63, 113, 106, 32, 12, 32, 17, 108, 106, 32, 13, 32, 15, 108, 106, 32, 14, 32, 16, 108, 106, 33, 5, 32, 11, 32, 20, 108, 32, 7, 65, 13, 118, 32, 5, 32, 6, 32, 19, 108, 106, 34, 19, 65, 13, 118, 106, 32, 3, 32, 30, 108, 106, 32, 4, 32, 29, 108, 106, 32, 8, 32, 26, 108, 106, 32, 9, 32, 24, 108, 106, 32, 10, 32, 22, 108, 106, 34, 7, 65, 255, 63, 113, 106, 32, 12, 32, 18, 108, 106, 32, 13, 32, 17, 108, 106, 32, 14, 32, 15, 108, 106, 33, 5, 32, 11, 32, 22, 108, 32, 7, 65, 13, 118, 32, 5, 32, 6, 32, 16, 108, 106, 34, 16, 65, 13, 118, 106, 32, 3, 32, 31, 108, 106, 32, 4, 32, 30, 108, 106, 32, 8, 32, 29, 108, 106, 32, 9, 32, 26, 108, 106, 32, 10, 32, 24, 108, 106, 34, 7, 65, 255, 63, 113, 106, 32, 12, 32, 20, 108, 106, 32, 13, 32, 18, 108, 106, 32, 14, 32, 17, 108, 106, 33, 5, 32, 11, 32, 24, 108, 32, 7, 65, 13, 118, 32, 5, 32, 6, 32, 15, 108, 106, 34, 15, 65, 13, 118, 106, 32, 3, 32, 33, 108, 106, 32, 4, 32, 31, 108, 106, 32, 8, 32, 30, 108, 106, 32, 9, 32, 29, 108, 106, 32, 10, 32, 26, 108, 106, 34, 3, 65, 255, 63, 113, 106, 32, 12, 32, 22, 108, 106, 32, 13, 32, 20, 108, 106, 32, 14, 32, 18, 108, 106, 33, 4, 32, 3, 65, 13, 118, 32, 4, 32, 6, 32, 17, 108, 106, 34, 6, 65, 13, 118, 106, 34, 3, 32, 3, 65, 2, 116, 106, 32, 32, 65, 255, 63, 113, 106, 34, 3, 65, 13, 118, 33, 4, 32, 3, 65, 255, 63, 113, 33, 3, 32, 25, 65, 255, 63, 113, 32, 4, 106, 33, 4, 32, 28, 65, 255, 63, 113, 33, 8, 32, 23, 65, 255, 63, 113, 33, 9, 32, 27, 65, 255, 63, 113, 33, 10, 32, 21, 65, 255, 63, 113, 33, 11, 32, 19, 65, 255, 63, 113, 33, 12, 32, 16, 65, 255, 63, 113, 33, 13, 32, 15, 65, 255, 63, 113, 33, 14, 32, 6, 65, 255, 63, 113, 33, 6, 32, 1, 65, 16, 106, 33, 1, 32, 2, 65, 16, 107, 33, 2, 12, 1, 11, 11, 35, 29, 32, 3, 59, 1, 0, 35, 29, 65, 2, 106, 32, 4, 59, 1, 0, 35, 29, 65, 4, 106, 32, 8, 59, 1, 0, 35, 29, 65, 6, 106, 32, 9, 59, 1, 0, 35, 29, 65, 8, 106, 32, 10, 59, 1, 0, 35, 29, 65, 10, 106, 32, 11, 59, 1, 0, 35, 29, 65, 12, 106, 32, 12, 59, 1, 0, 35, 29, 65, 14, 106, 32, 13, 59, 1, 0, 35, 29, 65, 16, 106, 32, 14, 59, 1, 0, 35, 29, 65, 18, 106, 32, 6, 59, 1, 0, 11, 203, 1, 1, 3, 127, 35, 32, 4, 64, 65, 16, 35, 32, 107, 34, 3, 32, 1, 75, 4, 64, 32, 1, 33, 3, 11, 3, 64, 32, 2, 32, 3, 73, 4, 64, 35, 25, 32, 2, 35, 32, 106, 106, 32, 0, 32, 2, 106, 45, 0, 0, 58, 0, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 32, 1, 32, 3, 107, 33, 1, 32, 3, 33, 4, 32, 3, 35, 32, 106, 36, 32, 35, 32, 65, 16, 73, 4, 64, 15, 11, 35, 25, 65, 0, 65, 16, 16, 18, 65, 0, 36, 32, 11, 2, 127, 32, 1, 65, 16, 79, 4, 64, 32, 0, 32, 4, 32, 1, 32, 1, 65, 15, 113, 107, 34, 3, 16, 18, 32, 3, 32, 4, 106, 33, 4, 32, 1, 32, 3, 107, 33, 1, 11, 32, 1, 11, 4, 64, 65, 0, 33, 2, 3, 64, 32, 2, 32, 1, 73, 4, 64, 35, 25, 32, 2, 35, 32, 106, 106, 32, 0, 32, 2, 32, 4, 106, 106, 45, 0, 0, 58, 0, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 32, 1, 35, 32, 106, 36, 32, 11, 11, 8, 0, 35, 22, 32, 0, 16, 19, 11, 149, 9, 1, 3, 127, 35, 32, 4, 64, 35, 32, 34, 1, 35, 25, 106, 65, 1, 58, 0, 0, 32, 1, 65, 1, 106, 33, 1, 3, 64, 32, 1, 65, 16, 73, 4, 64, 32, 1, 35, 25, 106, 65, 0, 58, 0, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 65, 1, 36, 33, 35, 25, 65, 0, 65, 16, 16, 18, 11, 35, 29, 65, 2, 106, 47, 1, 0, 65, 13, 118, 33, 2, 35, 29, 65, 2, 106, 35, 29, 65, 2, 106, 47, 1, 0, 65, 255, 63, 113, 59, 1, 0, 65, 2, 33, 1, 3, 64, 32, 1, 65, 10, 73, 4, 64, 32, 1, 65, 1, 116, 34, 3, 35, 29, 106, 32, 2, 32, 3, 35, 29, 106, 47, 1, 0, 106, 59, 1, 0, 32, 3, 35, 29, 106, 47, 1, 0, 65, 13, 118, 33, 2, 32, 3, 35, 29, 106, 32, 3, 35, 29, 106, 47, 1, 0, 65, 255, 63, 113, 59, 1, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 35, 29, 35, 29, 47, 1, 0, 32, 2, 65, 5, 108, 106, 59, 1, 0, 35, 29, 47, 1, 0, 33, 1, 35, 29, 35, 29, 47, 1, 0, 65, 255, 63, 113, 59, 1, 0, 35, 29, 65, 2, 106, 35, 29, 65, 2, 106, 47, 1, 0, 32, 1, 65, 255, 255, 3, 113, 65, 13, 118, 106, 59, 1, 0, 35, 29, 65, 2, 106, 47, 1, 0, 33, 1, 35, 29, 65, 2, 106, 35, 29, 65, 2, 106, 47, 1, 0, 65, 255, 63, 113, 59, 1, 0, 35, 29, 65, 4, 106, 35, 29, 65, 4, 106, 47, 1, 0, 32, 1, 65, 255, 255, 3, 113, 65, 13, 118, 106, 59, 1, 0, 35, 36, 35, 29, 47, 1, 0, 65, 5, 106, 59, 1, 0, 35, 36, 47, 1, 0, 65, 13, 118, 33, 2, 35, 36, 35, 36, 47, 1, 0, 65, 255, 63, 113, 59, 1, 0, 65, 1, 33, 1, 3, 64, 32, 1, 65, 10, 73, 4, 64, 32, 1, 65, 1, 116, 34, 3, 35, 36, 106, 32, 2, 32, 3, 35, 29, 106, 47, 1, 0, 106, 59, 1, 0, 32, 3, 35, 36, 106, 47, 1, 0, 65, 13, 118, 33, 2, 32, 3, 35, 36, 106, 32, 3, 35, 36, 106, 47, 1, 0, 65, 255, 63, 113, 59, 1, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 35, 36, 65, 18, 106, 35, 36, 65, 18, 106, 47, 1, 0, 65, 128, 64, 106, 59, 1, 0, 32, 2, 65, 1, 115, 65, 1, 107, 33, 2, 65, 0, 33, 1, 3, 64, 32, 1, 65, 10, 73, 4, 64, 32, 1, 65, 1, 116, 34, 3, 35, 36, 106, 32, 2, 32, 3, 35, 36, 106, 47, 1, 0, 113, 59, 1, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 32, 2, 65, 127, 115, 33, 3, 65, 0, 33, 1, 3, 64, 32, 1, 65, 10, 73, 4, 64, 32, 1, 65, 1, 116, 34, 2, 35, 29, 106, 32, 2, 35, 36, 106, 47, 1, 0, 32, 3, 32, 2, 35, 29, 106, 47, 1, 0, 113, 114, 59, 1, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 35, 29, 35, 29, 47, 1, 0, 35, 29, 65, 2, 106, 47, 1, 0, 65, 13, 116, 114, 59, 1, 0, 35, 29, 65, 2, 106, 35, 29, 65, 4, 106, 47, 1, 0, 65, 10, 116, 35, 29, 65, 2, 106, 47, 1, 0, 65, 3, 118, 114, 59, 1, 0, 35, 29, 65, 4, 106, 35, 29, 65, 6, 106, 47, 1, 0, 65, 7, 116, 35, 29, 65, 4, 106, 47, 1, 0, 65, 6, 118, 114, 59, 1, 0, 35, 29, 65, 6, 106, 35, 29, 65, 8, 106, 47, 1, 0, 65, 4, 116, 35, 29, 65, 6, 106, 47, 1, 0, 65, 9, 118, 114, 59, 1, 0, 35, 29, 65, 8, 106, 35, 29, 65, 10, 106, 47, 1, 0, 65, 1, 116, 35, 29, 65, 8, 106, 47, 1, 0, 65, 12, 118, 114, 35, 29, 65, 12, 106, 47, 1, 0, 65, 14, 116, 114, 59, 1, 0, 35, 29, 65, 10, 106, 35, 29, 65, 14, 106, 47, 1, 0, 65, 11, 116, 35, 29, 65, 12, 106, 47, 1, 0, 65, 2, 118, 114, 59, 1, 0, 35, 29, 65, 12, 106, 35, 29, 65, 16, 106, 47, 1, 0, 65, 8, 116, 35, 29, 65, 14, 106, 47, 1, 0, 65, 5, 118, 114, 59, 1, 0, 35, 29, 65, 14, 106, 35, 29, 65, 18, 106, 47, 1, 0, 65, 5, 116, 35, 29, 65, 16, 106, 47, 1, 0, 65, 8, 118, 114, 59, 1, 0, 35, 29, 35, 29, 47, 1, 0, 35, 31, 47, 1, 0, 106, 34, 2, 59, 1, 0, 65, 1, 33, 1, 3, 64, 32, 1, 65, 8, 73, 4, 64, 32, 1, 65, 1, 116, 34, 3, 35, 29, 106, 47, 1, 0, 32, 3, 35, 31, 106, 47, 1, 0, 106, 32, 2, 65, 16, 118, 106, 33, 2, 35, 29, 32, 3, 106, 32, 2, 59, 1, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 32, 0, 35, 29, 47, 1, 0, 58, 0, 0, 32, 0, 65, 1, 106, 35, 29, 47, 1, 0, 65, 8, 118, 58, 0, 0, 32, 0, 65, 2, 106, 35, 29, 65, 2, 106, 47, 1, 0, 58, 0, 0, 32, 0, 65, 3, 106, 35, 29, 65, 2, 106, 47, 1, 0, 65, 8, 118, 58, 0, 0, 32, 0, 65, 4, 106, 35, 29, 65, 4, 106, 47, 1, 0, 58, 0, 0, 32, 0, 65, 5, 106, 35, 29, 65, 4, 106, 47, 1, 0, 65, 8, 118, 58, 0, 0, 32, 0, 65, 6, 106, 35, 29, 65, 6, 106, 47, 1, 0, 58, 0, 0, 32, 0, 65, 7, 106, 35, 29, 65, 6, 106, 47, 1, 0, 65, 8, 118, 58, 0, 0, 32, 0, 65, 8, 106, 35, 29, 65, 8, 106, 47, 1, 0, 58, 0, 0, 32, 0, 65, 9, 106, 35, 29, 65, 8, 106, 47, 1, 0, 65, 8, 118, 58, 0, 0, 32, 0, 65, 10, 106, 35, 29, 65, 10, 106, 47, 1, 0, 58, 0, 0, 32, 0, 65, 11, 106, 35, 29, 65, 10, 106, 47, 1, 0, 65, 8, 118, 58, 0, 0, 32, 0, 65, 12, 106, 35, 29, 65, 12, 106, 47, 1, 0, 58, 0, 0, 32, 0, 65, 13, 106, 35, 29, 65, 12, 106, 47, 1, 0, 65, 8, 118, 58, 0, 0, 32, 0, 65, 14, 106, 35, 29, 65, 14, 106, 47, 1, 0, 58, 0, 0, 32, 0, 65, 15, 106, 35, 29, 65, 14, 106, 47, 1, 0, 65, 8, 118, 58, 0, 0, 65, 1, 36, 34, 11, 11, 0, 32, 0, 32, 1, 65, 1, 116, 16, 3, 11, 38, 0, 35, 25, 65, 16, 16, 13, 35, 27, 65, 10, 16, 22, 35, 29, 65, 10, 16, 22, 35, 31, 65, 8, 16, 22, 65, 0, 36, 32, 65, 0, 36, 33, 65, 0, 36, 34, 11, 33, 1, 1, 127, 35, 23, 33, 0, 35, 34, 4, 64, 65, 144, 2, 65, 208, 2, 65, 226, 3, 65, 4, 16, 0, 0, 11, 32, 0, 16, 21, 16, 23, 11, 39, 1, 1, 127, 3, 64, 32, 0, 65, 32, 73, 4, 64, 32, 0, 35, 7, 106, 65, 0, 58, 0, 0, 32, 0, 65, 1, 106, 33, 0, 12, 1, 11, 11, 65, 32, 16, 15, 26, 11, 152, 2, 1, 1, 127, 3, 64, 32, 4, 65, 32, 72, 4, 64, 32, 4, 35, 9, 106, 32, 0, 32, 4, 106, 45, 0, 0, 58, 0, 0, 32, 4, 65, 1, 106, 33, 4, 12, 1, 11, 11, 65, 0, 33, 4, 3, 64, 32, 4, 65, 4, 72, 4, 64, 32, 4, 35, 11, 106, 65, 0, 58, 0, 0, 32, 4, 65, 1, 106, 33, 4, 12, 1, 11, 11, 65, 4, 33, 4, 3, 64, 32, 4, 65, 16, 72, 4, 64, 32, 4, 35, 11, 106, 32, 1, 32, 4, 65, 4, 107, 106, 45, 0, 0, 58, 0, 0, 32, 4, 65, 1, 106, 33, 4, 12, 1, 11, 11, 16, 25, 65, 0, 33, 4, 3, 64, 32, 4, 65, 32, 72, 4, 64, 32, 4, 35, 21, 106, 32, 4, 35, 13, 106, 45, 0, 0, 58, 0, 0, 32, 4, 65, 1, 106, 33, 4, 12, 1, 11, 11, 35, 21, 16, 16, 32, 3, 65, 0, 75, 4, 64, 65, 0, 33, 4, 3, 64, 32, 4, 32, 3, 73, 4, 64, 32, 4, 35, 22, 106, 32, 2, 32, 4, 106, 45, 0, 0, 58, 0, 0, 32, 4, 65, 1, 106, 33, 4, 12, 1, 11, 11, 32, 3, 16, 20, 32, 3, 65, 15, 113, 65, 0, 75, 4, 64, 65, 16, 32, 3, 65, 15, 113, 107, 34, 1, 65, 0, 74, 4, 64, 65, 0, 33, 0, 3, 64, 32, 0, 32, 1, 72, 4, 64, 32, 0, 35, 22, 106, 65, 0, 58, 0, 0, 32, 0, 65, 1, 106, 33, 0, 12, 1, 11, 11, 32, 1, 16, 20, 11, 11, 11, 11, 65, 1, 1, 127, 3, 64, 32, 2, 32, 1, 73, 4, 64, 35, 22, 32, 2, 106, 32, 0, 32, 2, 106, 45, 0, 0, 58, 0, 0, 35, 7, 32, 2, 106, 32, 0, 32, 2, 106, 45, 0, 0, 58, 0, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 32, 1, 16, 20, 32, 1, 16, 15, 26, 11, 27, 0, 32, 0, 32, 1, 65, 0, 16, 10, 32, 0, 173, 66, 128, 128, 128, 128, 16, 127, 167, 32, 1, 65, 4, 16, 10, 11, 87, 1, 2, 127, 32, 0, 65, 15, 113, 65, 0, 75, 4, 64, 65, 16, 32, 0, 65, 15, 113, 107, 34, 3, 65, 0, 74, 4, 64, 3, 64, 32, 2, 32, 3, 72, 4, 64, 32, 2, 35, 22, 106, 65, 0, 58, 0, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 32, 3, 16, 20, 11, 11, 32, 1, 35, 22, 16, 28, 65, 8, 16, 20, 32, 0, 35, 22, 16, 28, 65, 8, 16, 20, 16, 24, 11, 34, 0, 32, 0, 4, 64, 35, 38, 35, 40, 35, 42, 32, 4, 16, 26, 11, 35, 44, 32, 2, 16, 27, 32, 1, 4, 64, 32, 3, 32, 4, 16, 29, 11, 11, 89, 1, 1, 127, 3, 64, 32, 2, 32, 1, 73, 4, 64, 35, 7, 32, 2, 106, 32, 0, 32, 2, 106, 45, 0, 0, 58, 0, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 32, 1, 16, 15, 26, 65, 0, 33, 2, 3, 64, 32, 2, 32, 1, 73, 4, 64, 35, 22, 32, 2, 106, 32, 2, 35, 13, 106, 45, 0, 0, 58, 0, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 32, 1, 16, 20, 11, 34, 0, 32, 0, 4, 64, 35, 38, 35, 40, 35, 42, 32, 4, 16, 26, 11, 35, 44, 32, 2, 16, 31, 32, 1, 4, 64, 32, 3, 32, 4, 16, 29, 11, 11, 8, 0, 16, 5, 16, 8, 16, 9, 11, 11, 234, 2, 6, 0, 65, 16, 11, 43, 28, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 28, 0, 0, 0, 73, 0, 110, 0, 118, 0, 97, 0, 108, 0, 105, 0, 100, 0, 32, 0, 108, 0, 101, 0, 110, 0, 103, 0, 116, 0, 104, 0, 65, 192, 0, 11, 53, 38, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 38, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 97, 0, 114, 0, 114, 0, 97, 0, 121, 0, 98, 0, 117, 0, 102, 0, 102, 0, 101, 0, 114, 0, 46, 0, 116, 0, 115, 0, 65, 128, 1, 11, 63, 48, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 48, 0, 0, 0, 67, 0, 104, 0, 97, 0, 67, 0, 104, 0, 97, 0, 58, 0, 32, 0, 99, 0, 111, 0, 117, 0, 110, 0, 116, 0, 101, 0, 114, 0, 32, 0, 111, 0, 118, 0, 101, 0, 114, 0, 102, 0, 108, 0, 111, 0, 119, 0, 65, 192, 1, 11, 55, 40, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 40, 0, 0, 0, 97, 0, 115, 0, 115, 0, 101, 0, 109, 0, 98, 0, 108, 0, 121, 0, 47, 0, 99, 0, 104, 0, 97, 0, 99, 0, 104, 0, 97, 0, 50, 0, 48, 0, 46, 0, 116, 0, 115, 0, 65, 128, 2, 11, 57, 42, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 42, 0, 0, 0, 80, 0, 111, 0, 108, 0, 121, 0, 49, 0, 51, 0, 48, 0, 53, 0, 32, 0, 119, 0, 97, 0, 115, 0, 32, 0, 102, 0, 105, 0, 110, 0, 105, 0, 115, 0, 104, 0, 101, 0, 100, 0, 65, 192, 2, 11, 55, 40, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 40, 0, 0, 0, 97, 0, 115, 0, 115, 0, 101, 0, 109, 0, 98, 0, 108, 0, 121, 0, 47, 0, 112, 0, 111, 0, 108, 0, 121, 0, 49, 0, 51, 0, 48, 0, 53, 0, 46, 0, 116, 0, 115]);
  }
});

// ../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/wasm.js
var require_wasm = __commonJS({
  "../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/wasm.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.newInstance = void 0;
    var wasmCode_1 = require_wasmCode();
    var _module = new WebAssembly.Module(wasmCode_1.wasmCode);
    var importObj2 = {
      env: {
        // modified from https://github.com/AssemblyScript/assemblyscript/blob/v0.9.2/lib/loader/index.js#L70
        abort: function(msg, file, line, col) {
          throw Error(`abort: ${msg}:${file}:${line}:${col}`);
        }
      }
    };
    function newInstance3() {
      return new WebAssembly.Instance(_module, importObj2).exports;
    }
    exports.newInstance = newInstance3;
  }
});

// ../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/chacha20.js
var require_chacha20 = __commonJS({
  "../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/chacha20.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.chacha20StreamXOR = void 0;
    var wasm_1 = require_wasm();
    var ctx3 = wasm_1.newInstance();
    var wasmInputValue2 = ctx3.chacha20Input.value;
    var wasmOutputValue2 = ctx3.chacha20Output.value;
    var wasmKeyValue = ctx3.chacha20Key.value;
    var wasmCounterValue = ctx3.chacha20Counter.value;
    var { CHACHA20_INPUT_LENGTH, KEY_LENGTH, CHACHA20_COUNTER_LENGTH } = ctx3;
    var inputArr = new Uint8Array(ctx3.memory.buffer, wasmInputValue2, CHACHA20_INPUT_LENGTH);
    var outputArr = new Uint8Array(ctx3.memory.buffer, wasmOutputValue2, CHACHA20_INPUT_LENGTH);
    var keyArr = new Uint8Array(ctx3.memory.buffer, wasmKeyValue, KEY_LENGTH);
    var counterArr = new Uint8Array(ctx3.memory.buffer, wasmCounterValue, CHACHA20_COUNTER_LENGTH);
    function chacha20StreamXOR(key, nonce, src2) {
      if (key.length != KEY_LENGTH) {
        throw new Error("ChaCha: key size must be 32 bytes, expected " + KEY_LENGTH + " got " + key.length);
      }
      if (nonce.length != CHACHA20_COUNTER_LENGTH) {
        throw new Error("ChaCha nonce with counter must be 16 bytes");
      }
      keyArr.set(key);
      counterArr.set(nonce);
      const output2 = new Uint8Array(src2.length);
      const loop = Math.floor(src2.length / CHACHA20_INPUT_LENGTH);
      for (let i = 0; i <= loop; i++) {
        const start2 = i * CHACHA20_INPUT_LENGTH;
        const end = Math.min((i + 1) * CHACHA20_INPUT_LENGTH, src2.length);
        inputArr.set(loop === 0 ? src2 : src2.subarray(start2, end));
        const length3 = end - start2;
        const dataLength = ctx3.chacha20StreamXORUpdate(length3);
        output2.set(dataLength === CHACHA20_INPUT_LENGTH ? outputArr : outputArr.subarray(0, dataLength), start2);
      }
      return output2;
    }
    exports.chacha20StreamXOR = chacha20StreamXOR;
  }
});

// ../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/index.js
var require_src = __commonJS({
  "../../node_modules/@chainsafe/as-chacha20poly1305/lib/src/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.newInstance = exports.chacha20StreamXOR = exports.Poly1305 = exports.ChaCha20Poly1305 = void 0;
    var chacha20poly1305_1 = require_chacha20poly1305();
    Object.defineProperty(exports, "ChaCha20Poly1305", { enumerable: true, get: function() {
      return chacha20poly1305_1.ChaCha20Poly1305;
    } });
    var poly1305_1 = require_poly1305();
    Object.defineProperty(exports, "Poly1305", { enumerable: true, get: function() {
      return poly1305_1.Poly1305;
    } });
    var chacha20_1 = require_chacha20();
    Object.defineProperty(exports, "chacha20StreamXOR", { enumerable: true, get: function() {
      return chacha20_1.chacha20StreamXOR;
    } });
    var wasm_1 = require_wasm();
    Object.defineProperty(exports, "newInstance", { enumerable: true, get: function() {
      return wasm_1.newInstance;
    } });
  }
});

// ../../node_modules/is-electron/index.js
var require_is_electron = __commonJS({
  "../../node_modules/is-electron/index.js"(exports, module) {
    function isElectron2() {
      if (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") {
        return true;
      }
      if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) {
        return true;
      }
      if (typeof navigator === "object" && typeof navigator.userAgent === "string" && navigator.userAgent.indexOf("Electron") >= 0) {
        return true;
      }
      return false;
    }
    module.exports = isElectron2;
  }
});

// src/client.ts
import { elizaLogger } from "@elizaos/core";
import { createHelia } from "helia";

// ../../node_modules/libp2p/dist/src/index.js
import { generateKeyPair } from "@libp2p/crypto/keys";
import { peerIdFromPrivateKey } from "@libp2p/peer-id";

// ../../node_modules/libp2p/dist/src/config.js
import { FaultTolerance, InvalidParametersError } from "@libp2p/interface";

// ../../node_modules/progress-events/dist/src/index.js
var CustomProgressEvent = class extends Event {
  type;
  detail;
  constructor(type, detail) {
    super(type);
    this.type = type;
    this.detail = detail;
  }
};

// ../../node_modules/@multiformats/dns/dist/src/resolvers/default.js
import { Resolver } from "dns/promises";

// ../../node_modules/@multiformats/dns/dist/src/utils/get-types.js
function getTypes(types) {
  const DEFAULT_TYPES = [
    RecordType.A
  ];
  if (types == null) {
    return DEFAULT_TYPES;
  }
  if (Array.isArray(types)) {
    if (types.length === 0) {
      return DEFAULT_TYPES;
    }
    return types;
  }
  return [
    types
  ];
}

// ../../node_modules/uint8arrays/dist/src/to-string.node.js
import { Buffer as Buffer3 } from "node:buffer";

// ../../node_modules/multiformats/dist/src/bases/base10.js
var base10_exports = {};
__export(base10_exports, {
  base10: () => base10
});

// ../../node_modules/multiformats/dist/src/bytes.js
var empty = new Uint8Array(0);
function equals(aa, bb) {
  if (aa === bb)
    return true;
  if (aa.byteLength !== bb.byteLength) {
    return false;
  }
  for (let ii = 0; ii < aa.byteLength; ii++) {
    if (aa[ii] !== bb[ii]) {
      return false;
    }
  }
  return true;
}
function coerce(o) {
  if (o instanceof Uint8Array && o.constructor.name === "Uint8Array")
    return o;
  if (o instanceof ArrayBuffer)
    return new Uint8Array(o);
  if (ArrayBuffer.isView(o)) {
    return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
  }
  throw new Error("Unknown type, must be binary type");
}
function fromString(str) {
  return new TextEncoder().encode(str);
}
function toString(b) {
  return new TextDecoder().decode(b);
}

// ../../node_modules/multiformats/dist/src/vendor/base-x.js
function base(ALPHABET, name3) {
  if (ALPHABET.length >= 255) {
    throw new TypeError("Alphabet too long");
  }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET.length; i++) {
    var x = ALPHABET.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + " is ambiguous");
    }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET.length;
  var LEADER = ALPHABET.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256);
  var iFACTOR = Math.log(256) / Math.log(BASE);
  function encode7(source) {
    if (source instanceof Uint8Array)
      ;
    else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError("Expected Uint8Array");
    }
    if (source.length === 0) {
      return "";
    }
    var zeroes = 0;
    var length3 = 0;
    var pbegin = 0;
    var pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
    var b58 = new Uint8Array(size);
    while (pbegin !== pend) {
      var carry = source[pbegin];
      var i2 = 0;
      for (var it1 = size - 1; (carry !== 0 || i2 < length3) && it1 !== -1; it1--, i2++) {
        carry += 256 * b58[it1] >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = carry / BASE >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length3 = i2;
      pbegin++;
    }
    var it2 = size - length3;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    var str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET.charAt(b58[it2]);
    }
    return str;
  }
  function decodeUnsafe(source) {
    if (typeof source !== "string") {
      throw new TypeError("Expected String");
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    var psz = 0;
    if (source[psz] === " ") {
      return;
    }
    var zeroes = 0;
    var length3 = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    var size = (source.length - psz) * FACTOR + 1 >>> 0;
    var b256 = new Uint8Array(size);
    while (source[psz]) {
      var carry = BASE_MAP[source.charCodeAt(psz)];
      if (carry === 255) {
        return;
      }
      var i2 = 0;
      for (var it3 = size - 1; (carry !== 0 || i2 < length3) && it3 !== -1; it3--, i2++) {
        carry += BASE * b256[it3] >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = carry / 256 >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length3 = i2;
      psz++;
    }
    if (source[psz] === " ") {
      return;
    }
    var it4 = size - length3;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = new Uint8Array(zeroes + (size - it4));
    var j2 = zeroes;
    while (it4 !== size) {
      vch[j2++] = b256[it4++];
    }
    return vch;
  }
  function decode8(string3) {
    var buffer = decodeUnsafe(string3);
    if (buffer) {
      return buffer;
    }
    throw new Error(`Non-${name3} character`);
  }
  return {
    encode: encode7,
    decodeUnsafe,
    decode: decode8
  };
}
var src = base;
var _brrp__multiformats_scope_baseX = src;
var base_x_default = _brrp__multiformats_scope_baseX;

// ../../node_modules/multiformats/dist/src/bases/base.js
var Encoder = class {
  name;
  prefix;
  baseEncode;
  constructor(name3, prefix, baseEncode) {
    this.name = name3;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
  }
  encode(bytes2) {
    if (bytes2 instanceof Uint8Array) {
      return `${this.prefix}${this.baseEncode(bytes2)}`;
    } else {
      throw Error("Unknown type, must be binary type");
    }
  }
};
var Decoder = class {
  name;
  prefix;
  baseDecode;
  prefixCodePoint;
  constructor(name3, prefix, baseDecode) {
    this.name = name3;
    this.prefix = prefix;
    const prefixCodePoint = prefix.codePointAt(0);
    if (prefixCodePoint === void 0) {
      throw new Error("Invalid prefix character");
    }
    this.prefixCodePoint = prefixCodePoint;
    this.baseDecode = baseDecode;
  }
  decode(text) {
    if (typeof text === "string") {
      if (text.codePointAt(0) !== this.prefixCodePoint) {
        throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
      }
      return this.baseDecode(text.slice(this.prefix.length));
    } else {
      throw Error("Can only multibase decode strings");
    }
  }
  or(decoder) {
    return or(this, decoder);
  }
};
var ComposedDecoder = class {
  decoders;
  constructor(decoders2) {
    this.decoders = decoders2;
  }
  or(decoder) {
    return or(this, decoder);
  }
  decode(input) {
    const prefix = input[0];
    const decoder = this.decoders[prefix];
    if (decoder != null) {
      return decoder.decode(input);
    } else {
      throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
  }
};
function or(left, right) {
  return new ComposedDecoder({
    ...left.decoders ?? { [left.prefix]: left },
    ...right.decoders ?? { [right.prefix]: right }
  });
}
var Codec = class {
  name;
  prefix;
  baseEncode;
  baseDecode;
  encoder;
  decoder;
  constructor(name3, prefix, baseEncode, baseDecode) {
    this.name = name3;
    this.prefix = prefix;
    this.baseEncode = baseEncode;
    this.baseDecode = baseDecode;
    this.encoder = new Encoder(name3, prefix, baseEncode);
    this.decoder = new Decoder(name3, prefix, baseDecode);
  }
  encode(input) {
    return this.encoder.encode(input);
  }
  decode(input) {
    return this.decoder.decode(input);
  }
};
function from({ name: name3, prefix, encode: encode7, decode: decode8 }) {
  return new Codec(name3, prefix, encode7, decode8);
}
function baseX({ name: name3, prefix, alphabet: alphabet2 }) {
  const { encode: encode7, decode: decode8 } = base_x_default(alphabet2, name3);
  return from({
    prefix,
    name: name3,
    encode: encode7,
    decode: (text) => coerce(decode8(text))
  });
}
function decode(string3, alphabet2, bitsPerChar, name3) {
  const codes2 = {};
  for (let i = 0; i < alphabet2.length; ++i) {
    codes2[alphabet2[i]] = i;
  }
  let end = string3.length;
  while (string3[end - 1] === "=") {
    --end;
  }
  const out = new Uint8Array(end * bitsPerChar / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = codes2[string3[i]];
    if (value === void 0) {
      throw new SyntaxError(`Non-${name3} character`);
    }
    buffer = buffer << bitsPerChar | value;
    bits += bitsPerChar;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & buffer >> bits;
    }
  }
  if (bits >= bitsPerChar || (255 & buffer << 8 - bits) !== 0) {
    throw new SyntaxError("Unexpected end of data");
  }
  return out;
}
function encode(data, alphabet2, bitsPerChar) {
  const pad = alphabet2[alphabet2.length - 1] === "=";
  const mask = (1 << bitsPerChar) - 1;
  let out = "";
  let bits = 0;
  let buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = buffer << 8 | data[i];
    bits += 8;
    while (bits > bitsPerChar) {
      bits -= bitsPerChar;
      out += alphabet2[mask & buffer >> bits];
    }
  }
  if (bits !== 0) {
    out += alphabet2[mask & buffer << bitsPerChar - bits];
  }
  if (pad) {
    while ((out.length * bitsPerChar & 7) !== 0) {
      out += "=";
    }
  }
  return out;
}
function rfc4648({ name: name3, prefix, bitsPerChar, alphabet: alphabet2 }) {
  return from({
    prefix,
    name: name3,
    encode(input) {
      return encode(input, alphabet2, bitsPerChar);
    },
    decode(input) {
      return decode(input, alphabet2, bitsPerChar, name3);
    }
  });
}

// ../../node_modules/multiformats/dist/src/bases/base10.js
var base10 = baseX({
  prefix: "9",
  name: "base10",
  alphabet: "0123456789"
});

// ../../node_modules/multiformats/dist/src/bases/base16.js
var base16_exports = {};
__export(base16_exports, {
  base16: () => base16,
  base16upper: () => base16upper
});
var base16 = rfc4648({
  prefix: "f",
  name: "base16",
  alphabet: "0123456789abcdef",
  bitsPerChar: 4
});
var base16upper = rfc4648({
  prefix: "F",
  name: "base16upper",
  alphabet: "0123456789ABCDEF",
  bitsPerChar: 4
});

// ../../node_modules/multiformats/dist/src/bases/base2.js
var base2_exports = {};
__export(base2_exports, {
  base2: () => base2
});
var base2 = rfc4648({
  prefix: "0",
  name: "base2",
  alphabet: "01",
  bitsPerChar: 1
});

// ../../node_modules/multiformats/dist/src/bases/base256emoji.js
var base256emoji_exports = {};
__export(base256emoji_exports, {
  base256emoji: () => base256emoji
});
var alphabet = Array.from("\u{1F680}\u{1FA90}\u2604\u{1F6F0}\u{1F30C}\u{1F311}\u{1F312}\u{1F313}\u{1F314}\u{1F315}\u{1F316}\u{1F317}\u{1F318}\u{1F30D}\u{1F30F}\u{1F30E}\u{1F409}\u2600\u{1F4BB}\u{1F5A5}\u{1F4BE}\u{1F4BF}\u{1F602}\u2764\u{1F60D}\u{1F923}\u{1F60A}\u{1F64F}\u{1F495}\u{1F62D}\u{1F618}\u{1F44D}\u{1F605}\u{1F44F}\u{1F601}\u{1F525}\u{1F970}\u{1F494}\u{1F496}\u{1F499}\u{1F622}\u{1F914}\u{1F606}\u{1F644}\u{1F4AA}\u{1F609}\u263A\u{1F44C}\u{1F917}\u{1F49C}\u{1F614}\u{1F60E}\u{1F607}\u{1F339}\u{1F926}\u{1F389}\u{1F49E}\u270C\u2728\u{1F937}\u{1F631}\u{1F60C}\u{1F338}\u{1F64C}\u{1F60B}\u{1F497}\u{1F49A}\u{1F60F}\u{1F49B}\u{1F642}\u{1F493}\u{1F929}\u{1F604}\u{1F600}\u{1F5A4}\u{1F603}\u{1F4AF}\u{1F648}\u{1F447}\u{1F3B6}\u{1F612}\u{1F92D}\u2763\u{1F61C}\u{1F48B}\u{1F440}\u{1F62A}\u{1F611}\u{1F4A5}\u{1F64B}\u{1F61E}\u{1F629}\u{1F621}\u{1F92A}\u{1F44A}\u{1F973}\u{1F625}\u{1F924}\u{1F449}\u{1F483}\u{1F633}\u270B\u{1F61A}\u{1F61D}\u{1F634}\u{1F31F}\u{1F62C}\u{1F643}\u{1F340}\u{1F337}\u{1F63B}\u{1F613}\u2B50\u2705\u{1F97A}\u{1F308}\u{1F608}\u{1F918}\u{1F4A6}\u2714\u{1F623}\u{1F3C3}\u{1F490}\u2639\u{1F38A}\u{1F498}\u{1F620}\u261D\u{1F615}\u{1F33A}\u{1F382}\u{1F33B}\u{1F610}\u{1F595}\u{1F49D}\u{1F64A}\u{1F639}\u{1F5E3}\u{1F4AB}\u{1F480}\u{1F451}\u{1F3B5}\u{1F91E}\u{1F61B}\u{1F534}\u{1F624}\u{1F33C}\u{1F62B}\u26BD\u{1F919}\u2615\u{1F3C6}\u{1F92B}\u{1F448}\u{1F62E}\u{1F646}\u{1F37B}\u{1F343}\u{1F436}\u{1F481}\u{1F632}\u{1F33F}\u{1F9E1}\u{1F381}\u26A1\u{1F31E}\u{1F388}\u274C\u270A\u{1F44B}\u{1F630}\u{1F928}\u{1F636}\u{1F91D}\u{1F6B6}\u{1F4B0}\u{1F353}\u{1F4A2}\u{1F91F}\u{1F641}\u{1F6A8}\u{1F4A8}\u{1F92C}\u2708\u{1F380}\u{1F37A}\u{1F913}\u{1F619}\u{1F49F}\u{1F331}\u{1F616}\u{1F476}\u{1F974}\u25B6\u27A1\u2753\u{1F48E}\u{1F4B8}\u2B07\u{1F628}\u{1F31A}\u{1F98B}\u{1F637}\u{1F57A}\u26A0\u{1F645}\u{1F61F}\u{1F635}\u{1F44E}\u{1F932}\u{1F920}\u{1F927}\u{1F4CC}\u{1F535}\u{1F485}\u{1F9D0}\u{1F43E}\u{1F352}\u{1F617}\u{1F911}\u{1F30A}\u{1F92F}\u{1F437}\u260E\u{1F4A7}\u{1F62F}\u{1F486}\u{1F446}\u{1F3A4}\u{1F647}\u{1F351}\u2744\u{1F334}\u{1F4A3}\u{1F438}\u{1F48C}\u{1F4CD}\u{1F940}\u{1F922}\u{1F445}\u{1F4A1}\u{1F4A9}\u{1F450}\u{1F4F8}\u{1F47B}\u{1F910}\u{1F92E}\u{1F3BC}\u{1F975}\u{1F6A9}\u{1F34E}\u{1F34A}\u{1F47C}\u{1F48D}\u{1F4E3}\u{1F942}");
var alphabetBytesToChars = alphabet.reduce((p, c, i) => {
  p[i] = c;
  return p;
}, []);
var alphabetCharsToBytes = alphabet.reduce((p, c, i) => {
  const codePoint = c.codePointAt(0);
  if (codePoint == null) {
    throw new Error(`Invalid character: ${c}`);
  }
  p[codePoint] = i;
  return p;
}, []);
function encode2(data) {
  return data.reduce((p, c) => {
    p += alphabetBytesToChars[c];
    return p;
  }, "");
}
function decode2(str) {
  const byts = [];
  for (const char of str) {
    const codePoint = char.codePointAt(0);
    if (codePoint == null) {
      throw new Error(`Invalid character: ${char}`);
    }
    const byt = alphabetCharsToBytes[codePoint];
    if (byt == null) {
      throw new Error(`Non-base256emoji character: ${char}`);
    }
    byts.push(byt);
  }
  return new Uint8Array(byts);
}
var base256emoji = from({
  prefix: "\u{1F680}",
  name: "base256emoji",
  encode: encode2,
  decode: decode2
});

// ../../node_modules/multiformats/dist/src/bases/base32.js
var base32_exports = {};
__export(base32_exports, {
  base32: () => base32,
  base32hex: () => base32hex,
  base32hexpad: () => base32hexpad,
  base32hexpadupper: () => base32hexpadupper,
  base32hexupper: () => base32hexupper,
  base32pad: () => base32pad,
  base32padupper: () => base32padupper,
  base32upper: () => base32upper,
  base32z: () => base32z
});
var base32 = rfc4648({
  prefix: "b",
  name: "base32",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567",
  bitsPerChar: 5
});
var base32upper = rfc4648({
  prefix: "B",
  name: "base32upper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  bitsPerChar: 5
});
var base32pad = rfc4648({
  prefix: "c",
  name: "base32pad",
  alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
  bitsPerChar: 5
});
var base32padupper = rfc4648({
  prefix: "C",
  name: "base32padupper",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
  bitsPerChar: 5
});
var base32hex = rfc4648({
  prefix: "v",
  name: "base32hex",
  alphabet: "0123456789abcdefghijklmnopqrstuv",
  bitsPerChar: 5
});
var base32hexupper = rfc4648({
  prefix: "V",
  name: "base32hexupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
  bitsPerChar: 5
});
var base32hexpad = rfc4648({
  prefix: "t",
  name: "base32hexpad",
  alphabet: "0123456789abcdefghijklmnopqrstuv=",
  bitsPerChar: 5
});
var base32hexpadupper = rfc4648({
  prefix: "T",
  name: "base32hexpadupper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
  bitsPerChar: 5
});
var base32z = rfc4648({
  prefix: "h",
  name: "base32z",
  alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
  bitsPerChar: 5
});

// ../../node_modules/multiformats/dist/src/bases/base36.js
var base36_exports = {};
__export(base36_exports, {
  base36: () => base36,
  base36upper: () => base36upper
});
var base36 = baseX({
  prefix: "k",
  name: "base36",
  alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
});
var base36upper = baseX({
  prefix: "K",
  name: "base36upper",
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});

// ../../node_modules/multiformats/dist/src/bases/base58.js
var base58_exports = {};
__export(base58_exports, {
  base58btc: () => base58btc,
  base58flickr: () => base58flickr
});
var base58btc = baseX({
  name: "base58btc",
  prefix: "z",
  alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
var base58flickr = baseX({
  name: "base58flickr",
  prefix: "Z",
  alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});

// ../../node_modules/multiformats/dist/src/bases/base64.js
var base64_exports = {};
__export(base64_exports, {
  base64: () => base64,
  base64pad: () => base64pad,
  base64url: () => base64url,
  base64urlpad: () => base64urlpad
});
var base64 = rfc4648({
  prefix: "m",
  name: "base64",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  bitsPerChar: 6
});
var base64pad = rfc4648({
  prefix: "M",
  name: "base64pad",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  bitsPerChar: 6
});
var base64url = rfc4648({
  prefix: "u",
  name: "base64url",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  bitsPerChar: 6
});
var base64urlpad = rfc4648({
  prefix: "U",
  name: "base64urlpad",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
  bitsPerChar: 6
});

// ../../node_modules/multiformats/dist/src/bases/base8.js
var base8_exports = {};
__export(base8_exports, {
  base8: () => base8
});
var base8 = rfc4648({
  prefix: "7",
  name: "base8",
  alphabet: "01234567",
  bitsPerChar: 3
});

// ../../node_modules/multiformats/dist/src/bases/identity.js
var identity_exports = {};
__export(identity_exports, {
  identity: () => identity
});
var identity = from({
  prefix: "\0",
  name: "identity",
  encode: (buf) => toString(buf),
  decode: (str) => fromString(str)
});

// ../../node_modules/multiformats/dist/src/codecs/json.js
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder();

// ../../node_modules/multiformats/dist/src/hashes/identity.js
var identity_exports2 = {};
__export(identity_exports2, {
  identity: () => identity2
});

// ../../node_modules/multiformats/dist/src/vendor/varint.js
var encode_1 = encode3;
var MSB = 128;
var REST = 127;
var MSBALL = ~REST;
var INT = Math.pow(2, 31);
function encode3(num, out, offset) {
  out = out || [];
  offset = offset || 0;
  var oldOffset = offset;
  while (num >= INT) {
    out[offset++] = num & 255 | MSB;
    num /= 128;
  }
  while (num & MSBALL) {
    out[offset++] = num & 255 | MSB;
    num >>>= 7;
  }
  out[offset] = num | 0;
  encode3.bytes = offset - oldOffset + 1;
  return out;
}
var decode3 = read;
var MSB$1 = 128;
var REST$1 = 127;
function read(buf, offset) {
  var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
  do {
    if (counter >= l) {
      read.bytes = 0;
      throw new RangeError("Could not decode varint");
    }
    b = buf[counter++];
    res += shift < 28 ? (b & REST$1) << shift : (b & REST$1) * Math.pow(2, shift);
    shift += 7;
  } while (b >= MSB$1);
  read.bytes = counter - offset;
  return res;
}
var N1 = Math.pow(2, 7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);
var length = function(value) {
  return value < N1 ? 1 : value < N2 ? 2 : value < N3 ? 3 : value < N4 ? 4 : value < N5 ? 5 : value < N6 ? 6 : value < N7 ? 7 : value < N8 ? 8 : value < N9 ? 9 : 10;
};
var varint = {
  encode: encode_1,
  decode: decode3,
  encodingLength: length
};
var _brrp_varint = varint;
var varint_default = _brrp_varint;

// ../../node_modules/multiformats/dist/src/varint.js
function decode4(data, offset = 0) {
  const code2 = varint_default.decode(data, offset);
  return [code2, varint_default.decode.bytes];
}
function encodeTo(int, target, offset = 0) {
  varint_default.encode(int, target, offset);
  return target;
}
function encodingLength(int) {
  return varint_default.encodingLength(int);
}

// ../../node_modules/multiformats/dist/src/hashes/digest.js
function create(code2, digest3) {
  const size = digest3.byteLength;
  const sizeOffset = encodingLength(code2);
  const digestOffset = sizeOffset + encodingLength(size);
  const bytes2 = new Uint8Array(digestOffset + size);
  encodeTo(code2, bytes2, 0);
  encodeTo(size, bytes2, sizeOffset);
  bytes2.set(digest3, digestOffset);
  return new Digest(code2, size, digest3, bytes2);
}
function decode5(multihash) {
  const bytes2 = coerce(multihash);
  const [code2, sizeOffset] = decode4(bytes2);
  const [size, digestOffset] = decode4(bytes2.subarray(sizeOffset));
  const digest3 = bytes2.subarray(sizeOffset + digestOffset);
  if (digest3.byteLength !== size) {
    throw new Error("Incorrect length");
  }
  return new Digest(code2, size, digest3, bytes2);
}
function equals2(a, b) {
  if (a === b) {
    return true;
  } else {
    const data = b;
    return a.code === data.code && a.size === data.size && data.bytes instanceof Uint8Array && equals(a.bytes, data.bytes);
  }
}
var Digest = class {
  code;
  size;
  digest;
  bytes;
  /**
   * Creates a multihash digest.
   */
  constructor(code2, size, digest3, bytes2) {
    this.code = code2;
    this.size = size;
    this.digest = digest3;
    this.bytes = bytes2;
  }
};

// ../../node_modules/multiformats/dist/src/hashes/identity.js
var code = 0;
var name = "identity";
var encode4 = coerce;
function digest(input) {
  return create(code, encode4(input));
}
var identity2 = { code, name, encode: encode4, digest };

// ../../node_modules/multiformats/dist/src/hashes/sha2.js
var sha2_exports = {};
__export(sha2_exports, {
  sha256: () => sha256,
  sha512: () => sha512
});
import crypto2 from "crypto";

// ../../node_modules/multiformats/dist/src/hashes/hasher.js
function from2({ name: name3, code: code2, encode: encode7 }) {
  return new Hasher(name3, code2, encode7);
}
var Hasher = class {
  name;
  code;
  encode;
  constructor(name3, code2, encode7) {
    this.name = name3;
    this.code = code2;
    this.encode = encode7;
  }
  digest(input) {
    if (input instanceof Uint8Array) {
      const result = this.encode(input);
      return result instanceof Uint8Array ? create(this.code, result) : result.then((digest3) => create(this.code, digest3));
    } else {
      throw Error("Unknown type, must be binary type");
    }
  }
};

// ../../node_modules/multiformats/dist/src/hashes/sha2.js
var sha256 = from2({
  name: "sha2-256",
  code: 18,
  encode: (input) => coerce(crypto2.createHash("sha256").update(input).digest())
});
var sha512 = from2({
  name: "sha2-512",
  code: 19,
  encode: (input) => coerce(crypto2.createHash("sha512").update(input).digest())
});

// ../../node_modules/multiformats/dist/src/cid.js
function format(link, base3) {
  const { bytes: bytes2, version: version2 } = link;
  switch (version2) {
    case 0:
      return toStringV0(bytes2, baseCache(link), base3 ?? base58btc.encoder);
    default:
      return toStringV1(bytes2, baseCache(link), base3 ?? base32.encoder);
  }
}
var cache = /* @__PURE__ */ new WeakMap();
function baseCache(cid) {
  const baseCache2 = cache.get(cid);
  if (baseCache2 == null) {
    const baseCache3 = /* @__PURE__ */ new Map();
    cache.set(cid, baseCache3);
    return baseCache3;
  }
  return baseCache2;
}
var CID = class _CID {
  code;
  version;
  multihash;
  bytes;
  "/";
  /**
   * @param version - Version of the CID
   * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
   * @param multihash - (Multi)hash of the of the content.
   */
  constructor(version2, code2, multihash, bytes2) {
    this.code = code2;
    this.version = version2;
    this.multihash = multihash;
    this.bytes = bytes2;
    this["/"] = bytes2;
  }
  /**
   * Signalling `cid.asCID === cid` has been replaced with `cid['/'] === cid.bytes`
   * please either use `CID.asCID(cid)` or switch to new signalling mechanism
   *
   * @deprecated
   */
  get asCID() {
    return this;
  }
  // ArrayBufferView
  get byteOffset() {
    return this.bytes.byteOffset;
  }
  // ArrayBufferView
  get byteLength() {
    return this.bytes.byteLength;
  }
  toV0() {
    switch (this.version) {
      case 0: {
        return this;
      }
      case 1: {
        const { code: code2, multihash } = this;
        if (code2 !== DAG_PB_CODE) {
          throw new Error("Cannot convert a non dag-pb CID to CIDv0");
        }
        if (multihash.code !== SHA_256_CODE) {
          throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
        }
        return _CID.createV0(multihash);
      }
      default: {
        throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
      }
    }
  }
  toV1() {
    switch (this.version) {
      case 0: {
        const { code: code2, digest: digest3 } = this.multihash;
        const multihash = create(code2, digest3);
        return _CID.createV1(this.code, multihash);
      }
      case 1: {
        return this;
      }
      default: {
        throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
      }
    }
  }
  equals(other) {
    return _CID.equals(this, other);
  }
  static equals(self2, other) {
    const unknown = other;
    return unknown != null && self2.code === unknown.code && self2.version === unknown.version && equals2(self2.multihash, unknown.multihash);
  }
  toString(base3) {
    return format(this, base3);
  }
  toJSON() {
    return { "/": format(this) };
  }
  link() {
    return this;
  }
  [Symbol.toStringTag] = "CID";
  // Legacy
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `CID(${this.toString()})`;
  }
  /**
   * Takes any input `value` and returns a `CID` instance if it was
   * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
   * it will return value back. If `value` is not instance of this CID
   * class, but is compatible CID it will return new instance of this
   * `CID` class. Otherwise returns null.
   *
   * This allows two different incompatible versions of CID library to
   * co-exist and interop as long as binary interface is compatible.
   */
  static asCID(input) {
    if (input == null) {
      return null;
    }
    const value = input;
    if (value instanceof _CID) {
      return value;
    } else if (value["/"] != null && value["/"] === value.bytes || value.asCID === value) {
      const { version: version2, code: code2, multihash, bytes: bytes2 } = value;
      return new _CID(version2, code2, multihash, bytes2 ?? encodeCID(version2, code2, multihash.bytes));
    } else if (value[cidSymbol] === true) {
      const { version: version2, multihash, code: code2 } = value;
      const digest3 = decode5(multihash);
      return _CID.create(version2, code2, digest3);
    } else {
      return null;
    }
  }
  /**
   * @param version - Version of the CID
   * @param code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
   * @param digest - (Multi)hash of the of the content.
   */
  static create(version2, code2, digest3) {
    if (typeof code2 !== "number") {
      throw new Error("String codecs are no longer supported");
    }
    if (!(digest3.bytes instanceof Uint8Array)) {
      throw new Error("Invalid digest");
    }
    switch (version2) {
      case 0: {
        if (code2 !== DAG_PB_CODE) {
          throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`);
        } else {
          return new _CID(version2, code2, digest3, digest3.bytes);
        }
      }
      case 1: {
        const bytes2 = encodeCID(version2, code2, digest3.bytes);
        return new _CID(version2, code2, digest3, bytes2);
      }
      default: {
        throw new Error("Invalid version");
      }
    }
  }
  /**
   * Simplified version of `create` for CIDv0.
   */
  static createV0(digest3) {
    return _CID.create(0, DAG_PB_CODE, digest3);
  }
  /**
   * Simplified version of `create` for CIDv1.
   *
   * @param code - Content encoding format code.
   * @param digest - Multihash of the content.
   */
  static createV1(code2, digest3) {
    return _CID.create(1, code2, digest3);
  }
  /**
   * Decoded a CID from its binary representation. The byte array must contain
   * only the CID with no additional bytes.
   *
   * An error will be thrown if the bytes provided do not contain a valid
   * binary representation of a CID.
   */
  static decode(bytes2) {
    const [cid, remainder] = _CID.decodeFirst(bytes2);
    if (remainder.length !== 0) {
      throw new Error("Incorrect length");
    }
    return cid;
  }
  /**
   * Decoded a CID from its binary representation at the beginning of a byte
   * array.
   *
   * Returns an array with the first element containing the CID and the second
   * element containing the remainder of the original byte array. The remainder
   * will be a zero-length byte array if the provided bytes only contained a
   * binary CID representation.
   */
  static decodeFirst(bytes2) {
    const specs = _CID.inspectBytes(bytes2);
    const prefixSize = specs.size - specs.multihashSize;
    const multihashBytes = coerce(bytes2.subarray(prefixSize, prefixSize + specs.multihashSize));
    if (multihashBytes.byteLength !== specs.multihashSize) {
      throw new Error("Incorrect length");
    }
    const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
    const digest3 = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
    const cid = specs.version === 0 ? _CID.createV0(digest3) : _CID.createV1(specs.codec, digest3);
    return [cid, bytes2.subarray(specs.size)];
  }
  /**
   * Inspect the initial bytes of a CID to determine its properties.
   *
   * Involves decoding up to 4 varints. Typically this will require only 4 to 6
   * bytes but for larger multicodec code values and larger multihash digest
   * lengths these varints can be quite large. It is recommended that at least
   * 10 bytes be made available in the `initialBytes` argument for a complete
   * inspection.
   */
  static inspectBytes(initialBytes) {
    let offset = 0;
    const next = () => {
      const [i, length3] = decode4(initialBytes.subarray(offset));
      offset += length3;
      return i;
    };
    let version2 = next();
    let codec = DAG_PB_CODE;
    if (version2 === 18) {
      version2 = 0;
      offset = 0;
    } else {
      codec = next();
    }
    if (version2 !== 0 && version2 !== 1) {
      throw new RangeError(`Invalid CID version ${version2}`);
    }
    const prefixSize = offset;
    const multihashCode = next();
    const digestSize = next();
    const size = offset + digestSize;
    const multihashSize = size - prefixSize;
    return { version: version2, codec, multihashCode, digestSize, multihashSize, size };
  }
  /**
   * Takes cid in a string representation and creates an instance. If `base`
   * decoder is not provided will use a default from the configuration. It will
   * throw an error if encoding of the CID is not compatible with supplied (or
   * a default decoder).
   */
  static parse(source, base3) {
    const [prefix, bytes2] = parseCIDtoBytes(source, base3);
    const cid = _CID.decode(bytes2);
    if (cid.version === 0 && source[0] !== "Q") {
      throw Error("Version 0 CID string must not include multibase prefix");
    }
    baseCache(cid).set(prefix, source);
    return cid;
  }
};
function parseCIDtoBytes(source, base3) {
  switch (source[0]) {
    // CIDv0 is parsed differently
    case "Q": {
      const decoder = base3 ?? base58btc;
      return [
        base58btc.prefix,
        decoder.decode(`${base58btc.prefix}${source}`)
      ];
    }
    case base58btc.prefix: {
      const decoder = base3 ?? base58btc;
      return [base58btc.prefix, decoder.decode(source)];
    }
    case base32.prefix: {
      const decoder = base3 ?? base32;
      return [base32.prefix, decoder.decode(source)];
    }
    case base36.prefix: {
      const decoder = base3 ?? base36;
      return [base36.prefix, decoder.decode(source)];
    }
    default: {
      if (base3 == null) {
        throw Error("To parse non base32, base36 or base58btc encoded CID multibase decoder must be provided");
      }
      return [source[0], base3.decode(source)];
    }
  }
}
function toStringV0(bytes2, cache3, base3) {
  const { prefix } = base3;
  if (prefix !== base58btc.prefix) {
    throw Error(`Cannot string encode V0 in ${base3.name} encoding`);
  }
  const cid = cache3.get(prefix);
  if (cid == null) {
    const cid2 = base3.encode(bytes2).slice(1);
    cache3.set(prefix, cid2);
    return cid2;
  } else {
    return cid;
  }
}
function toStringV1(bytes2, cache3, base3) {
  const { prefix } = base3;
  const cid = cache3.get(prefix);
  if (cid == null) {
    const cid2 = base3.encode(bytes2);
    cache3.set(prefix, cid2);
    return cid2;
  } else {
    return cid;
  }
}
var DAG_PB_CODE = 112;
var SHA_256_CODE = 18;
function encodeCID(version2, code2, multihash) {
  const codeOffset = encodingLength(version2);
  const hashOffset = codeOffset + encodingLength(code2);
  const bytes2 = new Uint8Array(hashOffset + multihash.byteLength);
  encodeTo(version2, bytes2, 0);
  encodeTo(code2, bytes2, codeOffset);
  bytes2.set(multihash, hashOffset);
  return bytes2;
}
var cidSymbol = Symbol.for("@ipld/js-cid/CID");

// ../../node_modules/multiformats/dist/src/basics.js
var bases = { ...identity_exports, ...base2_exports, ...base8_exports, ...base10_exports, ...base16_exports, ...base32_exports, ...base36_exports, ...base58_exports, ...base64_exports, ...base256emoji_exports };
var hashes = { ...sha2_exports, ...identity_exports2 };

// ../../node_modules/uint8arrays/dist/src/alloc.node.js
import { Buffer as Buffer2 } from "node:buffer";

// ../../node_modules/uint8arrays/dist/src/util/as-uint8array.node.js
function asUint8Array(buf) {
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

// ../../node_modules/uint8arrays/dist/src/alloc.node.js
function alloc(size = 0) {
  return asUint8Array(Buffer2.alloc(size));
}
function allocUnsafe(size = 0) {
  return asUint8Array(Buffer2.allocUnsafe(size));
}

// ../../node_modules/uint8arrays/dist/src/util/bases.js
function createCodec(name3, prefix, encode7, decode8) {
  return {
    name: name3,
    prefix,
    encoder: {
      name: name3,
      prefix,
      encode: encode7
    },
    decoder: {
      decode: decode8
    }
  };
}
var string = createCodec("utf8", "u", (buf) => {
  const decoder = new TextDecoder("utf8");
  return "u" + decoder.decode(buf);
}, (str) => {
  const encoder = new TextEncoder();
  return encoder.encode(str.substring(1));
});
var ascii = createCodec("ascii", "a", (buf) => {
  let string3 = "a";
  for (let i = 0; i < buf.length; i++) {
    string3 += String.fromCharCode(buf[i]);
  }
  return string3;
}, (str) => {
  str = str.substring(1);
  const buf = allocUnsafe(str.length);
  for (let i = 0; i < str.length; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
});
var BASES = {
  utf8: string,
  "utf-8": string,
  hex: bases.base16,
  latin1: ascii,
  ascii,
  binary: ascii,
  ...bases
};
var bases_default = BASES;

// ../../node_modules/uint8arrays/dist/src/to-string.node.js
function toString2(array, encoding = "utf8") {
  const base3 = bases_default[encoding];
  if (base3 == null) {
    throw new Error(`Unsupported encoding "${encoding}"`);
  }
  if (encoding === "utf8" || encoding === "utf-8") {
    return Buffer3.from(array.buffer, array.byteOffset, array.byteLength).toString("utf8");
  }
  return base3.encoder.encode(array).substring(1);
}

// ../../node_modules/@multiformats/dns/dist/src/utils/to-dns-response.js
var DEFAULT_TTL = 60;
function toDNSResponse(obj) {
  return {
    Status: obj.Status ?? 0,
    TC: obj.TC ?? obj.flag_tc ?? false,
    RD: obj.RD ?? obj.flag_rd ?? false,
    RA: obj.RA ?? obj.flag_ra ?? false,
    AD: obj.AD ?? obj.flag_ad ?? false,
    CD: obj.CD ?? obj.flag_cd ?? false,
    Question: (obj.Question ?? obj.questions ?? []).map((question) => {
      return {
        name: question.name,
        type: RecordType[question.type]
      };
    }),
    Answer: (obj.Answer ?? obj.answers ?? []).map((answer) => {
      return {
        name: answer.name,
        type: RecordType[answer.type],
        TTL: answer.TTL ?? answer.ttl ?? DEFAULT_TTL,
        data: answer.data instanceof Uint8Array ? toString2(answer.data) : answer.data
      };
    })
  };
}

// ../../node_modules/@multiformats/dns/dist/src/resolvers/default.js
var nodeResolver = async (fqdn, options = {}) => {
  const resolver = new Resolver();
  const listener = () => {
    resolver.cancel();
  };
  const types = getTypes(options.types);
  try {
    options.signal?.addEventListener("abort", listener);
    const answers = await Promise.all(types.map(async (type) => {
      if (type === RecordType.A) {
        return mapToAnswers(fqdn, type, await resolver.resolve4(fqdn));
      }
      if (type === RecordType.CNAME) {
        return mapToAnswers(fqdn, type, await resolver.resolveCname(fqdn));
      }
      if (type === RecordType.TXT) {
        return mapToAnswers(fqdn, type, await resolver.resolveTxt(fqdn));
      }
      if (type === RecordType.AAAA) {
        return mapToAnswers(fqdn, type, await resolver.resolve6(fqdn));
      }
      throw new TypeError("Unsupported DNS record type");
    }));
    return toDNSResponse({
      Question: types.map((type) => ({
        name: fqdn,
        type
      })),
      Answer: answers.flat()
    });
  } finally {
    options.signal?.removeEventListener("abort", listener);
  }
};
function defaultResolver() {
  return [
    nodeResolver
  ];
}
function mapToAnswer(name3, type, data) {
  return {
    name: name3,
    type,
    data
  };
}
function mapToAnswers(name3, type, data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  return data.map((data2) => {
    if (Array.isArray(data2)) {
      return data2.map((data3) => mapToAnswer(name3, type, data3));
    }
    return mapToAnswer(name3, type, data2);
  }).flat();
}

// ../../node_modules/@multiformats/dns/dist/src/utils/cache.js
var import_hashlru = __toESM(require_hashlru(), 1);
var CachedAnswers = class {
  lru;
  constructor(maxSize) {
    this.lru = (0, import_hashlru.default)(maxSize);
  }
  get(fqdn, types) {
    let foundAllAnswers = true;
    const answers = [];
    for (const type of types) {
      const cached = this.getAnswers(fqdn, type);
      if (cached.length === 0) {
        foundAllAnswers = false;
        break;
      }
      answers.push(...cached);
    }
    if (foundAllAnswers) {
      return toDNSResponse({ answers });
    }
  }
  getAnswers(domain, type) {
    const key = `${domain.toLowerCase()}-${type}`;
    const answers = this.lru.get(key);
    if (answers != null) {
      const cachedAnswers = answers.filter((entry) => {
        return entry.expires > Date.now();
      }).map(({ expires, value }) => ({
        ...value,
        TTL: Math.round((expires - Date.now()) / 1e3),
        type: RecordType[value.type]
      }));
      if (cachedAnswers.length === 0) {
        this.lru.remove(key);
      }
      return cachedAnswers;
    }
    return [];
  }
  add(domain, answer) {
    const key = `${domain.toLowerCase()}-${answer.type}`;
    const answers = this.lru.get(key) ?? [];
    answers.push({
      expires: Date.now() + (answer.TTL ?? DEFAULT_TTL) * 1e3,
      value: answer
    });
    this.lru.set(key, answers);
  }
  remove(domain, type) {
    const key = `${domain.toLowerCase()}-${type}`;
    this.lru.remove(key);
  }
  clear() {
    this.lru.clear();
  }
};
function cache2(size) {
  return new CachedAnswers(size);
}

// ../../node_modules/@multiformats/dns/dist/src/dns.js
var DEFAULT_ANSWER_CACHE_SIZE = 1e3;
var DNS = class {
  resolvers;
  cache;
  constructor(init) {
    this.resolvers = {};
    this.cache = cache2(init.cacheSize ?? DEFAULT_ANSWER_CACHE_SIZE);
    Object.entries(init.resolvers ?? {}).forEach(([tld, resolver]) => {
      if (!Array.isArray(resolver)) {
        resolver = [resolver];
      }
      if (!tld.endsWith(".")) {
        tld = `${tld}.`;
      }
      this.resolvers[tld] = resolver;
    });
    if (this.resolvers["."] == null) {
      this.resolvers["."] = defaultResolver();
    }
  }
  /**
   * Queries DNS resolvers for the passed record types for the passed domain.
   *
   * If cached records exist for all desired types they will be returned
   * instead.
   *
   * Any new responses will be added to the cache for subsequent requests.
   */
  async query(domain, options = {}) {
    const types = getTypes(options.types);
    const cached = options.cached !== false ? this.cache.get(domain, types) : void 0;
    if (cached != null) {
      options.onProgress?.(new CustomProgressEvent("dns:cache", { detail: cached }));
      return cached;
    }
    const tld = `${domain.split(".").pop()}.`;
    const resolvers2 = (this.resolvers[tld] ?? this.resolvers["."]).sort(() => {
      return Math.random() > 0.5 ? -1 : 1;
    });
    const errors = [];
    for (const resolver of resolvers2) {
      if (options.signal?.aborted === true) {
        break;
      }
      try {
        const result = await resolver(domain, {
          ...options,
          types
        });
        for (const answer of result.Answer) {
          this.cache.add(domain, answer);
        }
        return result;
      } catch (err) {
        errors.push(err);
        options.onProgress?.(new CustomProgressEvent("dns:error", { detail: err }));
      }
    }
    if (errors.length === 1) {
      throw errors[0];
    }
    throw new AggregateError(errors, `DNS lookup of ${domain} ${types} failed`);
  }
};

// ../../node_modules/@multiformats/dns/dist/src/index.js
var RecordType;
(function(RecordType2) {
  RecordType2[RecordType2["A"] = 1] = "A";
  RecordType2[RecordType2["CNAME"] = 5] = "CNAME";
  RecordType2[RecordType2["TXT"] = 16] = "TXT";
  RecordType2[RecordType2["AAAA"] = 28] = "AAAA";
})(RecordType || (RecordType = {}));
function dns(init = {}) {
  return new DNS(init);
}

// ../../node_modules/uint8arrays/dist/src/equals.js
function equals3(a, b) {
  if (a === b) {
    return true;
  }
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

// ../../node_modules/uint8-varint/dist/src/index.js
var N12 = Math.pow(2, 7);
var N22 = Math.pow(2, 14);
var N32 = Math.pow(2, 21);
var N42 = Math.pow(2, 28);
var N52 = Math.pow(2, 35);
var N62 = Math.pow(2, 42);
var N72 = Math.pow(2, 49);
var MSB2 = 128;
var REST2 = 127;
function encodingLength2(value) {
  if (value < N12) {
    return 1;
  }
  if (value < N22) {
    return 2;
  }
  if (value < N32) {
    return 3;
  }
  if (value < N42) {
    return 4;
  }
  if (value < N52) {
    return 5;
  }
  if (value < N62) {
    return 6;
  }
  if (value < N72) {
    return 7;
  }
  if (Number.MAX_SAFE_INTEGER != null && value > Number.MAX_SAFE_INTEGER) {
    throw new RangeError("Could not encode varint");
  }
  return 8;
}
function encodeUint8Array(value, buf, offset = 0) {
  switch (encodingLength2(value)) {
    case 8: {
      buf[offset++] = value & 255 | MSB2;
      value /= 128;
    }
    case 7: {
      buf[offset++] = value & 255 | MSB2;
      value /= 128;
    }
    case 6: {
      buf[offset++] = value & 255 | MSB2;
      value /= 128;
    }
    case 5: {
      buf[offset++] = value & 255 | MSB2;
      value /= 128;
    }
    case 4: {
      buf[offset++] = value & 255 | MSB2;
      value >>>= 7;
    }
    case 3: {
      buf[offset++] = value & 255 | MSB2;
      value >>>= 7;
    }
    case 2: {
      buf[offset++] = value & 255 | MSB2;
      value >>>= 7;
    }
    case 1: {
      buf[offset++] = value & 255;
      value >>>= 7;
      break;
    }
    default:
      throw new Error("unreachable");
  }
  return buf;
}
function encodeUint8ArrayList(value, buf, offset = 0) {
  switch (encodingLength2(value)) {
    case 8: {
      buf.set(offset++, value & 255 | MSB2);
      value /= 128;
    }
    case 7: {
      buf.set(offset++, value & 255 | MSB2);
      value /= 128;
    }
    case 6: {
      buf.set(offset++, value & 255 | MSB2);
      value /= 128;
    }
    case 5: {
      buf.set(offset++, value & 255 | MSB2);
      value /= 128;
    }
    case 4: {
      buf.set(offset++, value & 255 | MSB2);
      value >>>= 7;
    }
    case 3: {
      buf.set(offset++, value & 255 | MSB2);
      value >>>= 7;
    }
    case 2: {
      buf.set(offset++, value & 255 | MSB2);
      value >>>= 7;
    }
    case 1: {
      buf.set(offset++, value & 255);
      value >>>= 7;
      break;
    }
    default:
      throw new Error("unreachable");
  }
  return buf;
}
function decodeUint8Array(buf, offset) {
  let b = buf[offset];
  let res = 0;
  res += b & REST2;
  if (b < MSB2) {
    return res;
  }
  b = buf[offset + 1];
  res += (b & REST2) << 7;
  if (b < MSB2) {
    return res;
  }
  b = buf[offset + 2];
  res += (b & REST2) << 14;
  if (b < MSB2) {
    return res;
  }
  b = buf[offset + 3];
  res += (b & REST2) << 21;
  if (b < MSB2) {
    return res;
  }
  b = buf[offset + 4];
  res += (b & REST2) * N42;
  if (b < MSB2) {
    return res;
  }
  b = buf[offset + 5];
  res += (b & REST2) * N52;
  if (b < MSB2) {
    return res;
  }
  b = buf[offset + 6];
  res += (b & REST2) * N62;
  if (b < MSB2) {
    return res;
  }
  b = buf[offset + 7];
  res += (b & REST2) * N72;
  if (b < MSB2) {
    return res;
  }
  throw new RangeError("Could not decode varint");
}
function decodeUint8ArrayList(buf, offset) {
  let b = buf.get(offset);
  let res = 0;
  res += b & REST2;
  if (b < MSB2) {
    return res;
  }
  b = buf.get(offset + 1);
  res += (b & REST2) << 7;
  if (b < MSB2) {
    return res;
  }
  b = buf.get(offset + 2);
  res += (b & REST2) << 14;
  if (b < MSB2) {
    return res;
  }
  b = buf.get(offset + 3);
  res += (b & REST2) << 21;
  if (b < MSB2) {
    return res;
  }
  b = buf.get(offset + 4);
  res += (b & REST2) * N42;
  if (b < MSB2) {
    return res;
  }
  b = buf.get(offset + 5);
  res += (b & REST2) * N52;
  if (b < MSB2) {
    return res;
  }
  b = buf.get(offset + 6);
  res += (b & REST2) * N62;
  if (b < MSB2) {
    return res;
  }
  b = buf.get(offset + 7);
  res += (b & REST2) * N72;
  if (b < MSB2) {
    return res;
  }
  throw new RangeError("Could not decode varint");
}
function encode5(value, buf, offset = 0) {
  if (buf == null) {
    buf = allocUnsafe(encodingLength2(value));
  }
  if (buf instanceof Uint8Array) {
    return encodeUint8Array(value, buf, offset);
  } else {
    return encodeUint8ArrayList(value, buf, offset);
  }
}
function decode6(buf, offset = 0) {
  if (buf instanceof Uint8Array) {
    return decodeUint8Array(buf, offset);
  } else {
    return decodeUint8ArrayList(buf, offset);
  }
}

// ../../node_modules/uint8arrays/dist/src/concat.node.js
import { Buffer as Buffer4 } from "node:buffer";
function concat(arrays, length3) {
  return asUint8Array(Buffer4.concat(arrays, length3));
}

// ../../node_modules/@chainsafe/is-ip/lib/parser.js
var Parser = class {
  index = 0;
  input = "";
  new(input) {
    this.index = 0;
    this.input = input;
    return this;
  }
  /** Run a parser, and restore the pre-parse state if it fails. */
  readAtomically(fn) {
    const index = this.index;
    const result = fn();
    if (result === void 0) {
      this.index = index;
    }
    return result;
  }
  /** Run a parser, but fail if the entire input wasn't consumed. Doesn't run atomically. */
  parseWith(fn) {
    const result = fn();
    if (this.index !== this.input.length) {
      return void 0;
    }
    return result;
  }
  /** Peek the next character from the input */
  peekChar() {
    if (this.index >= this.input.length) {
      return void 0;
    }
    return this.input[this.index];
  }
  /** Read the next character from the input */
  readChar() {
    if (this.index >= this.input.length) {
      return void 0;
    }
    return this.input[this.index++];
  }
  /** Read the next character from the input if it matches the target. */
  readGivenChar(target) {
    return this.readAtomically(() => {
      const char = this.readChar();
      if (char !== target) {
        return void 0;
      }
      return char;
    });
  }
  /**
   * Helper for reading separators in an indexed loop. Reads the separator
   * character iff index > 0, then runs the parser. When used in a loop,
   * the separator character will only be read on index > 0 (see
   * readIPv4Addr for an example)
   */
  readSeparator(sep, index, inner) {
    return this.readAtomically(() => {
      if (index > 0) {
        if (this.readGivenChar(sep) === void 0) {
          return void 0;
        }
      }
      return inner();
    });
  }
  /**
   * Read a number off the front of the input in the given radix, stopping
   * at the first non-digit character or eof. Fails if the number has more
   * digits than max_digits or if there is no number.
   */
  readNumber(radix, maxDigits, allowZeroPrefix, maxBytes) {
    return this.readAtomically(() => {
      let result = 0;
      let digitCount = 0;
      const leadingChar = this.peekChar();
      if (leadingChar === void 0) {
        return void 0;
      }
      const hasLeadingZero = leadingChar === "0";
      const maxValue = 2 ** (8 * maxBytes) - 1;
      while (true) {
        const digit = this.readAtomically(() => {
          const char = this.readChar();
          if (char === void 0) {
            return void 0;
          }
          const num = Number.parseInt(char, radix);
          if (Number.isNaN(num)) {
            return void 0;
          }
          return num;
        });
        if (digit === void 0) {
          break;
        }
        result *= radix;
        result += digit;
        if (result > maxValue) {
          return void 0;
        }
        digitCount += 1;
        if (maxDigits !== void 0) {
          if (digitCount > maxDigits) {
            return void 0;
          }
        }
      }
      if (digitCount === 0) {
        return void 0;
      } else if (!allowZeroPrefix && hasLeadingZero && digitCount > 1) {
        return void 0;
      } else {
        return result;
      }
    });
  }
  /** Read an IPv4 address. */
  readIPv4Addr() {
    return this.readAtomically(() => {
      const out = new Uint8Array(4);
      for (let i = 0; i < out.length; i++) {
        const ix = this.readSeparator(".", i, () => this.readNumber(10, 3, false, 1));
        if (ix === void 0) {
          return void 0;
        }
        out[i] = ix;
      }
      return out;
    });
  }
  /** Read an IPv6 Address. */
  readIPv6Addr() {
    const readGroups = (groups) => {
      for (let i = 0; i < groups.length / 2; i++) {
        const ix = i * 2;
        if (i < groups.length - 3) {
          const ipv4 = this.readSeparator(":", i, () => this.readIPv4Addr());
          if (ipv4 !== void 0) {
            groups[ix] = ipv4[0];
            groups[ix + 1] = ipv4[1];
            groups[ix + 2] = ipv4[2];
            groups[ix + 3] = ipv4[3];
            return [ix + 4, true];
          }
        }
        const group = this.readSeparator(":", i, () => this.readNumber(16, 4, true, 2));
        if (group === void 0) {
          return [ix, false];
        }
        groups[ix] = group >> 8;
        groups[ix + 1] = group & 255;
      }
      return [groups.length, false];
    };
    return this.readAtomically(() => {
      const head = new Uint8Array(16);
      const [headSize, headIp4] = readGroups(head);
      if (headSize === 16) {
        return head;
      }
      if (headIp4) {
        return void 0;
      }
      if (this.readGivenChar(":") === void 0) {
        return void 0;
      }
      if (this.readGivenChar(":") === void 0) {
        return void 0;
      }
      const tail = new Uint8Array(14);
      const limit = 16 - (headSize + 2);
      const [tailSize] = readGroups(tail.subarray(0, limit));
      head.set(tail.subarray(0, tailSize), 16 - tailSize);
      return head;
    });
  }
  /** Read an IP Address, either IPv4 or IPv6. */
  readIPAddr() {
    return this.readIPv4Addr() ?? this.readIPv6Addr();
  }
};

// ../../node_modules/@chainsafe/is-ip/lib/parse.js
var MAX_IPV6_LENGTH = 45;
var MAX_IPV4_LENGTH = 15;
var parser = new Parser();
function parseIPv4(input) {
  if (input.length > MAX_IPV4_LENGTH) {
    return void 0;
  }
  return parser.new(input).parseWith(() => parser.readIPv4Addr());
}
function parseIPv6(input) {
  if (input.includes("%")) {
    input = input.split("%")[0];
  }
  if (input.length > MAX_IPV6_LENGTH) {
    return void 0;
  }
  return parser.new(input).parseWith(() => parser.readIPv6Addr());
}
function parseIP(input) {
  if (input.includes("%")) {
    input = input.split("%")[0];
  }
  if (input.length > MAX_IPV6_LENGTH) {
    return void 0;
  }
  return parser.new(input).parseWith(() => parser.readIPAddr());
}

// ../../node_modules/@chainsafe/netmask/dist/src/util.js
function allFF(a, from3, to) {
  let i = 0;
  for (const e of a) {
    if (i < from3)
      continue;
    if (i > to)
      break;
    if (e !== 255)
      return false;
    i++;
  }
  return true;
}
function deepEqual(a, b, from3, to) {
  let i = 0;
  for (const e of a) {
    if (i < from3)
      continue;
    if (i > to)
      break;
    if (e !== b[i])
      return false;
    i++;
  }
  return true;
}
function ipToString(ip) {
  switch (ip.length) {
    case IPv4Len: {
      return ip.join(".");
    }
    case IPv6Len: {
      const result = [];
      for (let i = 0; i < ip.length; i++) {
        if (i % 2 === 0) {
          result.push(ip[i].toString(16).padStart(2, "0") + ip[i + 1].toString(16).padStart(2, "0"));
        }
      }
      return result.join(":");
    }
    default: {
      throw new Error("Invalid ip length");
    }
  }
}
function simpleMaskLength(mask) {
  let ones = 0;
  for (let [index, byte] of mask.entries()) {
    if (byte === 255) {
      ones += 8;
      continue;
    }
    while ((byte & 128) != 0) {
      ones++;
      byte = byte << 1;
    }
    if ((byte & 128) != 0) {
      return -1;
    }
    for (let i = index + 1; i < mask.length; i++) {
      if (mask[i] != 0) {
        return -1;
      }
    }
    break;
  }
  return ones;
}
function maskToHex(mask) {
  let hex = "0x";
  for (const byte of mask) {
    hex += (byte >> 4).toString(16) + (byte & 15).toString(16);
  }
  return hex;
}

// ../../node_modules/@chainsafe/netmask/dist/src/ip.js
var IPv4Len = 4;
var IPv6Len = 16;
var maxIPv6Octet = parseInt("0xFFFF", 16);
var ipv4Prefix = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  255,
  255
]);
function maskIp(ip, mask) {
  if (mask.length === IPv6Len && ip.length === IPv4Len && allFF(mask, 0, 11)) {
    mask = mask.slice(12);
  }
  if (mask.length === IPv4Len && ip.length === IPv6Len && deepEqual(ip, ipv4Prefix, 0, 11)) {
    ip = ip.slice(12);
  }
  const n = ip.length;
  if (n != mask.length) {
    throw new Error("Failed to mask ip");
  }
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = ip[i] & mask[i];
  }
  return out;
}
function containsIp(net, ip) {
  if (typeof ip === "string") {
    ip = parseIP(ip);
  }
  if (ip == null)
    throw new Error("Invalid ip");
  if (ip.length !== net.network.length) {
    return false;
  }
  for (let i = 0; i < ip.length; i++) {
    if ((net.network[i] & net.mask[i]) !== (ip[i] & net.mask[i])) {
      return false;
    }
  }
  return true;
}

// ../../node_modules/@chainsafe/netmask/dist/src/cidr.js
function parseCidr(s) {
  const [address, maskString] = s.split("/");
  if (!address || !maskString)
    throw new Error("Failed to parse given CIDR: " + s);
  let ipLength = IPv4Len;
  let ip = parseIPv4(address);
  if (ip == null) {
    ipLength = IPv6Len;
    ip = parseIPv6(address);
    if (ip == null)
      throw new Error("Failed to parse given CIDR: " + s);
  }
  const m = parseInt(maskString, 10);
  if (Number.isNaN(m) || String(m).length !== maskString.length || m < 0 || m > ipLength * 8) {
    throw new Error("Failed to parse given CIDR: " + s);
  }
  const mask = cidrMask(m, 8 * ipLength);
  return {
    network: maskIp(ip, mask),
    mask
  };
}
function cidrMask(ones, bits) {
  if (bits !== 8 * IPv4Len && bits !== 8 * IPv6Len)
    throw new Error("Invalid CIDR mask");
  if (ones < 0 || ones > bits)
    throw new Error("Invalid CIDR mask");
  const l = bits / 8;
  const m = new Uint8Array(l);
  for (let i = 0; i < l; i++) {
    if (ones >= 8) {
      m[i] = 255;
      ones -= 8;
      continue;
    }
    m[i] = 255 - (255 >> ones);
    ones = 0;
  }
  return m;
}

// ../../node_modules/@chainsafe/netmask/dist/src/ipnet.js
var IpNet = class {
  /**
   *
   * @param ipOrCidr either network ip or full cidr address
   * @param mask in case ipOrCidr is network this can be either mask in decimal format or as ip address
   */
  constructor(ipOrCidr, mask) {
    if (mask == null) {
      ({ network: this.network, mask: this.mask } = parseCidr(ipOrCidr));
    } else {
      const ipResult = parseIP(ipOrCidr);
      if (ipResult == null) {
        throw new Error("Failed to parse network");
      }
      mask = String(mask);
      const m = parseInt(mask, 10);
      if (Number.isNaN(m) || String(m).length !== mask.length || m < 0 || m > ipResult.length * 8) {
        const maskResult = parseIP(mask);
        if (maskResult == null) {
          throw new Error("Failed to parse mask");
        }
        this.mask = maskResult;
      } else {
        this.mask = cidrMask(m, 8 * ipResult.length);
      }
      this.network = maskIp(ipResult, this.mask);
    }
  }
  /**
   * Checks if netmask contains ip address
   * @param ip
   * @returns
   */
  contains(ip) {
    return containsIp({ network: this.network, mask: this.mask }, ip);
  }
  /**Serializes back to string format */
  toString() {
    const l = simpleMaskLength(this.mask);
    const mask = l !== -1 ? String(l) : maskToHex(this.mask);
    return ipToString(this.network) + "/" + mask;
  }
};

// ../../node_modules/uint8arrays/dist/src/from-string.node.js
import { Buffer as Buffer5 } from "node:buffer";
function fromString2(string3, encoding = "utf8") {
  const base3 = bases_default[encoding];
  if (base3 == null) {
    throw new Error(`Unsupported encoding "${encoding}"`);
  }
  if (encoding === "utf8" || encoding === "utf-8") {
    return asUint8Array(Buffer5.from(string3, "utf-8"));
  }
  return base3.decoder.decode(`${base3.prefix}${string3}`);
}

// ../../node_modules/@chainsafe/is-ip/lib/is-ip.node.js
import { isIPv4, isIPv6, isIP as ipVersion } from "node:net";
function isIP(input) {
  return Boolean(ipVersion(input));
}

// ../../node_modules/@multiformats/multiaddr/dist/src/ip.js
var isV4 = isIPv4;
var isV6 = isIPv6;
var toBytes = function(ip) {
  let offset = 0;
  ip = ip.toString().trim();
  if (isV4(ip)) {
    const bytes2 = new Uint8Array(offset + 4);
    ip.split(/\./g).forEach((byte) => {
      bytes2[offset++] = parseInt(byte, 10) & 255;
    });
    return bytes2;
  }
  if (isV6(ip)) {
    const sections = ip.split(":", 8);
    let i;
    for (i = 0; i < sections.length; i++) {
      const isv4 = isV4(sections[i]);
      let v4Buffer;
      if (isv4) {
        v4Buffer = toBytes(sections[i]);
        sections[i] = toString2(v4Buffer.slice(0, 2), "base16");
      }
      if (v4Buffer != null && ++i < 8) {
        sections.splice(i, 0, toString2(v4Buffer.slice(2, 4), "base16"));
      }
    }
    if (sections[0] === "") {
      while (sections.length < 8)
        sections.unshift("0");
    } else if (sections[sections.length - 1] === "") {
      while (sections.length < 8)
        sections.push("0");
    } else if (sections.length < 8) {
      for (i = 0; i < sections.length && sections[i] !== ""; i++)
        ;
      const argv = [i, 1];
      for (i = 9 - sections.length; i > 0; i--) {
        argv.push("0");
      }
      sections.splice.apply(sections, argv);
    }
    const bytes2 = new Uint8Array(offset + 16);
    for (i = 0; i < sections.length; i++) {
      const word = parseInt(sections[i], 16);
      bytes2[offset++] = word >> 8 & 255;
      bytes2[offset++] = word & 255;
    }
    return bytes2;
  }
  throw new Error("invalid ip address");
};
var toString3 = function(buf, offset = 0, length3) {
  offset = ~~offset;
  length3 = length3 ?? buf.length - offset;
  const view = new DataView(buf.buffer);
  if (length3 === 4) {
    const result = [];
    for (let i = 0; i < length3; i++) {
      result.push(buf[offset + i]);
    }
    return result.join(".");
  }
  if (length3 === 16) {
    const result = [];
    for (let i = 0; i < length3; i += 2) {
      result.push(view.getUint16(offset + i).toString(16));
    }
    return result.join(":").replace(/(^|:)0(:0)*:0(:|$)/, "$1::$3").replace(/:{3,4}/, "::");
  }
  return "";
};

// ../../node_modules/@multiformats/multiaddr/dist/src/protocols-table.js
var V = -1;
var names = {};
var codes = {};
var table = [
  [4, 32, "ip4"],
  [6, 16, "tcp"],
  [33, 16, "dccp"],
  [41, 128, "ip6"],
  [42, V, "ip6zone"],
  [43, 8, "ipcidr"],
  [53, V, "dns", true],
  [54, V, "dns4", true],
  [55, V, "dns6", true],
  [56, V, "dnsaddr", true],
  [132, 16, "sctp"],
  [273, 16, "udp"],
  [275, 0, "p2p-webrtc-star"],
  [276, 0, "p2p-webrtc-direct"],
  [277, 0, "p2p-stardust"],
  [280, 0, "webrtc-direct"],
  [281, 0, "webrtc"],
  [290, 0, "p2p-circuit"],
  [301, 0, "udt"],
  [302, 0, "utp"],
  [400, V, "unix", false, true],
  // `ipfs` is added before `p2p` for legacy support.
  // All text representations will default to `p2p`, but `ipfs` will
  // still be supported
  [421, V, "ipfs"],
  // `p2p` is the preferred name for 421, and is now the default
  [421, V, "p2p"],
  [443, 0, "https"],
  [444, 96, "onion"],
  [445, 296, "onion3"],
  [446, V, "garlic64"],
  [448, 0, "tls"],
  [449, V, "sni"],
  [460, 0, "quic"],
  [461, 0, "quic-v1"],
  [465, 0, "webtransport"],
  [466, V, "certhash"],
  [477, 0, "ws"],
  [478, 0, "wss"],
  [479, 0, "p2p-websocket-star"],
  [480, 0, "http"],
  [481, V, "http-path"],
  [777, V, "memory"]
];
table.forEach((row) => {
  const proto = createProtocol(...row);
  codes[proto.code] = proto;
  names[proto.name] = proto;
});
function createProtocol(code2, size, name3, resolvable, path) {
  return {
    code: code2,
    size,
    name: name3,
    resolvable: Boolean(resolvable),
    path: Boolean(path)
  };
}
function getProtocol(proto) {
  if (typeof proto === "number") {
    if (codes[proto] != null) {
      return codes[proto];
    }
    throw new Error(`no protocol with code: ${proto}`);
  } else if (typeof proto === "string") {
    if (names[proto] != null) {
      return names[proto];
    }
    throw new Error(`no protocol with name: ${proto}`);
  }
  throw new Error(`invalid protocol id type: ${typeof proto}`);
}

// ../../node_modules/@multiformats/multiaddr/dist/src/convert.js
var ip4Protocol = getProtocol("ip4");
var ip6Protocol = getProtocol("ip6");
var ipcidrProtocol = getProtocol("ipcidr");
function convertToString(proto, buf) {
  const protocol = getProtocol(proto);
  switch (protocol.code) {
    case 4:
    // ipv4
    case 41:
      return bytes2ip(buf);
    case 42:
      return bytes2str(buf);
    case 43:
      return toString2(buf, "base10");
    case 6:
    // tcp
    case 273:
    // udp
    case 33:
    // dccp
    case 132:
      return bytes2port(buf).toString();
    case 53:
    // dns
    case 54:
    // dns4
    case 55:
    // dns6
    case 56:
    // dnsaddr
    case 400:
    // unix
    case 449:
    // sni
    case 777:
      return bytes2str(buf);
    case 421:
      return bytes2mh(buf);
    case 444:
      return bytes2onion(buf);
    case 445:
      return bytes2onion(buf);
    case 466:
      return bytes2mb(buf);
    case 481:
      return globalThis.encodeURIComponent(bytes2str(buf));
    default:
      return toString2(buf, "base16");
  }
}
function convertToBytes(proto, str) {
  const protocol = getProtocol(proto);
  switch (protocol.code) {
    case 4:
      return ip2bytes(str);
    case 41:
      return ip2bytes(str);
    case 42:
      return str2bytes(str);
    case 43:
      return fromString2(str, "base10");
    case 6:
    // tcp
    case 273:
    // udp
    case 33:
    // dccp
    case 132:
      return port2bytes(parseInt(str, 10));
    case 53:
    // dns
    case 54:
    // dns4
    case 55:
    // dns6
    case 56:
    // dnsaddr
    case 400:
    // unix
    case 449:
    // sni
    case 777:
      return str2bytes(str);
    case 421:
      return mh2bytes(str);
    case 444:
      return onion2bytes(str);
    case 445:
      return onion32bytes(str);
    case 466:
      return mb2bytes(str);
    case 481:
      return str2bytes(globalThis.decodeURIComponent(str));
    default:
      return fromString2(str, "base16");
  }
}
function convertToIpNet(multiaddr2) {
  let mask;
  let addr;
  multiaddr2.stringTuples().forEach(([code2, value]) => {
    if (code2 === ip4Protocol.code || code2 === ip6Protocol.code) {
      addr = value;
    }
    if (code2 === ipcidrProtocol.code) {
      mask = value;
    }
  });
  if (mask == null || addr == null) {
    throw new Error("Invalid multiaddr");
  }
  return new IpNet(addr, mask);
}
var decoders = Object.values(bases).map((c) => c.decoder);
var anybaseDecoder = function() {
  let acc = decoders[0].or(decoders[1]);
  decoders.slice(2).forEach((d) => acc = acc.or(d));
  return acc;
}();
function ip2bytes(ipString) {
  if (!isIP(ipString)) {
    throw new Error("invalid ip address");
  }
  return toBytes(ipString);
}
function bytes2ip(ipBuff) {
  const ipString = toString3(ipBuff, 0, ipBuff.length);
  if (ipString == null) {
    throw new Error("ipBuff is required");
  }
  if (!isIP(ipString)) {
    throw new Error("invalid ip address");
  }
  return ipString;
}
function port2bytes(port) {
  const buf = new ArrayBuffer(2);
  const view = new DataView(buf);
  view.setUint16(0, port);
  return new Uint8Array(buf);
}
function bytes2port(buf) {
  const view = new DataView(buf.buffer);
  return view.getUint16(buf.byteOffset);
}
function str2bytes(str) {
  const buf = fromString2(str);
  const size = Uint8Array.from(encode5(buf.length));
  return concat([size, buf], size.length + buf.length);
}
function bytes2str(buf) {
  const size = decode6(buf);
  buf = buf.slice(encodingLength2(size));
  if (buf.length !== size) {
    throw new Error("inconsistent lengths");
  }
  return toString2(buf);
}
function mh2bytes(hash) {
  let mh;
  if (hash[0] === "Q" || hash[0] === "1") {
    mh = decode5(base58btc.decode(`z${hash}`)).bytes;
  } else {
    mh = CID.parse(hash).multihash.bytes;
  }
  const size = Uint8Array.from(encode5(mh.length));
  return concat([size, mh], size.length + mh.length);
}
function mb2bytes(mbstr) {
  const mb = anybaseDecoder.decode(mbstr);
  const size = Uint8Array.from(encode5(mb.length));
  return concat([size, mb], size.length + mb.length);
}
function bytes2mb(buf) {
  const size = decode6(buf);
  const hash = buf.slice(encodingLength2(size));
  if (hash.length !== size) {
    throw new Error("inconsistent lengths");
  }
  return "u" + toString2(hash, "base64url");
}
function bytes2mh(buf) {
  const size = decode6(buf);
  const address = buf.slice(encodingLength2(size));
  if (address.length !== size) {
    throw new Error("inconsistent lengths");
  }
  return toString2(address, "base58btc");
}
function onion2bytes(str) {
  const addr = str.split(":");
  if (addr.length !== 2) {
    throw new Error(`failed to parse onion addr: ["'${addr.join('", "')}'"]' does not contain a port number`);
  }
  if (addr[0].length !== 16) {
    throw new Error(`failed to parse onion addr: ${addr[0]} not a Tor onion address.`);
  }
  const buf = base32.decode("b" + addr[0]);
  const port = parseInt(addr[1], 10);
  if (port < 1 || port > 65536) {
    throw new Error("Port number is not in range(1, 65536)");
  }
  const portBuf = port2bytes(port);
  return concat([buf, portBuf], buf.length + portBuf.length);
}
function onion32bytes(str) {
  const addr = str.split(":");
  if (addr.length !== 2) {
    throw new Error(`failed to parse onion addr: ["'${addr.join('", "')}'"]' does not contain a port number`);
  }
  if (addr[0].length !== 56) {
    throw new Error(`failed to parse onion addr: ${addr[0]} not a Tor onion3 address.`);
  }
  const buf = base32.decode(`b${addr[0]}`);
  const port = parseInt(addr[1], 10);
  if (port < 1 || port > 65536) {
    throw new Error("Port number is not in range(1, 65536)");
  }
  const portBuf = port2bytes(port);
  return concat([buf, portBuf], buf.length + portBuf.length);
}
function bytes2onion(buf) {
  const addrBytes = buf.slice(0, buf.length - 2);
  const portBytes = buf.slice(buf.length - 2);
  const addr = toString2(addrBytes, "base32");
  const port = bytes2port(portBytes);
  return `${addr}:${port}`;
}

// ../../node_modules/@multiformats/multiaddr/dist/src/codec.js
function stringToMultiaddrParts(str) {
  str = cleanPath(str);
  const tuples = [];
  const stringTuples = [];
  let path = null;
  const parts = str.split("/").slice(1);
  if (parts.length === 1 && parts[0] === "") {
    return {
      bytes: new Uint8Array(),
      string: "/",
      tuples: [],
      stringTuples: [],
      path: null
    };
  }
  for (let p = 0; p < parts.length; p++) {
    const part = parts[p];
    const proto = getProtocol(part);
    if (proto.size === 0) {
      tuples.push([proto.code]);
      stringTuples.push([proto.code]);
      continue;
    }
    p++;
    if (p >= parts.length) {
      throw ParseError("invalid address: " + str);
    }
    if (proto.path === true) {
      path = cleanPath(parts.slice(p).join("/"));
      tuples.push([proto.code, convertToBytes(proto.code, path)]);
      stringTuples.push([proto.code, path]);
      break;
    }
    const bytes2 = convertToBytes(proto.code, parts[p]);
    tuples.push([proto.code, bytes2]);
    stringTuples.push([proto.code, convertToString(proto.code, bytes2)]);
  }
  return {
    string: stringTuplesToString(stringTuples),
    bytes: tuplesToBytes(tuples),
    tuples,
    stringTuples,
    path
  };
}
function bytesToMultiaddrParts(bytes2) {
  const tuples = [];
  const stringTuples = [];
  let path = null;
  let i = 0;
  while (i < bytes2.length) {
    const code2 = decode6(bytes2, i);
    const n = encodingLength2(code2);
    const p = getProtocol(code2);
    const size = sizeForAddr(p, bytes2.slice(i + n));
    if (size === 0) {
      tuples.push([code2]);
      stringTuples.push([code2]);
      i += n;
      continue;
    }
    const addr = bytes2.slice(i + n, i + n + size);
    i += size + n;
    if (i > bytes2.length) {
      throw ParseError("Invalid address Uint8Array: " + toString2(bytes2, "base16"));
    }
    tuples.push([code2, addr]);
    const stringAddr = convertToString(code2, addr);
    stringTuples.push([code2, stringAddr]);
    if (p.path === true) {
      path = stringAddr;
      break;
    }
  }
  return {
    bytes: Uint8Array.from(bytes2),
    string: stringTuplesToString(stringTuples),
    tuples,
    stringTuples,
    path
  };
}
function stringTuplesToString(tuples) {
  const parts = [];
  tuples.map((tup) => {
    const proto = getProtocol(tup[0]);
    parts.push(proto.name);
    if (tup.length > 1 && tup[1] != null) {
      parts.push(tup[1]);
    }
    return null;
  });
  return cleanPath(parts.join("/"));
}
function tuplesToBytes(tuples) {
  return concat(tuples.map((tup) => {
    const proto = getProtocol(tup[0]);
    let buf = Uint8Array.from(encode5(proto.code));
    if (tup.length > 1 && tup[1] != null) {
      buf = concat([buf, tup[1]]);
    }
    return buf;
  }));
}
function sizeForAddr(p, addr) {
  if (p.size > 0) {
    return p.size / 8;
  } else if (p.size === 0) {
    return 0;
  } else {
    const size = decode6(addr instanceof Uint8Array ? addr : Uint8Array.from(addr));
    return size + encodingLength2(size);
  }
}
function cleanPath(str) {
  return "/" + str.trim().split("/").filter((a) => a).join("/");
}
function ParseError(str) {
  return new Error("Error parsing address: " + str);
}

// ../../node_modules/@multiformats/multiaddr/dist/src/multiaddr.js
var inspect = Symbol.for("nodejs.util.inspect.custom");
var symbol = Symbol.for("@multiformats/js-multiaddr/multiaddr");
var DNS_CODES = [
  getProtocol("dns").code,
  getProtocol("dns4").code,
  getProtocol("dns6").code,
  getProtocol("dnsaddr").code
];
var NoAvailableResolverError = class extends Error {
  constructor(message2 = "No available resolver") {
    super(message2);
    this.name = "NoAvailableResolverError";
  }
};
var Multiaddr = class _Multiaddr {
  bytes;
  #string;
  #tuples;
  #stringTuples;
  #path;
  [symbol] = true;
  constructor(addr) {
    if (addr == null) {
      addr = "";
    }
    let parts;
    if (addr instanceof Uint8Array) {
      parts = bytesToMultiaddrParts(addr);
    } else if (typeof addr === "string") {
      if (addr.length > 0 && addr.charAt(0) !== "/") {
        throw new Error(`multiaddr "${addr}" must start with a "/"`);
      }
      parts = stringToMultiaddrParts(addr);
    } else if (isMultiaddr(addr)) {
      parts = bytesToMultiaddrParts(addr.bytes);
    } else {
      throw new Error("addr must be a string, Buffer, or another Multiaddr");
    }
    this.bytes = parts.bytes;
    this.#string = parts.string;
    this.#tuples = parts.tuples;
    this.#stringTuples = parts.stringTuples;
    this.#path = parts.path;
  }
  toString() {
    return this.#string;
  }
  toJSON() {
    return this.toString();
  }
  toOptions() {
    let family;
    let transport;
    let host;
    let port;
    let zone = "";
    const tcp2 = getProtocol("tcp");
    const udp = getProtocol("udp");
    const ip4 = getProtocol("ip4");
    const ip6 = getProtocol("ip6");
    const dns6 = getProtocol("dns6");
    const ip6zone = getProtocol("ip6zone");
    for (const [code2, value] of this.stringTuples()) {
      if (code2 === ip6zone.code) {
        zone = `%${value ?? ""}`;
      }
      if (DNS_CODES.includes(code2)) {
        transport = tcp2.name;
        port = 443;
        host = `${value ?? ""}${zone}`;
        family = code2 === dns6.code ? 6 : 4;
      }
      if (code2 === tcp2.code || code2 === udp.code) {
        transport = getProtocol(code2).name;
        port = parseInt(value ?? "");
      }
      if (code2 === ip4.code || code2 === ip6.code) {
        transport = getProtocol(code2).name;
        host = `${value ?? ""}${zone}`;
        family = code2 === ip6.code ? 6 : 4;
      }
    }
    if (family == null || transport == null || host == null || port == null) {
      throw new Error('multiaddr must have a valid format: "/{ip4, ip6, dns4, dns6, dnsaddr}/{address}/{tcp, udp}/{port}".');
    }
    const opts = {
      family,
      host,
      transport,
      port
    };
    return opts;
  }
  protos() {
    return this.#tuples.map(([code2]) => Object.assign({}, getProtocol(code2)));
  }
  protoCodes() {
    return this.#tuples.map(([code2]) => code2);
  }
  protoNames() {
    return this.#tuples.map(([code2]) => getProtocol(code2).name);
  }
  tuples() {
    return this.#tuples.map(([code2, value]) => {
      if (value == null) {
        return [code2];
      }
      return [code2, value];
    });
  }
  stringTuples() {
    return this.#stringTuples.map(([code2, value]) => {
      if (value == null) {
        return [code2];
      }
      return [code2, value];
    });
  }
  encapsulate(addr) {
    addr = new _Multiaddr(addr);
    return new _Multiaddr(this.toString() + addr.toString());
  }
  decapsulate(addr) {
    const addrString = addr.toString();
    const s = this.toString();
    const i = s.lastIndexOf(addrString);
    if (i < 0) {
      throw new Error(`Address ${this.toString()} does not contain subaddress: ${addr.toString()}`);
    }
    return new _Multiaddr(s.slice(0, i));
  }
  decapsulateCode(code2) {
    const tuples = this.tuples();
    for (let i = tuples.length - 1; i >= 0; i--) {
      if (tuples[i][0] === code2) {
        return new _Multiaddr(tuplesToBytes(tuples.slice(0, i)));
      }
    }
    return this;
  }
  getPeerId() {
    try {
      let tuples = [];
      this.stringTuples().forEach(([code2, name3]) => {
        if (code2 === names.p2p.code) {
          tuples.push([code2, name3]);
        }
        if (code2 === names["p2p-circuit"].code) {
          tuples = [];
        }
      });
      const tuple = tuples.pop();
      if (tuple?.[1] != null) {
        const peerIdStr = tuple[1];
        if (peerIdStr[0] === "Q" || peerIdStr[0] === "1") {
          return toString2(base58btc.decode(`z${peerIdStr}`), "base58btc");
        }
        return toString2(CID.parse(peerIdStr).multihash.bytes, "base58btc");
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  getPath() {
    return this.#path;
  }
  equals(addr) {
    return equals3(this.bytes, addr.bytes);
  }
  async resolve(options) {
    const resolvableProto = this.protos().find((p) => p.resolvable);
    if (resolvableProto == null) {
      return [this];
    }
    const resolver = resolvers.get(resolvableProto.name);
    if (resolver == null) {
      throw new NoAvailableResolverError(`no available resolver for ${resolvableProto.name}`);
    }
    const result = await resolver(this, options);
    return result.map((str) => multiaddr(str));
  }
  nodeAddress() {
    const options = this.toOptions();
    if (options.transport !== "tcp" && options.transport !== "udp") {
      throw new Error(`multiaddr must have a valid format - no protocol with name: "${options.transport}". Must have a valid transport protocol: "{tcp, udp}"`);
    }
    return {
      family: options.family,
      address: options.host,
      port: options.port
    };
  }
  isThinWaistAddress(addr) {
    const protos = (addr ?? this).protos();
    if (protos.length !== 2) {
      return false;
    }
    if (protos[0].code !== 4 && protos[0].code !== 41) {
      return false;
    }
    if (protos[1].code !== 6 && protos[1].code !== 273) {
      return false;
    }
    return true;
  }
  /**
   * Returns Multiaddr as a human-readable string
   * https://nodejs.org/api/util.html#utilinspectcustom
   *
   * @example
   * ```js
   * import { multiaddr } from '@multiformats/multiaddr'
   *
   * console.info(multiaddr('/ip4/127.0.0.1/tcp/4001'))
   * // 'Multiaddr(/ip4/127.0.0.1/tcp/4001)'
   * ```
   */
  [inspect]() {
    return `Multiaddr(${this.#string})`;
  }
};

// ../../node_modules/@multiformats/multiaddr/dist/src/index.js
var resolvers = /* @__PURE__ */ new Map();
function isMultiaddr(value) {
  return Boolean(value?.[symbol]);
}
function multiaddr(addr) {
  return new Multiaddr(addr);
}

// ../../node_modules/@multiformats/multiaddr/dist/src/resolvers/dnsaddr.js
var MAX_RECURSIVE_DEPTH = 32;
var { code: dnsaddrCode } = getProtocol("dnsaddr");
var RecursionLimitError = class extends Error {
  constructor(message2 = "Max recursive depth reached") {
    super(message2);
    this.name = "RecursionLimitError";
  }
};
var dnsaddrResolver = async function dnsaddrResolver2(ma, options = {}) {
  const recursionLimit = options.maxRecursiveDepth ?? MAX_RECURSIVE_DEPTH;
  if (recursionLimit === 0) {
    throw new RecursionLimitError("Max recursive depth reached");
  }
  const [, hostname] = ma.stringTuples().find(([proto]) => proto === dnsaddrCode) ?? [];
  const resolver = options?.dns ?? dns();
  const result = await resolver.query(`_dnsaddr.${hostname}`, {
    signal: options?.signal,
    types: [
      RecordType.TXT
    ]
  });
  const peerId2 = ma.getPeerId();
  const output2 = [];
  for (const answer of result.Answer) {
    const addr = answer.data.replace(/["']/g, "").trim().split("=")[1];
    if (addr == null) {
      continue;
    }
    if (peerId2 != null && !addr.includes(peerId2)) {
      continue;
    }
    const ma2 = multiaddr(addr);
    if (addr.startsWith("/dnsaddr")) {
      const resolved = await ma2.resolve({
        ...options,
        maxRecursiveDepth: recursionLimit - 1
      });
      output2.push(...resolved.map((ma3) => ma3.toString()));
    } else {
      output2.push(ma2.toString());
    }
  }
  return output2;
};

// ../../node_modules/merge-options/index.mjs
var import_index3 = __toESM(require_merge_options(), 1);
var merge_options_default = import_index3.default;

// ../../node_modules/libp2p/dist/src/config.js
var DefaultConfig = {
  addresses: {
    listen: [],
    announce: [],
    noAnnounce: [],
    announceFilter: (multiaddrs) => multiaddrs
  },
  connectionManager: {
    resolvers: {
      dnsaddr: dnsaddrResolver
    }
  },
  transportManager: {
    faultTolerance: FaultTolerance.FATAL_ALL
  }
};
async function validateConfig(opts) {
  const resultingOptions = merge_options_default(DefaultConfig, opts);
  if (resultingOptions.connectionProtector === null && globalThis.process?.env?.LIBP2P_FORCE_PNET != null) {
    throw new InvalidParametersError("Private network is enforced, but no protector was provided");
  }
  return resultingOptions;
}

// ../../node_modules/libp2p/dist/src/libp2p.js
import { publicKeyFromProtobuf } from "@libp2p/crypto/keys";
import { contentRoutingSymbol, TypedEventEmitter as TypedEventEmitter2, setMaxListeners as setMaxListeners6, peerDiscoverySymbol, peerRoutingSymbol, InvalidParametersError as InvalidParametersError6 } from "@libp2p/interface";
import { defaultLogger as defaultLogger2 } from "@libp2p/logger";
import { PeerSet as PeerSet2 } from "@libp2p/peer-collections";
import { peerIdFromString as peerIdFromString4 } from "@libp2p/peer-id";
import { persistentPeerStore } from "@libp2p/peer-store";

// ../../node_modules/interface-datastore/dist/src/key.js
var pathSepS = "/";
var pathSepB = new TextEncoder().encode(pathSepS);
var pathSep = pathSepB[0];
var Key = class _Key {
  _buf;
  /**
   * @param {string | Uint8Array} s
   * @param {boolean} [clean]
   */
  constructor(s, clean2) {
    if (typeof s === "string") {
      this._buf = fromString2(s);
    } else if (s instanceof Uint8Array) {
      this._buf = s;
    } else {
      throw new Error("Invalid key, should be String of Uint8Array");
    }
    if (clean2 == null) {
      clean2 = true;
    }
    if (clean2) {
      this.clean();
    }
    if (this._buf.byteLength === 0 || this._buf[0] !== pathSep) {
      throw new Error("Invalid key");
    }
  }
  /**
   * Convert to the string representation
   *
   * @param {import('uint8arrays/to-string').SupportedEncodings} [encoding='utf8'] - The encoding to use.
   * @returns {string}
   */
  toString(encoding = "utf8") {
    return toString2(this._buf, encoding);
  }
  /**
   * Return the Uint8Array representation of the key
   *
   * @returns {Uint8Array}
   */
  uint8Array() {
    return this._buf;
  }
  /**
   * Return string representation of the key
   *
   * @returns {string}
   */
  get [Symbol.toStringTag]() {
    return `Key(${this.toString()})`;
  }
  /**
   * Constructs a key out of a namespace array.
   *
   * @param {Array<string>} list - The array of namespaces
   * @returns {Key}
   *
   * @example
   * ```js
   * Key.withNamespaces(['one', 'two'])
   * // => Key('/one/two')
   * ```
   */
  static withNamespaces(list) {
    return new _Key(list.join(pathSepS));
  }
  /**
   * Returns a randomly (uuid) generated key.
   *
   * @returns {Key}
   *
   * @example
   * ```js
   * Key.random()
   * // => Key('/344502982398')
   * ```
   */
  static random() {
    return new _Key(Math.random().toString().substring(2));
  }
  /**
   * @param {*} other
   */
  static asKey(other) {
    if (other instanceof Uint8Array || typeof other === "string") {
      return new _Key(other);
    }
    if (typeof other.uint8Array === "function") {
      return new _Key(other.uint8Array());
    }
    return null;
  }
  /**
   * Cleanup the current key
   *
   * @returns {void}
   */
  clean() {
    if (this._buf == null || this._buf.byteLength === 0) {
      this._buf = pathSepB;
    }
    if (this._buf[0] !== pathSep) {
      const bytes2 = new Uint8Array(this._buf.byteLength + 1);
      bytes2.fill(pathSep, 0, 1);
      bytes2.set(this._buf, 1);
      this._buf = bytes2;
    }
    while (this._buf.byteLength > 1 && this._buf[this._buf.byteLength - 1] === pathSep) {
      this._buf = this._buf.subarray(0, -1);
    }
  }
  /**
   * Check if the given key is sorted lower than ourself.
   *
   * @param {Key} key - The other Key to check against
   * @returns {boolean}
   */
  less(key) {
    const list1 = this.list();
    const list2 = key.list();
    for (let i = 0; i < list1.length; i++) {
      if (list2.length < i + 1) {
        return false;
      }
      const c1 = list1[i];
      const c2 = list2[i];
      if (c1 < c2) {
        return true;
      } else if (c1 > c2) {
        return false;
      }
    }
    return list1.length < list2.length;
  }
  /**
   * Returns the key with all parts in reversed order.
   *
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').reverse()
   * // => Key('/Actor:JohnCleese/MontyPython/Comedy')
   * ```
   */
  reverse() {
    return _Key.withNamespaces(this.list().slice().reverse());
  }
  /**
   * Returns the `namespaces` making up this Key.
   *
   * @returns {Array<string>}
   */
  namespaces() {
    return this.list();
  }
  /** Returns the "base" namespace of this key.
   *
   * @returns {string}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').baseNamespace()
   * // => 'Actor:JohnCleese'
   * ```
   */
  baseNamespace() {
    const ns = this.namespaces();
    return ns[ns.length - 1];
  }
  /**
   * Returns the `list` representation of this key.
   *
   * @returns {Array<string>}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').list()
   * // => ['Comedy', 'MontyPythong', 'Actor:JohnCleese']
   * ```
   */
  list() {
    return this.toString().split(pathSepS).slice(1);
  }
  /**
   * Returns the "type" of this key (value of last namespace).
   *
   * @returns {string}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').type()
   * // => 'Actor'
   * ```
   */
  type() {
    return namespaceType(this.baseNamespace());
  }
  /**
   * Returns the "name" of this key (field of last namespace).
   *
   * @returns {string}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').name()
   * // => 'JohnCleese'
   * ```
   */
  name() {
    return namespaceValue(this.baseNamespace());
  }
  /**
   * Returns an "instance" of this type key (appends value to namespace).
   *
   * @param {string} s - The string to append.
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor').instance('JohnClesse')
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   * ```
   */
  instance(s) {
    return new _Key(this.toString() + ":" + s);
  }
  /**
   * Returns the "path" of this key (parent + type).
   *
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython/Actor:JohnCleese').path()
   * // => Key('/Comedy/MontyPython/Actor')
   * ```
   */
  path() {
    let p = this.parent().toString();
    if (!p.endsWith(pathSepS)) {
      p += pathSepS;
    }
    p += this.type();
    return new _Key(p);
  }
  /**
   * Returns the `parent` Key of this Key.
   *
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key("/Comedy/MontyPython/Actor:JohnCleese").parent()
   * // => Key("/Comedy/MontyPython")
   * ```
   */
  parent() {
    const list = this.list();
    if (list.length === 1) {
      return new _Key(pathSepS);
    }
    return new _Key(list.slice(0, -1).join(pathSepS));
  }
  /**
   * Returns the `child` Key of this Key.
   *
   * @param {Key} key - The child Key to add
   * @returns {Key}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython').child(new Key('Actor:JohnCleese'))
   * // => Key('/Comedy/MontyPython/Actor:JohnCleese')
   * ```
   */
  child(key) {
    if (this.toString() === pathSepS) {
      return key;
    } else if (key.toString() === pathSepS) {
      return this;
    }
    return new _Key(this.toString() + key.toString(), false);
  }
  /**
   * Returns whether this key is a prefix of `other`
   *
   * @param {Key} other - The other key to test against
   * @returns {boolean}
   *
   * @example
   * ```js
   * new Key('/Comedy').isAncestorOf('/Comedy/MontyPython')
   * // => true
   * ```
   */
  isAncestorOf(other) {
    if (other.toString() === this.toString()) {
      return false;
    }
    return other.toString().startsWith(this.toString());
  }
  /**
   * Returns whether this key is a contains another as prefix.
   *
   * @param {Key} other - The other Key to test against
   * @returns {boolean}
   *
   * @example
   * ```js
   * new Key('/Comedy/MontyPython').isDecendantOf('/Comedy')
   * // => true
   * ```
   */
  isDecendantOf(other) {
    if (other.toString() === this.toString()) {
      return false;
    }
    return this.toString().startsWith(other.toString());
  }
  /**
   * Checks if this key has only one namespace.
   *
   * @returns {boolean}
   */
  isTopLevel() {
    return this.list().length === 1;
  }
  /**
   * Concats one or more Keys into one new Key.
   *
   * @param {Array<Key>} keys - The array of keys to concatenate
   * @returns {Key}
   */
  concat(...keys) {
    return _Key.withNamespaces([...this.namespaces(), ...flatten(keys.map((key) => key.namespaces()))]);
  }
};
function namespaceType(ns) {
  const parts = ns.split(":");
  if (parts.length < 2) {
    return "";
  }
  return parts.slice(0, -1).join(":");
}
function namespaceValue(ns) {
  const parts = ns.split(":");
  return parts[parts.length - 1];
}
function flatten(arr) {
  return [].concat(...arr);
}

// ../../node_modules/interface-store/dist/src/errors.js
var NotFoundError = class _NotFoundError extends Error {
  static name = "NotFoundError";
  static code = "ERR_NOT_FOUND";
  name = _NotFoundError.name;
  code = _NotFoundError.code;
  constructor(message2 = "Not Found") {
    super(message2);
  }
};

// ../../node_modules/it-drain/dist/src/index.js
function isAsyncIterable(thing) {
  return thing[Symbol.asyncIterator] != null;
}
function drain(source) {
  if (isAsyncIterable(source)) {
    return (async () => {
      for await (const _ of source) {
      }
    })();
  } else {
    for (const _ of source) {
    }
  }
}
var src_default = drain;

// ../../node_modules/it-peekable/dist/src/index.js
function peekable(iterable) {
  const [iterator, symbol3] = iterable[Symbol.asyncIterator] != null ? [iterable[Symbol.asyncIterator](), Symbol.asyncIterator] : [iterable[Symbol.iterator](), Symbol.iterator];
  const queue = [];
  return {
    peek: () => {
      return iterator.next();
    },
    push: (value) => {
      queue.push(value);
    },
    next: () => {
      if (queue.length > 0) {
        return {
          done: false,
          value: queue.shift()
        };
      }
      return iterator.next();
    },
    [symbol3]() {
      return this;
    }
  };
}
var src_default2 = peekable;

// ../../node_modules/it-filter/dist/src/index.js
function isAsyncIterable2(thing) {
  return thing[Symbol.asyncIterator] != null;
}
function filter(source, fn) {
  let index = 0;
  if (isAsyncIterable2(source)) {
    return async function* () {
      for await (const entry of source) {
        if (await fn(entry, index++)) {
          yield entry;
        }
      }
    }();
  }
  const peekable2 = src_default2(source);
  const { value, done } = peekable2.next();
  if (done === true) {
    return function* () {
    }();
  }
  const res = fn(value, index++);
  if (typeof res.then === "function") {
    return async function* () {
      if (await res) {
        yield value;
      }
      for await (const entry of peekable2) {
        if (await fn(entry, index++)) {
          yield entry;
        }
      }
    }();
  }
  const func2 = fn;
  return function* () {
    if (res === true) {
      yield value;
    }
    for (const entry of peekable2) {
      if (func2(entry, index++)) {
        yield entry;
      }
    }
  }();
}
var src_default3 = filter;

// ../../node_modules/it-all/dist/src/index.js
function isAsyncIterable3(thing) {
  return thing[Symbol.asyncIterator] != null;
}
function all(source) {
  if (isAsyncIterable3(source)) {
    return (async () => {
      const arr2 = [];
      for await (const entry of source) {
        arr2.push(entry);
      }
      return arr2;
    })();
  }
  const arr = [];
  for (const entry of source) {
    arr.push(entry);
  }
  return arr;
}
var src_default4 = all;

// ../../node_modules/it-sort/dist/src/index.js
function isAsyncIterable4(thing) {
  return thing[Symbol.asyncIterator] != null;
}
function sort(source, sorter) {
  if (isAsyncIterable4(source)) {
    return async function* () {
      const arr = await src_default4(source);
      yield* arr.sort(sorter);
    }();
  }
  return function* () {
    const arr = src_default4(source);
    yield* arr.sort(sorter);
  }();
}
var src_default5 = sort;

// ../../node_modules/it-take/dist/src/index.js
function isAsyncIterable5(thing) {
  return thing[Symbol.asyncIterator] != null;
}
function take(source, limit) {
  if (isAsyncIterable5(source)) {
    return async function* () {
      let items = 0;
      if (limit < 1) {
        return;
      }
      for await (const entry of source) {
        yield entry;
        items++;
        if (items === limit) {
          return;
        }
      }
    }();
  }
  return function* () {
    let items = 0;
    if (limit < 1) {
      return;
    }
    for (const entry of source) {
      yield entry;
      items++;
      if (items === limit) {
        return;
      }
    }
  }();
}
var src_default6 = take;

// ../../node_modules/datastore-core/dist/src/base.js
var BaseDatastore = class {
  put(key, val, options) {
    return Promise.reject(new Error(".put is not implemented"));
  }
  get(key, options) {
    return Promise.reject(new Error(".get is not implemented"));
  }
  has(key, options) {
    return Promise.reject(new Error(".has is not implemented"));
  }
  delete(key, options) {
    return Promise.reject(new Error(".delete is not implemented"));
  }
  async *putMany(source, options = {}) {
    for await (const { key, value } of source) {
      await this.put(key, value, options);
      yield key;
    }
  }
  async *getMany(source, options = {}) {
    for await (const key of source) {
      yield {
        key,
        value: await this.get(key, options)
      };
    }
  }
  async *deleteMany(source, options = {}) {
    for await (const key of source) {
      await this.delete(key, options);
      yield key;
    }
  }
  batch() {
    let puts = [];
    let dels = [];
    return {
      put(key, value) {
        puts.push({ key, value });
      },
      delete(key) {
        dels.push(key);
      },
      commit: async (options) => {
        await src_default(this.putMany(puts, options));
        puts = [];
        await src_default(this.deleteMany(dels, options));
        dels = [];
      }
    };
  }
  /**
   * Extending classes should override `query` or implement this method
   */
  // eslint-disable-next-line require-yield
  async *_all(q, options) {
    throw new Error("._all is not implemented");
  }
  /**
   * Extending classes should override `queryKeys` or implement this method
   */
  // eslint-disable-next-line require-yield
  async *_allKeys(q, options) {
    throw new Error("._allKeys is not implemented");
  }
  query(q, options) {
    let it = this._all(q, options);
    if (q.prefix != null) {
      const prefix = q.prefix;
      it = src_default3(it, (e) => e.key.toString().startsWith(prefix));
    }
    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it2, f) => src_default3(it2, f), it);
    }
    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it2, f) => src_default5(it2, f), it);
    }
    if (q.offset != null) {
      let i = 0;
      const offset = q.offset;
      it = src_default3(it, () => i++ >= offset);
    }
    if (q.limit != null) {
      it = src_default6(it, q.limit);
    }
    return it;
  }
  queryKeys(q, options) {
    let it = this._allKeys(q, options);
    if (q.prefix != null) {
      const prefix = q.prefix;
      it = src_default3(it, (key) => key.toString().startsWith(prefix));
    }
    if (Array.isArray(q.filters)) {
      it = q.filters.reduce((it2, f) => src_default3(it2, f), it);
    }
    if (Array.isArray(q.orders)) {
      it = q.orders.reduce((it2, f) => src_default5(it2, f), it);
    }
    if (q.offset != null) {
      const offset = q.offset;
      let i = 0;
      it = src_default3(it, () => i++ >= offset);
    }
    if (q.limit != null) {
      it = src_default6(it, q.limit);
    }
    return it;
  }
};

// ../../node_modules/datastore-core/dist/src/memory.js
var MemoryDatastore = class extends BaseDatastore {
  data;
  constructor() {
    super();
    this.data = /* @__PURE__ */ new Map();
  }
  put(key, val) {
    this.data.set(key.toString(), val);
    return key;
  }
  get(key) {
    const result = this.data.get(key.toString());
    if (result == null) {
      throw new NotFoundError();
    }
    return result;
  }
  has(key) {
    return this.data.has(key.toString());
  }
  delete(key) {
    this.data.delete(key.toString());
  }
  *_all() {
    for (const [key, value] of this.data.entries()) {
      yield { key: new Key(key), value };
    }
  }
  *_allKeys() {
    for (const key of this.data.keys()) {
      yield new Key(key);
    }
  }
};

// ../../node_modules/libp2p/dist/src/address-manager/index.js
import { peerIdFromString } from "@libp2p/peer-id";
import { debounce } from "@libp2p/utils/debounce";
import { createScalableCuckooFilter } from "@libp2p/utils/filters";

// ../../node_modules/libp2p/dist/src/address-manager/dns-mappings.js
import { isPrivateIp } from "@libp2p/utils/private-ip";
var MAX_DATE = 864e13;
var CODEC_TLS = 448;
var CODEC_SNI = 449;
var CODEC_DNS = 53;
var CODEC_DNS4 = 54;
var CODEC_DNS6 = 55;
var CODEC_DNSADDR = 56;
var DNSMappings = class {
  log;
  mappings;
  constructor(components, init = {}) {
    this.log = components.logger.forComponent("libp2p:address-manager:dns-mappings");
    this.mappings = /* @__PURE__ */ new Map();
  }
  has(ma) {
    const host = this.findHost(ma);
    for (const mapping of this.mappings.values()) {
      if (mapping.domain === host) {
        return true;
      }
    }
    return false;
  }
  add(domain, addresses) {
    addresses.forEach((ip) => {
      this.log("add DNS mapping %s to %s", ip, domain);
      const verified = isPrivateIp(ip) === true;
      this.mappings.set(ip, {
        domain,
        verified,
        expires: verified ? MAX_DATE - Date.now() : 0,
        lastVerified: verified ? MAX_DATE - Date.now() : void 0
      });
    });
  }
  remove(ma) {
    const host = this.findHost(ma);
    let wasConfident = false;
    for (const [ip, mapping] of this.mappings.entries()) {
      if (mapping.domain === host) {
        this.log("removing %s to %s DNS mapping %e", ip, mapping.domain, new Error("where"));
        this.mappings.delete(ip);
        wasConfident = wasConfident || mapping.verified;
      }
    }
    return wasConfident;
  }
  getAll(addresses) {
    const dnsMappedAddresses = [];
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      const tuples = address.multiaddr.stringTuples();
      const host = tuples[0][1];
      if (host == null) {
        continue;
      }
      for (const [ip, mapping] of this.mappings.entries()) {
        if (host !== ip) {
          continue;
        }
        const mappedIp = this.maybeAddSNITuple(tuples, mapping.domain);
        if (mappedIp) {
          addresses.splice(i, 1);
          i--;
          dnsMappedAddresses.push({
            multiaddr: multiaddr(`/${tuples.map((tuple) => {
              return [
                getProtocol(tuple[0]).name,
                tuple[1]
              ].join("/");
            }).join("/")}`),
            verified: mapping.verified,
            type: "dns-mapping",
            expires: mapping.expires,
            lastVerified: mapping.lastVerified
          });
        }
      }
    }
    return dnsMappedAddresses;
  }
  maybeAddSNITuple(tuples, domain) {
    for (let j = 0; j < tuples.length; j++) {
      if (tuples[j][0] === CODEC_TLS && tuples[j + 1]?.[0] !== CODEC_SNI) {
        tuples.splice(j + 1, 0, [CODEC_SNI, domain]);
        return true;
      }
    }
    return false;
  }
  confirm(ma, ttl) {
    const host = this.findHost(ma);
    let startingConfidence = false;
    for (const [ip, mapping] of this.mappings.entries()) {
      if (mapping.domain === host) {
        this.log("marking %s to %s DNS mapping as verified", ip, mapping.domain);
        startingConfidence = mapping.verified;
        mapping.verified = true;
        mapping.expires = Date.now() + ttl;
        mapping.lastVerified = Date.now();
      }
    }
    return startingConfidence;
  }
  unconfirm(ma, ttl) {
    const host = this.findHost(ma);
    let wasConfident = false;
    for (const [ip, mapping] of this.mappings.entries()) {
      if (mapping.domain === host) {
        this.log("removing verification of %s to %s DNS mapping", ip, mapping.domain);
        wasConfident = wasConfident || mapping.verified;
        mapping.verified = false;
        mapping.expires = Date.now() + ttl;
      }
    }
    return wasConfident;
  }
  findHost(ma) {
    for (const tuple of ma.stringTuples()) {
      if (tuple[0] === CODEC_SNI) {
        return tuple[1];
      }
      if (tuple[0] === CODEC_DNS || tuple[0] === CODEC_DNS4 || tuple[0] === CODEC_DNS6 || tuple[0] === CODEC_DNSADDR) {
        return tuple[1];
      }
    }
  }
};

// ../../node_modules/libp2p/dist/src/address-manager/ip-mappings.js
var CODEC_IP4 = 4;
var CODEC_IP6 = 41;
var CODEC_TCP = 6;
var CODEC_UDP = 273;
var IPMappings = class {
  log;
  mappings;
  constructor(components, init = {}) {
    this.log = components.logger.forComponent("libp2p:address-manager:ip-mappings");
    this.mappings = /* @__PURE__ */ new Map();
  }
  has(ma) {
    const tuples = ma.stringTuples();
    for (const mappings of this.mappings.values()) {
      for (const mapping of mappings) {
        if (mapping.externalIp === tuples[0][1]) {
          return true;
        }
      }
    }
    return false;
  }
  add(internalIp, internalPort, externalIp, externalPort = internalPort, protocol = "tcp") {
    const key = `${internalIp}-${internalPort}-${protocol}`;
    const mappings = this.mappings.get(key) ?? [];
    const mapping = {
      internalIp,
      internalPort,
      externalIp,
      externalPort,
      externalFamily: isIPv4(externalIp) ? 4 : 6,
      protocol,
      verified: false,
      expires: 0
    };
    mappings.push(mapping);
    this.mappings.set(key, mappings);
  }
  remove(ma) {
    const tuples = ma.stringTuples();
    const host = tuples[0][1] ?? "";
    const protocol = tuples[1][0] === CODEC_TCP ? "tcp" : "udp";
    const port = parseInt(tuples[1][1] ?? "0");
    let wasConfident = false;
    for (const [key, mappings] of this.mappings.entries()) {
      for (let i = 0; i < mappings.length; i++) {
        const mapping = mappings[i];
        if (mapping.externalIp === host && mapping.externalPort === port && mapping.protocol === protocol) {
          this.log("removing %s:%s to %s:%s %s IP mapping", mapping.externalIp, mapping.externalPort, host, port, protocol);
          wasConfident = wasConfident || mapping.verified;
          mappings.splice(i, 1);
          i--;
        }
      }
      if (mappings.length === 0) {
        this.mappings.delete(key);
      }
    }
    return wasConfident;
  }
  getAll(addresses) {
    const ipMappedAddresses = [];
    for (const { multiaddr: ma } of addresses) {
      const tuples = ma.stringTuples();
      let tuple;
      if ((tuples[0][0] === CODEC_IP4 || tuples[0][0] === CODEC_IP6) && tuples[1][0] === CODEC_TCP) {
        tuple = `${tuples[0][1]}-${tuples[1][1]}-tcp`;
      } else if ((tuples[0][0] === CODEC_IP4 || tuples[0][0] === CODEC_IP6) && tuples[1][0] === CODEC_UDP) {
        tuple = `${tuples[0][1]}-${tuples[1][1]}-udp`;
      }
      if (tuple == null) {
        continue;
      }
      const mappings = this.mappings.get(tuple);
      if (mappings == null) {
        continue;
      }
      for (const mapping of mappings) {
        tuples[0][0] = mapping.externalFamily === 4 ? CODEC_IP4 : CODEC_IP6;
        tuples[0][1] = mapping.externalIp;
        tuples[1][1] = `${mapping.externalPort}`;
        ipMappedAddresses.push({
          multiaddr: multiaddr(`/${tuples.map((tuple2) => {
            return [
              getProtocol(tuple2[0]).name,
              tuple2[1]
            ].join("/");
          }).join("/")}`),
          verified: mapping.verified,
          type: "ip-mapping",
          expires: mapping.expires,
          lastVerified: mapping.lastVerified
        });
      }
    }
    return ipMappedAddresses;
  }
  confirm(ma, ttl) {
    const tuples = ma.stringTuples();
    const host = tuples[0][1];
    let startingConfidence = false;
    for (const mappings of this.mappings.values()) {
      for (const mapping of mappings) {
        if (mapping.externalIp === host) {
          this.log("marking %s to %s IP mapping as verified", mapping.internalIp, mapping.externalIp);
          startingConfidence = mapping.verified;
          mapping.verified = true;
          mapping.expires = Date.now() + ttl;
          mapping.lastVerified = Date.now();
        }
      }
    }
    return startingConfidence;
  }
  unconfirm(ma, ttl) {
    const tuples = ma.stringTuples();
    const host = tuples[0][1] ?? "";
    const protocol = tuples[1][0] === CODEC_TCP ? "tcp" : "udp";
    const port = parseInt(tuples[1][1] ?? "0");
    let wasConfident = false;
    for (const mappings of this.mappings.values()) {
      for (let i = 0; i < mappings.length; i++) {
        const mapping = mappings[i];
        if (mapping.externalIp === host && mapping.externalPort === port && mapping.protocol === protocol) {
          this.log("removing verification of %s:%s to %s:%s %s IP mapping", mapping.externalIp, mapping.externalPort, host, port, protocol);
          wasConfident = wasConfident || mapping.verified;
          mapping.verified = false;
          mapping.expires = Date.now() + ttl;
        }
      }
    }
    return wasConfident;
  }
};

// ../../node_modules/libp2p/dist/src/address-manager/observed-addresses.js
import { isLinkLocal } from "@libp2p/utils/multiaddr/is-link-local";
import { isPrivate } from "@libp2p/utils/multiaddr/is-private";
var defaultValues = {
  maxObservedAddresses: 10
};
var ObservedAddresses = class {
  log;
  addresses;
  maxObservedAddresses;
  constructor(components, init = {}) {
    this.log = components.logger.forComponent("libp2p:address-manager:observed-addresses");
    this.addresses = /* @__PURE__ */ new Map();
    this.maxObservedAddresses = init.maxObservedAddresses ?? defaultValues.maxObservedAddresses;
  }
  has(ma) {
    return this.addresses.has(ma.toString());
  }
  removePrefixed(prefix) {
    for (const key of this.addresses.keys()) {
      if (key.toString().startsWith(prefix)) {
        this.addresses.delete(key);
      }
    }
  }
  add(ma) {
    if (this.addresses.size === this.maxObservedAddresses) {
      return;
    }
    if (isPrivate(ma) || isLinkLocal(ma)) {
      return;
    }
    this.log("adding observed address %a", ma);
    this.addresses.set(ma.toString(), {
      verified: false,
      expires: 0
    });
  }
  getAll() {
    return Array.from(this.addresses).map(([ma, metadata]) => ({
      multiaddr: multiaddr(ma),
      verified: metadata.verified,
      type: "observed",
      expires: metadata.expires,
      lastVerified: metadata.lastVerified
    }));
  }
  remove(ma) {
    const startingConfidence = this.addresses.get(ma.toString())?.verified ?? false;
    this.log("removing observed address %a", ma);
    this.addresses.delete(ma.toString());
    return startingConfidence;
  }
  confirm(ma, ttl) {
    const addrString = ma.toString();
    const metadata = this.addresses.get(addrString) ?? {
      verified: false,
      expires: Date.now() + ttl,
      lastVerified: Date.now()
    };
    const startingConfidence = metadata.verified;
    metadata.verified = true;
    metadata.lastVerified = Date.now();
    this.log("marking observed address %a as verified", addrString);
    this.addresses.set(addrString, metadata);
    return startingConfidence;
  }
};

// ../../node_modules/libp2p/dist/src/address-manager/transport-addresses.js
import { isPrivate as isPrivate2 } from "@libp2p/utils/multiaddr/is-private";
var defaultValues2 = {
  maxObservedAddresses: 10
};
var TransportAddresses = class {
  log;
  addresses;
  maxObservedAddresses;
  constructor(components, init = {}) {
    this.log = components.logger.forComponent("libp2p:address-manager:observed-addresses");
    this.addresses = /* @__PURE__ */ new Map();
    this.maxObservedAddresses = init.maxObservedAddresses ?? defaultValues2.maxObservedAddresses;
  }
  get(multiaddr2, ttl) {
    if (isPrivate2(multiaddr2)) {
      return {
        multiaddr: multiaddr2,
        verified: true,
        type: "transport",
        expires: Date.now() + ttl,
        lastVerified: Date.now()
      };
    }
    const key = this.toKey(multiaddr2);
    let metadata = this.addresses.get(key);
    if (metadata == null) {
      metadata = {
        verified: false,
        expires: 0
      };
      this.addresses.set(key, metadata);
    }
    return {
      multiaddr: multiaddr2,
      verified: metadata.verified,
      type: "transport",
      expires: metadata.expires,
      lastVerified: metadata.lastVerified
    };
  }
  has(ma) {
    const key = this.toKey(ma);
    return this.addresses.has(key);
  }
  remove(ma) {
    const key = this.toKey(ma);
    const startingConfidence = this.addresses.get(key)?.verified ?? false;
    this.log("removing observed address %a", ma);
    this.addresses.delete(key);
    return startingConfidence;
  }
  confirm(ma, ttl) {
    const key = this.toKey(ma);
    const metadata = this.addresses.get(key) ?? {
      verified: false,
      expires: 0,
      lastVerified: 0
    };
    const startingConfidence = metadata.verified;
    metadata.verified = true;
    metadata.expires = Date.now() + ttl;
    metadata.lastVerified = Date.now();
    this.addresses.set(key, metadata);
    return startingConfidence;
  }
  unconfirm(ma, ttl) {
    const key = this.toKey(ma);
    const metadata = this.addresses.get(key) ?? {
      verified: false,
      expires: 0
    };
    const startingConfidence = metadata.verified;
    metadata.verified = false;
    metadata.expires = Date.now() + ttl;
    this.addresses.set(key, metadata);
    return startingConfidence;
  }
  toKey(ma) {
    const options = ma.toOptions();
    return `${options.host}-${options.port}-${options.transport}`;
  }
};

// ../../node_modules/libp2p/dist/src/address-manager/index.js
var ONE_MINUTE = 6e4;
var defaultValues3 = {
  maxObservedAddresses: 10,
  addressVerificationTTL: ONE_MINUTE * 10,
  addressVerificationRetry: ONE_MINUTE * 5
};
var defaultAddressFilter = (addrs) => addrs;
function stripPeerId(ma, peerId2) {
  const observedPeerIdStr = ma.getPeerId();
  if (observedPeerIdStr != null) {
    const observedPeerId = peerIdFromString(observedPeerIdStr);
    if (observedPeerId.equals(peerId2)) {
      ma = ma.decapsulate(multiaddr(`/p2p/${peerId2.toString()}`));
    }
  }
  return ma;
}
var AddressManager = class {
  log;
  components;
  // this is an array to allow for duplicates, e.g. multiples of `/ip4/0.0.0.0/tcp/0`
  listen;
  announce;
  appendAnnounce;
  announceFilter;
  observed;
  dnsMappings;
  ipMappings;
  transportAddresses;
  observedAddressFilter;
  addressVerificationTTL;
  addressVerificationRetry;
  /**
   * Responsible for managing the peer addresses.
   * Peers can specify their listen and announce addresses.
   * The listen addresses will be used by the libp2p transports to listen for new connections,
   * while the announce addresses will be used for the peer addresses' to other peers in the network.
   */
  constructor(components, init = {}) {
    const { listen = [], announce = [], appendAnnounce = [] } = init;
    this.components = components;
    this.log = components.logger.forComponent("libp2p:address-manager");
    this.listen = listen.map((ma) => ma.toString());
    this.announce = new Set(announce.map((ma) => ma.toString()));
    this.appendAnnounce = new Set(appendAnnounce.map((ma) => ma.toString()));
    this.observed = new ObservedAddresses(components, init);
    this.dnsMappings = new DNSMappings(components, init);
    this.ipMappings = new IPMappings(components, init);
    this.transportAddresses = new TransportAddresses(components, init);
    this.announceFilter = init.announceFilter ?? defaultAddressFilter;
    this.observedAddressFilter = createScalableCuckooFilter(1024);
    this.addressVerificationTTL = init.addressVerificationTTL ?? defaultValues3.addressVerificationTTL;
    this.addressVerificationRetry = init.addressVerificationRetry ?? defaultValues3.addressVerificationRetry;
    this._updatePeerStoreAddresses = debounce(this._updatePeerStoreAddresses.bind(this), 1e3);
    components.events.addEventListener("transport:listening", () => {
      this._updatePeerStoreAddresses();
    });
    components.events.addEventListener("transport:close", () => {
      this._updatePeerStoreAddresses();
    });
  }
  [Symbol.toStringTag] = "@libp2p/address-manager";
  _updatePeerStoreAddresses() {
    const addrs = this.getAddresses().map((ma) => {
      if (ma.getPeerId() === this.components.peerId.toString()) {
        return ma.decapsulate(`/p2p/${this.components.peerId.toString()}`);
      }
      return ma;
    });
    this.components.peerStore.patch(this.components.peerId, {
      multiaddrs: addrs
    }).catch((err) => {
      this.log.error("error updating addresses", err);
    });
  }
  /**
   * Get peer listen multiaddrs
   */
  getListenAddrs() {
    return Array.from(this.listen).map((a) => multiaddr(a));
  }
  /**
   * Get peer announcing multiaddrs
   */
  getAnnounceAddrs() {
    return Array.from(this.announce).map((a) => multiaddr(a));
  }
  /**
   * Get peer announcing multiaddrs
   */
  getAppendAnnounceAddrs() {
    return Array.from(this.appendAnnounce).map((a) => multiaddr(a));
  }
  /**
   * Get observed multiaddrs
   */
  getObservedAddrs() {
    return this.observed.getAll().map((addr) => addr.multiaddr);
  }
  /**
   * Add peer observed addresses
   */
  addObservedAddr(addr) {
    const tuples = addr.stringTuples();
    const socketAddress = `${tuples[0][1]}:${tuples[1][1]}`;
    if (this.observedAddressFilter.has(socketAddress)) {
      return;
    }
    this.observedAddressFilter.add(socketAddress);
    addr = stripPeerId(addr, this.components.peerId);
    if (this.ipMappings.has(addr)) {
      return;
    }
    if (this.dnsMappings.has(addr)) {
      return;
    }
    this.observed.add(addr);
  }
  confirmObservedAddr(addr, options) {
    addr = stripPeerId(addr, this.components.peerId);
    let startingConfidence = true;
    if (options?.type === "observed" || this.observed.has(addr)) {
      startingConfidence = this.observed.confirm(addr, options?.ttl ?? this.addressVerificationTTL);
    }
    if (options?.type === "transport" || this.transportAddresses.has(addr)) {
      startingConfidence = this.transportAddresses.confirm(addr, options?.ttl ?? this.addressVerificationTTL);
    }
    if (options?.type === "dns-mapping" || this.dnsMappings.has(addr)) {
      startingConfidence = this.dnsMappings.confirm(addr, options?.ttl ?? this.addressVerificationTTL);
    }
    if (options?.type === "ip-mapping" || this.ipMappings.has(addr)) {
      startingConfidence = this.ipMappings.confirm(addr, options?.ttl ?? this.addressVerificationTTL);
    }
    if (!startingConfidence) {
      this._updatePeerStoreAddresses();
    }
  }
  removeObservedAddr(addr, options) {
    addr = stripPeerId(addr, this.components.peerId);
    let startingConfidence = false;
    if (this.observed.has(addr)) {
      startingConfidence = this.observed.remove(addr);
    }
    if (this.transportAddresses.has(addr)) {
      startingConfidence = this.transportAddresses.unconfirm(addr, options?.ttl ?? this.addressVerificationRetry);
    }
    if (this.dnsMappings.has(addr)) {
      startingConfidence = this.dnsMappings.unconfirm(addr, options?.ttl ?? this.addressVerificationRetry);
    }
    if (this.ipMappings.has(addr)) {
      startingConfidence = this.ipMappings.unconfirm(addr, options?.ttl ?? this.addressVerificationRetry);
    }
    if (startingConfidence) {
      this._updatePeerStoreAddresses();
    }
  }
  getAddresses() {
    const addresses = /* @__PURE__ */ new Set();
    const multiaddrs = this.getAddressesWithMetadata().filter((addr) => {
      if (!addr.verified) {
        return false;
      }
      const maStr = addr.multiaddr.toString();
      if (addresses.has(maStr)) {
        return false;
      }
      addresses.add(maStr);
      return true;
    }).map((address) => address.multiaddr);
    return this.announceFilter(multiaddrs.map((str) => {
      const ma = multiaddr(str);
      if (ma.protos().pop()?.path === true) {
        return ma;
      }
      if (ma.getPeerId() === this.components.peerId.toString()) {
        return ma;
      }
      return ma.encapsulate(`/p2p/${this.components.peerId.toString()}`);
    }));
  }
  getAddressesWithMetadata() {
    const announceMultiaddrs = this.getAnnounceAddrs();
    if (announceMultiaddrs.length > 0) {
      return announceMultiaddrs.map((multiaddr2) => ({
        multiaddr: multiaddr2,
        verified: true,
        type: "announce",
        expires: Date.now() + this.addressVerificationTTL,
        lastVerified: Date.now()
      }));
    }
    let addresses = [];
    addresses = addresses.concat(this.components.transportManager.getAddrs().map((multiaddr2) => this.transportAddresses.get(multiaddr2, this.addressVerificationTTL)));
    addresses = addresses.concat(this.getAppendAnnounceAddrs().map((multiaddr2) => ({
      multiaddr: multiaddr2,
      verified: true,
      type: "announce",
      expires: Date.now() + this.addressVerificationTTL,
      lastVerified: Date.now()
    })));
    addresses = addresses.concat(this.observed.getAll());
    addresses = addresses.concat(this.ipMappings.getAll(addresses));
    addresses = addresses.concat(this.dnsMappings.getAll(addresses));
    return addresses;
  }
  addDNSMapping(domain, addresses) {
    this.dnsMappings.add(domain, addresses);
  }
  removeDNSMapping(domain) {
    if (this.dnsMappings.remove(multiaddr(`/dns/${domain}`))) {
      this._updatePeerStoreAddresses();
    }
  }
  addPublicAddressMapping(internalIp, internalPort, externalIp, externalPort = internalPort, protocol = "tcp") {
    this.ipMappings.add(internalIp, internalPort, externalIp, externalPort, protocol);
    this.observed.removePrefixed(`/ip${isIPv4(externalIp) ? 4 : 6}/${externalIp}/${protocol}/${externalPort}`);
  }
  removePublicAddressMapping(internalIp, internalPort, externalIp, externalPort = internalPort, protocol = "tcp") {
    if (this.ipMappings.remove(multiaddr(`/ip${isIPv4(externalIp) ? 4 : 6}/${externalIp}/${protocol}/${externalPort}`))) {
      this._updatePeerStoreAddresses();
    }
  }
};

// ../../node_modules/libp2p/dist/src/components.js
import { serviceCapabilities, serviceDependencies } from "@libp2p/interface";
import { isStartable } from "@libp2p/interface";
import { defaultLogger } from "@libp2p/logger";

// ../../node_modules/libp2p/dist/src/errors.js
var messages;
(function(messages2) {
  messages2["NOT_STARTED_YET"] = "The libp2p node is not started yet";
  messages2["NOT_FOUND"] = "Not found";
})(messages || (messages = {}));
var MissingServiceError = class extends Error {
  constructor(message2 = "Missing service") {
    super(message2);
    this.name = "MissingServiceError";
  }
};
var UnmetServiceDependenciesError = class extends Error {
  constructor(message2 = "Unmet service dependencies") {
    super(message2);
    this.name = "UnmetServiceDependenciesError";
  }
};
var NoContentRoutersError = class extends Error {
  constructor(message2 = "No content routers available") {
    super(message2);
    this.name = "NoContentRoutersError";
  }
};
var NoPeerRoutersError = class extends Error {
  constructor(message2 = "No peer routers available") {
    super(message2);
    this.name = "NoPeerRoutersError";
  }
};
var QueriedForSelfError = class extends Error {
  constructor(message2 = "Should not try to find self") {
    super(message2);
    this.name = "QueriedForSelfError";
  }
};
var UnhandledProtocolError = class extends Error {
  constructor(message2 = "Unhandled protocol error") {
    super(message2);
    this.name = "UnhandledProtocolError";
  }
};
var DuplicateProtocolHandlerError = class extends Error {
  constructor(message2 = "Duplicate protocol handler error") {
    super(message2);
    this.name = "DuplicateProtocolHandlerError";
  }
};
var DialDeniedError = class extends Error {
  constructor(message2 = "Dial denied error") {
    super(message2);
    this.name = "DialDeniedError";
  }
};
var NoValidAddressesError = class extends Error {
  constructor(message2 = "No valid addresses") {
    super(message2);
    this.name = "NoValidAddressesError";
  }
};
var ConnectionInterceptedError = class extends Error {
  constructor(message2 = "Connection intercepted") {
    super(message2);
    this.name = "ConnectionInterceptedError";
  }
};
var ConnectionDeniedError = class extends Error {
  constructor(message2 = "Connection denied") {
    super(message2);
    this.name = "ConnectionDeniedError";
  }
};
var MuxerUnavailableError = class extends Error {
  constructor(message2 = "Stream is not multiplexed") {
    super(message2);
    this.name = "MuxerUnavailableError";
  }
};
var EncryptionFailedError = class extends Error {
  constructor(message2 = "Encryption failed") {
    super(message2);
    this.name = "EncryptionFailedError";
  }
};
var TransportUnavailableError = class extends Error {
  constructor(message2 = "Transport unavailable") {
    super(message2);
    this.name = "TransportUnavailableError";
  }
};

// ../../node_modules/libp2p/dist/src/components.js
var DefaultComponents = class {
  components = {};
  _started = false;
  constructor(init = {}) {
    this.components = {};
    for (const [key, value] of Object.entries(init)) {
      this.components[key] = value;
    }
    if (this.components.logger == null) {
      this.components.logger = defaultLogger();
    }
  }
  isStarted() {
    return this._started;
  }
  async _invokeStartableMethod(methodName) {
    await Promise.all(Object.values(this.components).filter((obj) => isStartable(obj)).map(async (startable) => {
      await startable[methodName]?.();
    }));
  }
  async beforeStart() {
    await this._invokeStartableMethod("beforeStart");
  }
  async start() {
    await this._invokeStartableMethod("start");
    this._started = true;
  }
  async afterStart() {
    await this._invokeStartableMethod("afterStart");
  }
  async beforeStop() {
    await this._invokeStartableMethod("beforeStop");
  }
  async stop() {
    await this._invokeStartableMethod("stop");
    this._started = false;
  }
  async afterStop() {
    await this._invokeStartableMethod("afterStop");
  }
};
var OPTIONAL_SERVICES = [
  "metrics",
  "connectionProtector",
  "dns"
];
var NON_SERVICE_PROPERTIES = [
  "components",
  "isStarted",
  "beforeStart",
  "start",
  "afterStart",
  "beforeStop",
  "stop",
  "afterStop",
  "then",
  "_invokeStartableMethod"
];
function defaultComponents(init = {}) {
  const components = new DefaultComponents(init);
  const proxy = new Proxy(components, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && !NON_SERVICE_PROPERTIES.includes(prop)) {
        const service = components.components[prop];
        if (service == null && !OPTIONAL_SERVICES.includes(prop)) {
          throw new MissingServiceError(`${prop} not set`);
        }
        return service;
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value) {
      if (typeof prop === "string") {
        components.components[prop] = value;
      } else {
        Reflect.set(target, prop, value);
      }
      return true;
    }
  });
  return proxy;
}
function checkServiceDependencies(components) {
  const serviceCapabilities5 = {};
  for (const service of Object.values(components.components)) {
    for (const capability of getServiceCapabilities(service)) {
      serviceCapabilities5[capability] = true;
    }
  }
  for (const service of Object.values(components.components)) {
    for (const capability of getServiceDependencies(service)) {
      if (serviceCapabilities5[capability] !== true) {
        throw new UnmetServiceDependenciesError(`Service "${getServiceName(service)}" required capability "${capability}" but it was not provided by any component, you may need to add additional configuration when creating your node.`);
      }
    }
  }
}
function getServiceCapabilities(service) {
  if (Array.isArray(service?.[serviceCapabilities])) {
    return service[serviceCapabilities];
  }
  return [];
}
function getServiceDependencies(service) {
  if (Array.isArray(service?.[serviceDependencies])) {
    return service[serviceDependencies];
  }
  return [];
}
function getServiceName(service) {
  return service?.[Symbol.toStringTag] ?? service?.toString() ?? "unknown";
}

// ../../node_modules/libp2p/dist/src/config/connection-gater.js
function connectionGater(gater = {}) {
  return {
    denyDialPeer: async () => false,
    denyDialMultiaddr: async () => false,
    denyInboundConnection: async () => false,
    denyOutboundConnection: async () => false,
    denyInboundEncryptedConnection: async () => false,
    denyOutboundEncryptedConnection: async () => false,
    denyInboundUpgradedConnection: async () => false,
    denyOutboundUpgradedConnection: async () => false,
    filterMultiaddrForPeer: async () => true,
    ...gater
  };
}

// ../../node_modules/libp2p/dist/src/connection-manager/index.js
import { ConnectionClosedError, InvalidMultiaddrError as InvalidMultiaddrError2, InvalidParametersError as InvalidParametersError3, InvalidPeerIdError, NotStartedError, start, stop } from "@libp2p/interface";
import { PeerMap as PeerMap3 } from "@libp2p/peer-collections";
import { RateLimiter } from "@libp2p/utils/rate-limiter";

// ../../node_modules/libp2p/dist/src/get-peer.js
import { InvalidMultiaddrError, InvalidParametersError as InvalidParametersError2, isPeerId } from "@libp2p/interface";
import { peerIdFromString as peerIdFromString2 } from "@libp2p/peer-id";
function getPeerAddress(peer) {
  if (isPeerId(peer)) {
    return { peerId: peer, multiaddrs: [] };
  }
  if (!Array.isArray(peer)) {
    peer = [peer];
  }
  let peerId2;
  if (peer.length > 0) {
    const peerIdStr = peer[0].getPeerId();
    peerId2 = peerIdStr == null ? void 0 : peerIdFromString2(peerIdStr);
    peer.forEach((ma) => {
      if (!isMultiaddr(ma)) {
        throw new InvalidMultiaddrError("Invalid multiaddr");
      }
      const maPeerIdStr = ma.getPeerId();
      if (maPeerIdStr == null) {
        if (peerId2 != null) {
          throw new InvalidParametersError2("Multiaddrs must all have the same peer id or have no peer id");
        }
      } else {
        const maPeerId = peerIdFromString2(maPeerIdStr);
        if (peerId2?.equals(maPeerId) !== true) {
          throw new InvalidParametersError2("Multiaddrs must all have the same peer id or have no peer id");
        }
      }
    });
  }
  return {
    peerId: peerId2,
    multiaddrs: peer
  };
}

// ../../node_modules/libp2p/dist/src/connection-manager/connection-pruner.js
import { PeerMap } from "@libp2p/peer-collections";
import { safelyCloseConnectionIfUnused } from "@libp2p/utils/close";

// ../../node_modules/libp2p/dist/src/connection-manager/constants.defaults.js
var DIAL_TIMEOUT = 5e3;
var UPGRADE_TIMEOUT = 3e3;
var PROTOCOL_NEGOTIATION_TIMEOUT = 2e3;
var MAX_PEER_ADDRS_TO_DIAL = 25;
var INBOUND_CONNECTION_THRESHOLD = 5;
var MAX_INCOMING_PENDING_CONNECTIONS = 10;
var MAX_PARALLEL_RECONNECTS = 5;
var LAST_DIAL_FAILURE_KEY = "last-dial-failure";
var LAST_DIAL_SUCCESS_KEY = "last-dial-success";
var MAX_DIAL_QUEUE_LENGTH = 500;

// ../../node_modules/libp2p/dist/src/connection-manager/constants.js
var MAX_CONNECTIONS = 300;
var MAX_PARALLEL_DIALS = 100;

// ../../node_modules/libp2p/dist/src/connection-manager/utils.js
async function resolveMultiaddrs(ma, options) {
  let resolvable = false;
  for (const key of resolvers.keys()) {
    resolvable = ma.protoNames().includes(key);
    if (resolvable) {
      break;
    }
  }
  if (!resolvable) {
    return [ma];
  }
  const output2 = await ma.resolve(options);
  options.log("resolved %s to", ma, output2.map((ma2) => ma2.toString()));
  return output2;
}
function multiaddrToIpNet(ma) {
  try {
    let parsedMa;
    if (typeof ma === "string") {
      parsedMa = multiaddr(ma);
    } else {
      parsedMa = ma;
    }
    if (!parsedMa.protoNames().includes("ipcidr")) {
      const isIPv62 = parsedMa.protoNames().includes("ip6");
      const cidr = isIPv62 ? "/ipcidr/128" : "/ipcidr/32";
      parsedMa = parsedMa.encapsulate(cidr);
    }
    return convertToIpNet(parsedMa);
  } catch (error) {
    throw new Error(`Can't convert to IpNet, Invalid multiaddr format: ${ma}`);
  }
}

// ../../node_modules/libp2p/dist/src/connection-manager/connection-pruner.js
var defaultOptions = {
  maxConnections: MAX_CONNECTIONS,
  allow: []
};
var ConnectionPruner = class {
  maxConnections;
  connectionManager;
  peerStore;
  allow;
  events;
  log;
  constructor(components, init = {}) {
    this.maxConnections = init.maxConnections ?? defaultOptions.maxConnections;
    this.allow = (init.allow ?? []).map((ma) => multiaddrToIpNet(ma));
    this.connectionManager = components.connectionManager;
    this.peerStore = components.peerStore;
    this.events = components.events;
    this.log = components.logger.forComponent("libp2p:connection-manager:connection-pruner");
    this.maybePruneConnections = this.maybePruneConnections.bind(this);
  }
  start() {
    this.events.addEventListener("connection:open", this.maybePruneConnections);
  }
  stop() {
    this.events.removeEventListener("connection:open", this.maybePruneConnections);
  }
  maybePruneConnections() {
    this._maybePruneConnections().catch((err) => {
      this.log.error("error while pruning connections %e", err);
    });
  }
  /**
   * If we have more connections than our maximum, select some excess connections
   * to prune based on peer value
   */
  async _maybePruneConnections() {
    const connections = this.connectionManager.getConnections();
    const numConnections = connections.length;
    this.log("checking max connections limit %d/%d", numConnections, this.maxConnections);
    if (numConnections <= this.maxConnections) {
      return;
    }
    const peerValues = new PeerMap();
    for (const connection of connections) {
      const remotePeer = connection.remotePeer;
      if (peerValues.has(remotePeer)) {
        continue;
      }
      peerValues.set(remotePeer, 0);
      try {
        const peer = await this.peerStore.get(remotePeer);
        peerValues.set(remotePeer, [...peer.tags.values()].reduce((acc, curr) => {
          return acc + curr.value;
        }, 0));
      } catch (err) {
        if (err.name !== "NotFoundError") {
          this.log.error("error loading peer tags", err);
        }
      }
    }
    const sortedConnections = this.sortConnections(connections, peerValues);
    const toPrune = Math.max(numConnections - this.maxConnections, 0);
    const toClose = [];
    for (const connection of sortedConnections) {
      this.log("too many connections open - closing a connection to %p", connection.remotePeer);
      const connectionInAllowList = this.allow.some((ipNet) => {
        return ipNet.contains(connection.remoteAddr.nodeAddress().address);
      });
      if (!connectionInAllowList) {
        toClose.push(connection);
      }
      if (toClose.length === toPrune) {
        break;
      }
    }
    await Promise.all(toClose.map(async (connection) => {
      await safelyCloseConnectionIfUnused(connection, {
        signal: AbortSignal.timeout(1e3)
      });
    }));
    this.events.safeDispatchEvent("connection:prune", { detail: toClose });
  }
  sortConnections(connections, peerValues) {
    return connections.sort((a, b) => {
      const connectionALifespan = a.timeline.open;
      const connectionBLifespan = b.timeline.open;
      if (connectionALifespan < connectionBLifespan) {
        return 1;
      }
      if (connectionALifespan > connectionBLifespan) {
        return -1;
      }
      return 0;
    }).sort((a, b) => {
      if (a.direction === "outbound" && b.direction === "inbound") {
        return 1;
      }
      if (a.direction === "inbound" && b.direction === "outbound") {
        return -1;
      }
      return 0;
    }).sort((a, b) => {
      if (a.streams.length > b.streams.length) {
        return 1;
      }
      if (a.streams.length < b.streams.length) {
        return -1;
      }
      return 0;
    }).sort((a, b) => {
      const peerAValue = peerValues.get(a.remotePeer) ?? 0;
      const peerBValue = peerValues.get(b.remotePeer) ?? 0;
      if (peerAValue > peerBValue) {
        return 1;
      }
      if (peerAValue < peerBValue) {
        return -1;
      }
      return 0;
    });
  }
};

// ../../node_modules/libp2p/dist/src/connection-manager/dial-queue.js
import { TimeoutError, DialError, setMaxListeners, AbortError } from "@libp2p/interface";
import { PeerMap as PeerMap2 } from "@libp2p/peer-collections";
import { PriorityQueue } from "@libp2p/utils/priority-queue";

// ../../node_modules/@multiformats/multiaddr-matcher/dist/src/utils.js
var toParts = (ma) => {
  return ma.toString().split("/").slice(1);
};
var func = (fn) => {
  return {
    match: (vals) => {
      if (vals.length < 1) {
        return false;
      }
      if (fn(vals[0])) {
        return vals.slice(1);
      }
      return false;
    },
    pattern: "fn"
  };
};
var literal = (str) => {
  return {
    match: (vals) => func((val) => val === str).match(vals),
    pattern: str
  };
};
var string2 = () => {
  return {
    match: (vals) => func((val) => typeof val === "string").match(vals),
    pattern: "{string}"
  };
};
var number = () => {
  return {
    match: (vals) => func((val) => !isNaN(parseInt(val))).match(vals),
    pattern: "{number}"
  };
};
var peerId = () => {
  return {
    match: (vals) => {
      if (vals.length < 2) {
        return false;
      }
      if (vals[0] !== "p2p" && vals[0] !== "ipfs") {
        return false;
      }
      if (vals[1].startsWith("Q") || vals[1].startsWith("1")) {
        try {
          base58btc.decode(`z${vals[1]}`);
        } catch (err) {
          return false;
        }
      } else {
        return false;
      }
      return vals.slice(2);
    },
    pattern: "/p2p/{peerid}"
  };
};
var certhash = () => {
  return {
    match: (vals) => {
      if (vals.length < 2) {
        return false;
      }
      if (vals[0] !== "certhash") {
        return false;
      }
      try {
        base64url.decode(vals[1]);
      } catch {
        return false;
      }
      return vals.slice(2);
    },
    pattern: "/certhash/{certhash}"
  };
};
var optional = (matcher) => {
  return {
    match: (vals) => {
      const result = matcher.match(vals);
      if (result === false) {
        return vals;
      }
      return result;
    },
    pattern: `optional(${matcher.pattern})`
  };
};
var or2 = (...matchers) => {
  return {
    match: (vals) => {
      let matches;
      for (const matcher of matchers) {
        const result = matcher.match(vals);
        if (result === false) {
          continue;
        }
        if (matches == null || result.length < matches.length) {
          matches = result;
        }
      }
      if (matches == null) {
        return false;
      }
      return matches;
    },
    pattern: `or(${matchers.map((m) => m.pattern).join(", ")})`
  };
};
var and = (...matchers) => {
  return {
    match: (vals) => {
      for (const matcher of matchers) {
        const result = matcher.match(vals);
        if (result === false) {
          return false;
        }
        vals = result;
      }
      return vals;
    },
    pattern: `and(${matchers.map((m) => m.pattern).join(", ")})`
  };
};
function fmt(...matchers) {
  function match(ma) {
    let parts = toParts(ma);
    for (const matcher of matchers) {
      const result = matcher.match(parts);
      if (result === false) {
        return false;
      }
      parts = result;
    }
    return parts;
  }
  function matches(ma) {
    const result = match(ma);
    return result !== false;
  }
  function exactMatch(ma) {
    const result = match(ma);
    if (result === false) {
      return false;
    }
    return result.length === 0;
  }
  return {
    matchers,
    matches,
    exactMatch
  };
}

// ../../node_modules/@multiformats/multiaddr-matcher/dist/src/index.js
var _DNS4 = and(literal("dns4"), string2());
var _DNS6 = and(literal("dns6"), string2());
var _DNSADDR = and(literal("dnsaddr"), string2());
var _DNS = and(literal("dns"), string2());
var DNS4 = fmt(_DNS4, optional(peerId()));
var DNS6 = fmt(_DNS6, optional(peerId()));
var DNSADDR = fmt(_DNSADDR, optional(peerId()));
var DNS2 = fmt(or2(_DNS, _DNSADDR, _DNS4, _DNS6), optional(peerId()));
var _IP4 = and(literal("ip4"), func(isIPv4));
var _IP6 = and(literal("ip6"), func(isIPv6));
var _IP = or2(_IP4, _IP6);
var _IP_OR_DOMAIN = or2(_IP, _DNS, _DNS4, _DNS6, _DNSADDR);
var IP_OR_DOMAIN = fmt(or2(_IP, and(or2(_DNS, _DNSADDR, _DNS4, _DNS6), optional(peerId()))));
var IP4 = fmt(_IP4);
var IP6 = fmt(_IP6);
var IP = fmt(_IP);
var _TCP = and(_IP_OR_DOMAIN, literal("tcp"), number());
var _UDP = and(_IP_OR_DOMAIN, literal("udp"), number());
var TCP = fmt(and(_TCP, optional(peerId())));
var UDP = fmt(_UDP);
var _QUIC = and(_UDP, literal("quic"), optional(peerId()));
var _QUICV1 = and(_UDP, literal("quic-v1"), optional(peerId()));
var QUIC_V0_OR_V1 = or2(_QUIC, _QUICV1);
var QUIC = fmt(_QUIC);
var QUICV1 = fmt(_QUICV1);
var _WEB = or2(_IP_OR_DOMAIN, _TCP, _UDP, _QUIC, _QUICV1);
var _WebSockets = or2(and(_WEB, literal("ws"), optional(peerId())));
var WebSockets = fmt(_WebSockets);
var _WebSocketsSecure = or2(and(_WEB, literal("wss"), optional(peerId())), and(_WEB, literal("tls"), optional(and(literal("sni"), string2())), literal("ws"), optional(peerId())));
var WebSocketsSecure = fmt(_WebSocketsSecure);
var _WebRTCDirect = and(_UDP, literal("webrtc-direct"), optional(certhash()), optional(certhash()), optional(peerId()));
var WebRTCDirect = fmt(_WebRTCDirect);
var _WebTransport = and(_QUICV1, literal("webtransport"), optional(certhash()), optional(certhash()), optional(peerId()));
var WebTransport = fmt(_WebTransport);
var _P2P = or2(_WebSockets, _WebSocketsSecure, and(_TCP, optional(peerId())), and(QUIC_V0_OR_V1, optional(peerId())), and(_IP_OR_DOMAIN, optional(peerId())), _WebRTCDirect, _WebTransport, peerId());
var P2P = fmt(_P2P);
var _Circuit = and(_P2P, literal("p2p-circuit"), peerId());
var Circuit = fmt(_Circuit);
var _WebRTC = or2(and(_P2P, literal("p2p-circuit"), literal("webrtc"), optional(peerId())), and(_P2P, literal("webrtc"), optional(peerId())), and(literal("webrtc"), optional(peerId())));
var WebRTC = fmt(_WebRTC);
var _HTTP = or2(and(_IP_OR_DOMAIN, literal("tcp"), number(), literal("http"), optional(peerId())), and(_IP_OR_DOMAIN, literal("http"), optional(peerId())));
var HTTP = fmt(_HTTP);
var _HTTPS = or2(and(_IP_OR_DOMAIN, literal("tcp"), or2(and(literal("443"), literal("http")), and(number(), literal("https"))), optional(peerId())), and(_IP_OR_DOMAIN, literal("tls"), literal("http"), optional(peerId())), and(_IP_OR_DOMAIN, literal("https"), optional(peerId())));
var HTTPS = fmt(_HTTPS);
var _Memory = or2(and(literal("memory"), string2(), optional(peerId())));
var Memory = fmt(_Memory);

// ../../node_modules/any-signal/dist/src/index.js
function anySignal(signals) {
  const controller = new globalThis.AbortController();
  function onAbort() {
    controller.abort();
    for (const signal2 of signals) {
      if (signal2?.removeEventListener != null) {
        signal2.removeEventListener("abort", onAbort);
      }
    }
  }
  for (const signal2 of signals) {
    if (signal2?.aborted === true) {
      onAbort();
      break;
    }
    if (signal2?.addEventListener != null) {
      signal2.addEventListener("abort", onAbort);
    }
  }
  function clear() {
    for (const signal2 of signals) {
      if (signal2?.removeEventListener != null) {
        signal2.removeEventListener("abort", onAbort);
      }
    }
  }
  const signal = controller.signal;
  signal.clear = clear;
  return signal;
}

// ../../node_modules/libp2p/dist/src/connection-manager/address-sorter.js
import { isPrivate as isPrivate3 } from "@libp2p/utils/multiaddr/is-private";
function reliableTransportsFirst(a, b) {
  const isATCP = TCP.exactMatch(a.multiaddr);
  const isBTCP = TCP.exactMatch(b.multiaddr);
  if (isATCP && !isBTCP) {
    return -1;
  }
  if (!isATCP && isBTCP) {
    return 1;
  }
  const isAWebSocketSecure = WebSocketsSecure.exactMatch(a.multiaddr);
  const isBWebSocketSecure = WebSocketsSecure.exactMatch(b.multiaddr);
  if (isAWebSocketSecure && !isBWebSocketSecure) {
    return -1;
  }
  if (!isAWebSocketSecure && isBWebSocketSecure) {
    return 1;
  }
  const isAWebSocket = WebSockets.exactMatch(a.multiaddr);
  const isBWebSocket = WebSockets.exactMatch(b.multiaddr);
  if (isAWebSocket && !isBWebSocket) {
    return -1;
  }
  if (!isAWebSocket && isBWebSocket) {
    return 1;
  }
  const isAWebRTC = WebRTC.exactMatch(a.multiaddr);
  const isBWebRTC = WebRTC.exactMatch(b.multiaddr);
  if (isAWebRTC && !isBWebRTC) {
    return -1;
  }
  if (!isAWebRTC && isBWebRTC) {
    return 1;
  }
  const isAWebRTCDirect = WebRTCDirect.exactMatch(a.multiaddr);
  const isBWebRTCDirect = WebRTCDirect.exactMatch(b.multiaddr);
  if (isAWebRTCDirect && !isBWebRTCDirect) {
    return -1;
  }
  if (!isAWebRTCDirect && isBWebRTCDirect) {
    return 1;
  }
  const isAWebTransport = WebTransport.exactMatch(a.multiaddr);
  const isBWebTransport = WebTransport.exactMatch(b.multiaddr);
  if (isAWebTransport && !isBWebTransport) {
    return -1;
  }
  if (!isAWebTransport && isBWebTransport) {
    return 1;
  }
  return 0;
}
function publicAddressesFirst(a, b) {
  const isAPrivate = isPrivate3(a.multiaddr);
  const isBPrivate = isPrivate3(b.multiaddr);
  if (isAPrivate && !isBPrivate) {
    return 1;
  } else if (!isAPrivate && isBPrivate) {
    return -1;
  }
  return 0;
}
function certifiedAddressesFirst(a, b) {
  if (a.isCertified && !b.isCertified) {
    return -1;
  } else if (!a.isCertified && b.isCertified) {
    return 1;
  }
  return 0;
}
function circuitRelayAddressesLast(a, b) {
  const isACircuit = Circuit.exactMatch(a.multiaddr);
  const isBCircuit = Circuit.exactMatch(b.multiaddr);
  if (isACircuit && !isBCircuit) {
    return 1;
  } else if (!isACircuit && isBCircuit) {
    return -1;
  }
  return 0;
}
function defaultAddressSorter(addresses) {
  return addresses.sort(reliableTransportsFirst).sort(certifiedAddressesFirst).sort(circuitRelayAddressesLast).sort(publicAddressesFirst);
}

// ../../node_modules/libp2p/dist/src/connection-manager/dial-queue.js
var defaultOptions2 = {
  maxParallelDials: MAX_PARALLEL_DIALS,
  maxDialQueueLength: MAX_DIAL_QUEUE_LENGTH,
  maxPeerAddrsToDial: MAX_PEER_ADDRS_TO_DIAL,
  dialTimeout: DIAL_TIMEOUT,
  resolvers: {
    dnsaddr: dnsaddrResolver
  }
};
var DialQueue = class {
  queue;
  components;
  addressSorter;
  maxPeerAddrsToDial;
  maxDialQueueLength;
  dialTimeout;
  shutDownController;
  connections;
  log;
  constructor(components, init = {}) {
    this.addressSorter = init.addressSorter;
    this.maxPeerAddrsToDial = init.maxPeerAddrsToDial ?? defaultOptions2.maxPeerAddrsToDial;
    this.maxDialQueueLength = init.maxDialQueueLength ?? defaultOptions2.maxDialQueueLength;
    this.dialTimeout = init.dialTimeout ?? defaultOptions2.dialTimeout;
    this.connections = init.connections ?? new PeerMap2();
    this.log = components.logger.forComponent("libp2p:connection-manager:dial-queue");
    this.components = components;
    this.shutDownController = new AbortController();
    setMaxListeners(Infinity, this.shutDownController.signal);
    for (const [key, value] of Object.entries(init.resolvers ?? {})) {
      resolvers.set(key, value);
    }
    this.queue = new PriorityQueue({
      concurrency: init.maxParallelDials ?? defaultOptions2.maxParallelDials,
      metricName: "libp2p_dial_queue",
      metrics: components.metrics
    });
    this.queue.addEventListener("error", (event) => {
      if (event.detail.name !== AbortError.name) {
        this.log.error("error in dial queue - %e", event.detail);
      }
    });
  }
  start() {
    this.shutDownController = new AbortController();
    setMaxListeners(Infinity, this.shutDownController.signal);
  }
  /**
   * Clears any pending dials
   */
  stop() {
    this.shutDownController.abort();
    this.queue.abort();
  }
  /**
   * Connects to a given peer, multiaddr or list of multiaddrs.
   *
   * If a peer is passed, all known multiaddrs will be tried. If a multiaddr or
   * multiaddrs are passed only those will be dialled.
   *
   * Where a list of multiaddrs is passed, if any contain a peer id then all
   * multiaddrs in the list must contain the same peer id.
   *
   * The dial to the first address that is successfully able to upgrade a
   * connection will be used, all other dials will be aborted when that happens.
   */
  async dial(peerIdOrMultiaddr, options = {}) {
    const { peerId: peerId2, multiaddrs } = getPeerAddress(peerIdOrMultiaddr);
    const existingConnection = Array.from(this.connections.values()).flat().find((conn) => {
      if (options.force === true) {
        return false;
      }
      if (conn.remotePeer.equals(peerId2)) {
        return true;
      }
      return multiaddrs.find((addr) => {
        return addr.equals(conn.remoteAddr);
      });
    });
    if (existingConnection?.status === "open") {
      this.log("already connected to %a", existingConnection.remoteAddr);
      options.onProgress?.(new CustomProgressEvent("dial-queue:already-connected"));
      return existingConnection;
    }
    const existingDial = this.queue.queue.find((job) => {
      if (peerId2?.equals(job.options.peerId) === true) {
        return true;
      }
      const addresses = job.options.multiaddrs;
      if (addresses == null) {
        return false;
      }
      for (const multiaddr2 of multiaddrs) {
        if (addresses.has(multiaddr2.toString())) {
          return true;
        }
      }
      return false;
    });
    if (existingDial != null) {
      this.log("joining existing dial target for %p", peerId2);
      for (const multiaddr2 of multiaddrs) {
        existingDial.options.multiaddrs.add(multiaddr2.toString());
      }
      options.onProgress?.(new CustomProgressEvent("dial-queue:already-in-dial-queue"));
      return existingDial.join(options);
    }
    if (this.queue.size >= this.maxDialQueueLength) {
      throw new DialError("Dial queue is full");
    }
    this.log("creating dial target for %p", peerId2, multiaddrs.map((ma) => ma.toString()));
    options.onProgress?.(new CustomProgressEvent("dial-queue:add-to-dial-queue"));
    return this.queue.add(async (options2) => {
      options2?.onProgress?.(new CustomProgressEvent("dial-queue:start-dial"));
      const signal = anySignal([
        this.shutDownController.signal,
        options2.signal
      ]);
      setMaxListeners(Infinity, signal);
      let addrsToDial;
      try {
        addrsToDial = await this.calculateMultiaddrs(peerId2, options2?.multiaddrs, {
          ...options2,
          signal
        });
        options2?.onProgress?.(new CustomProgressEvent("dial-queue:calculated-addresses", addrsToDial));
        addrsToDial.map(({ multiaddr: multiaddr2 }) => multiaddr2.toString()).forEach((addr) => {
          options2?.multiaddrs.add(addr);
        });
      } catch (err) {
        signal.clear();
        throw err;
      }
      try {
        let dialed = 0;
        const errors = [];
        for (const address of addrsToDial) {
          if (dialed === this.maxPeerAddrsToDial) {
            this.log("dialed maxPeerAddrsToDial (%d) addresses for %p, not trying any others", dialed, peerId2);
            throw new DialError("Peer had more than maxPeerAddrsToDial");
          }
          dialed++;
          try {
            const conn = await this.components.transportManager.dial(address.multiaddr, {
              ...options2,
              signal
            });
            this.log("dial to %a succeeded", address.multiaddr);
            try {
              await this.components.peerStore.merge(conn.remotePeer, {
                multiaddrs: [
                  conn.remoteAddr
                ],
                metadata: {
                  [LAST_DIAL_SUCCESS_KEY]: fromString2(Date.now().toString())
                }
              });
            } catch (err) {
              this.log.error("could not update last dial failure key for %p", peerId2, err);
            }
            return conn;
          } catch (err) {
            this.log.error("dial failed to %a", address.multiaddr, err);
            if (peerId2 != null) {
              try {
                await this.components.peerStore.merge(peerId2, {
                  metadata: {
                    [LAST_DIAL_FAILURE_KEY]: fromString2(Date.now().toString())
                  }
                });
              } catch (err2) {
                this.log.error("could not update last dial failure key for %p", peerId2, err2);
              }
            }
            if (signal.aborted) {
              throw new TimeoutError(err.message);
            }
            errors.push(err);
          }
        }
        if (errors.length === 1) {
          throw errors[0];
        }
        throw new AggregateError(errors, "All multiaddr dials failed");
      } finally {
        signal.clear();
      }
    }, {
      peerId: peerId2,
      priority: options.priority ?? DEFAULT_DIAL_PRIORITY,
      multiaddrs: new Set(multiaddrs.map((ma) => ma.toString())),
      signal: options.signal ?? AbortSignal.timeout(this.dialTimeout),
      onProgress: options.onProgress
    });
  }
  // eslint-disable-next-line complexity
  async calculateMultiaddrs(peerId2, multiaddrs = /* @__PURE__ */ new Set(), options = {}) {
    const addrs = [...multiaddrs].map((ma) => ({
      multiaddr: multiaddr(ma),
      isCertified: false
    }));
    if (peerId2 != null) {
      if (this.components.peerId.equals(peerId2)) {
        throw new DialError("Tried to dial self");
      }
      if (await this.components.connectionGater.denyDialPeer?.(peerId2) === true) {
        throw new DialDeniedError("The dial request is blocked by gater.allowDialPeer");
      }
      if (addrs.length === 0) {
        this.log("loading multiaddrs for %p", peerId2);
        try {
          const peer = await this.components.peerStore.get(peerId2);
          addrs.push(...peer.addresses);
          this.log("loaded multiaddrs for %p", peerId2, addrs.map(({ multiaddr: multiaddr2 }) => multiaddr2.toString()));
        } catch (err) {
          if (err.name !== "NotFoundError") {
            throw err;
          }
        }
      }
      if (addrs.length === 0) {
        this.log("looking up multiaddrs for %p in the peer routing", peerId2);
        try {
          const peerInfo = await this.components.peerRouting.findPeer(peerId2, options);
          this.log("found multiaddrs for %p in the peer routing", peerId2, addrs.map(({ multiaddr: multiaddr2 }) => multiaddr2.toString()));
          addrs.push(...peerInfo.multiaddrs.map((multiaddr2) => ({
            multiaddr: multiaddr2,
            isCertified: false
          })));
        } catch (err) {
          if (err.name !== "NoPeerRoutersError") {
            this.log.error("looking up multiaddrs for %p in the peer routing failed", peerId2, err);
          }
        }
      }
    }
    let resolvedAddresses = (await Promise.all(addrs.map(async (addr) => {
      const result = await resolveMultiaddrs(addr.multiaddr, {
        dns: this.components.dns,
        ...options,
        log: this.log
      });
      if (result.length === 1 && result[0].equals(addr.multiaddr)) {
        return addr;
      }
      return result.map((multiaddr2) => ({
        multiaddr: multiaddr2,
        isCertified: false
      }));
    }))).flat();
    if (peerId2 != null) {
      const peerIdMultiaddr = `/p2p/${peerId2.toString()}`;
      resolvedAddresses = resolvedAddresses.map((addr) => {
        const lastProto = addr.multiaddr.protos().pop();
        if (lastProto?.path === true) {
          return addr;
        }
        if (addr.multiaddr.getPeerId() == null) {
          return {
            multiaddr: addr.multiaddr.encapsulate(peerIdMultiaddr),
            isCertified: addr.isCertified
          };
        }
        return addr;
      });
    }
    const filteredAddrs = resolvedAddresses.filter((addr) => {
      if (this.components.transportManager.dialTransportForMultiaddr(addr.multiaddr) == null) {
        return false;
      }
      const addrPeerId = addr.multiaddr.getPeerId();
      if (peerId2 != null && addrPeerId != null) {
        return peerId2.equals(addrPeerId);
      }
      return true;
    });
    const dedupedAddrs = /* @__PURE__ */ new Map();
    for (const addr of filteredAddrs) {
      const maStr = addr.multiaddr.toString();
      const existing = dedupedAddrs.get(maStr);
      if (existing != null) {
        existing.isCertified = existing.isCertified || addr.isCertified || false;
        continue;
      }
      dedupedAddrs.set(maStr, addr);
    }
    const dedupedMultiaddrs = [...dedupedAddrs.values()];
    if (dedupedMultiaddrs.length === 0) {
      throw new NoValidAddressesError("The dial request has no valid addresses");
    }
    const gatedAdrs = [];
    for (const addr of dedupedMultiaddrs) {
      if (this.components.connectionGater.denyDialMultiaddr != null && await this.components.connectionGater.denyDialMultiaddr(addr.multiaddr)) {
        continue;
      }
      gatedAdrs.push(addr);
    }
    const sortedGatedAddrs = this.addressSorter == null ? defaultAddressSorter(gatedAdrs) : gatedAdrs.sort(this.addressSorter);
    if (sortedGatedAddrs.length === 0) {
      throw new DialDeniedError("The connection gater denied all addresses in the dial request");
    }
    this.log.trace("addresses for %p before filtering", peerId2 ?? "unknown peer", resolvedAddresses.map(({ multiaddr: multiaddr2 }) => multiaddr2.toString()));
    this.log.trace("addresses for %p after filtering", peerId2 ?? "unknown peer", sortedGatedAddrs.map(({ multiaddr: multiaddr2 }) => multiaddr2.toString()));
    return sortedGatedAddrs;
  }
  async isDialable(multiaddr2, options = {}) {
    if (!Array.isArray(multiaddr2)) {
      multiaddr2 = [multiaddr2];
    }
    try {
      const addresses = await this.calculateMultiaddrs(void 0, new Set(multiaddr2.map((ma) => ma.toString())), options);
      if (options.runOnLimitedConnection === false) {
        return addresses.find((addr) => {
          return !Circuit.matches(addr.multiaddr);
        }) != null;
      }
      return true;
    } catch (err) {
      this.log.trace("error calculating if multiaddr(s) were dialable", err);
    }
    return false;
  }
};

// ../../node_modules/libp2p/dist/src/connection-manager/reconnect-queue.js
import { KEEP_ALIVE } from "@libp2p/interface";
import { PeerQueue } from "@libp2p/utils/peer-queue";

// ../../node_modules/libp2p/node_modules/p-retry/index.js
var import_retry = __toESM(require_retry2(), 1);

// ../../node_modules/is-network-error/index.js
var objectToString = Object.prototype.toString;
var isError = (value) => objectToString.call(value) === "[object Error]";
var errorMessages = /* @__PURE__ */ new Set([
  "network error",
  // Chrome
  "Failed to fetch",
  // Chrome
  "NetworkError when attempting to fetch resource.",
  // Firefox
  "The Internet connection appears to be offline.",
  // Safari 16
  "Load failed",
  // Safari 17+
  "Network request failed",
  // `cross-fetch`
  "fetch failed",
  // Undici (Node.js)
  "terminated"
  // Undici (Node.js)
]);
function isNetworkError(error) {
  const isValid = error && isError(error) && error.name === "TypeError" && typeof error.message === "string";
  if (!isValid) {
    return false;
  }
  if (error.message === "Load failed") {
    return error.stack === void 0;
  }
  return errorMessages.has(error.message);
}

// ../../node_modules/libp2p/node_modules/p-retry/index.js
var AbortError2 = class extends Error {
  constructor(message2) {
    super();
    if (message2 instanceof Error) {
      this.originalError = message2;
      ({ message: message2 } = message2);
    } else {
      this.originalError = new Error(message2);
      this.originalError.stack = this.stack;
    }
    this.name = "AbortError";
    this.message = message2;
  }
};
var decorateErrorWithCounts = (error, attemptNumber, options) => {
  const retriesLeft = options.retries - (attemptNumber - 1);
  error.attemptNumber = attemptNumber;
  error.retriesLeft = retriesLeft;
  return error;
};
async function pRetry(input, options) {
  return new Promise((resolve, reject) => {
    options = { ...options };
    options.onFailedAttempt ??= () => {
    };
    options.shouldRetry ??= () => true;
    options.retries ??= 10;
    const operation = import_retry.default.operation(options);
    const abortHandler = () => {
      operation.stop();
      reject(options.signal?.reason);
    };
    if (options.signal && !options.signal.aborted) {
      options.signal.addEventListener("abort", abortHandler, { once: true });
    }
    const cleanUp = () => {
      options.signal?.removeEventListener("abort", abortHandler);
      operation.stop();
    };
    operation.attempt(async (attemptNumber) => {
      try {
        const result = await input(attemptNumber);
        cleanUp();
        resolve(result);
      } catch (error) {
        try {
          if (!(error instanceof Error)) {
            throw new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`);
          }
          if (error instanceof AbortError2) {
            throw error.originalError;
          }
          if (error instanceof TypeError && !isNetworkError(error)) {
            throw error;
          }
          decorateErrorWithCounts(error, attemptNumber, options);
          if (!await options.shouldRetry(error)) {
            operation.stop();
            reject(error);
          }
          await options.onFailedAttempt(error);
          if (!operation.retry(error)) {
            throw operation.mainError();
          }
        } catch (finalError) {
          decorateErrorWithCounts(finalError, attemptNumber, options);
          cleanUp();
          reject(finalError);
        }
      }
    });
  });
}

// ../../node_modules/libp2p/dist/src/connection-manager/reconnect-queue.js
var ReconnectQueue = class {
  log;
  queue;
  started;
  peerStore;
  retries;
  retryInterval;
  backoffFactor;
  connectionManager;
  events;
  constructor(components, init = {}) {
    this.log = components.logger.forComponent("libp2p:reconnect-queue");
    this.peerStore = components.peerStore;
    this.connectionManager = components.connectionManager;
    this.queue = new PeerQueue({
      concurrency: init.maxParallelReconnects ?? MAX_PARALLEL_RECONNECTS,
      metricName: "libp2p_reconnect_queue",
      metrics: components.metrics
    });
    this.started = false;
    this.retries = init.retries ?? 5;
    this.backoffFactor = init.backoffFactor;
    this.retryInterval = init.retryInterval;
    this.events = components.events;
    components.events.addEventListener("peer:disconnect", (evt) => {
      this.maybeReconnect(evt.detail).catch((err) => {
        this.log.error("failed to maybe reconnect to %p - %e", evt.detail, err);
      });
    });
  }
  async maybeReconnect(peerId2) {
    if (!this.started) {
      return;
    }
    const peer = await this.peerStore.get(peerId2);
    if (!hasKeepAliveTag(peer)) {
      return;
    }
    if (this.queue.has(peerId2)) {
      return;
    }
    this.queue.add(async (options) => {
      await pRetry(async (attempt) => {
        if (!this.started) {
          return;
        }
        try {
          await this.connectionManager.openConnection(peerId2, {
            signal: options?.signal
          });
        } catch (err) {
          this.log("reconnecting to %p attempt %d of %d failed - %e", peerId2, attempt, this.retries, err);
          throw err;
        }
      }, {
        signal: options?.signal,
        retries: this.retries,
        factor: this.backoffFactor,
        minTimeout: this.retryInterval
      });
    }, {
      peerId: peerId2
    }).catch(async (err) => {
      this.log.error("failed to reconnect to %p - %e", peerId2, err);
      const tags = {};
      [...peer.tags.keys()].forEach((key) => {
        if (key.startsWith(KEEP_ALIVE)) {
          tags[key] = void 0;
        }
      });
      await this.peerStore.merge(peerId2, {
        tags
      });
      this.events.safeDispatchEvent("peer:reconnect-failure", {
        detail: peerId2
      });
    }).catch(async (err) => {
      this.log.error("failed to remove keep-alive tag from %p - %e", peerId2, err);
    });
  }
  start() {
    this.started = true;
  }
  async afterStart() {
    void Promise.resolve().then(async () => {
      const keepAlivePeers = await this.peerStore.all({
        filters: [
          (peer) => hasKeepAliveTag(peer)
        ]
      });
      await Promise.all(keepAlivePeers.map(async (peer) => {
        await this.connectionManager.openConnection(peer.id).catch((err) => {
          this.log.error(err);
        });
      }));
    }).catch((err) => {
      this.log.error(err);
    });
  }
  stop() {
    this.started = false;
    this.queue.abort();
  }
};
function hasKeepAliveTag(peer) {
  for (const tag of peer.tags.keys()) {
    if (tag.startsWith(KEEP_ALIVE)) {
      return true;
    }
  }
  return false;
}

// ../../node_modules/libp2p/dist/src/connection-manager/index.js
var DEFAULT_DIAL_PRIORITY = 50;
var defaultOptions3 = {
  maxConnections: MAX_CONNECTIONS,
  inboundConnectionThreshold: INBOUND_CONNECTION_THRESHOLD,
  maxIncomingPendingConnections: MAX_INCOMING_PENDING_CONNECTIONS
};
var DefaultConnectionManager = class {
  started;
  connections;
  allow;
  deny;
  maxIncomingPendingConnections;
  incomingPendingConnections;
  outboundPendingConnections;
  maxConnections;
  dialQueue;
  reconnectQueue;
  connectionPruner;
  inboundConnectionRateLimiter;
  peerStore;
  metrics;
  events;
  log;
  peerId;
  constructor(components, init = {}) {
    this.maxConnections = init.maxConnections ?? defaultOptions3.maxConnections;
    if (this.maxConnections < 1) {
      throw new InvalidParametersError3("Connection Manager maxConnections must be greater than 0");
    }
    this.connections = new PeerMap3();
    this.started = false;
    this.peerId = components.peerId;
    this.peerStore = components.peerStore;
    this.metrics = components.metrics;
    this.events = components.events;
    this.log = components.logger.forComponent("libp2p:connection-manager");
    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.allow = (init.allow ?? []).map((str) => multiaddrToIpNet(str));
    this.deny = (init.deny ?? []).map((str) => multiaddrToIpNet(str));
    this.incomingPendingConnections = 0;
    this.maxIncomingPendingConnections = init.maxIncomingPendingConnections ?? defaultOptions3.maxIncomingPendingConnections;
    this.outboundPendingConnections = 0;
    this.inboundConnectionRateLimiter = new RateLimiter({
      points: init.inboundConnectionThreshold ?? defaultOptions3.inboundConnectionThreshold,
      duration: 1
    });
    this.connectionPruner = new ConnectionPruner({
      connectionManager: this,
      peerStore: components.peerStore,
      events: components.events,
      logger: components.logger
    }, {
      maxConnections: this.maxConnections,
      allow: init.allow?.map((a) => multiaddr(a))
    });
    this.dialQueue = new DialQueue(components, {
      addressSorter: init.addressSorter,
      maxParallelDials: init.maxParallelDials ?? MAX_PARALLEL_DIALS,
      maxDialQueueLength: init.maxDialQueueLength ?? MAX_DIAL_QUEUE_LENGTH,
      maxPeerAddrsToDial: init.maxPeerAddrsToDial ?? MAX_PEER_ADDRS_TO_DIAL,
      dialTimeout: init.dialTimeout ?? DIAL_TIMEOUT,
      resolvers: init.resolvers ?? {
        dnsaddr: dnsaddrResolver
      },
      connections: this.connections
    });
    this.reconnectQueue = new ReconnectQueue({
      events: components.events,
      peerStore: components.peerStore,
      logger: components.logger,
      connectionManager: this
    }, {
      retries: init.reconnectRetries,
      retryInterval: init.reconnectRetryInterval,
      backoffFactor: init.reconnectBackoffFactor,
      maxParallelReconnects: init.maxParallelReconnects
    });
  }
  [Symbol.toStringTag] = "@libp2p/connection-manager";
  /**
   * Starts the Connection Manager. If Metrics are not enabled on libp2p
   * only event loop and connection limits will be monitored.
   */
  async start() {
    this.metrics?.registerMetricGroup("libp2p_connection_manager_connections", {
      calculate: () => {
        const metric = {
          inbound: 0,
          "inbound pending": this.incomingPendingConnections,
          outbound: 0,
          "outbound pending": this.outboundPendingConnections
        };
        for (const conns of this.connections.values()) {
          for (const conn of conns) {
            metric[conn.direction]++;
          }
        }
        return metric;
      }
    });
    this.metrics?.registerMetricGroup("libp2p_protocol_streams_total", {
      label: "protocol",
      calculate: () => {
        const metric = {};
        for (const conns of this.connections.values()) {
          for (const conn of conns) {
            for (const stream of conn.streams) {
              const key = `${stream.direction} ${stream.protocol ?? "unnegotiated"}`;
              metric[key] = (metric[key] ?? 0) + 1;
            }
          }
        }
        return metric;
      }
    });
    this.metrics?.registerMetricGroup("libp2p_connection_manager_protocol_streams_per_connection_90th_percentile", {
      label: "protocol",
      calculate: () => {
        const allStreams = {};
        for (const conns of this.connections.values()) {
          for (const conn of conns) {
            const streams = {};
            for (const stream of conn.streams) {
              const key = `${stream.direction} ${stream.protocol ?? "unnegotiated"}`;
              streams[key] = (streams[key] ?? 0) + 1;
            }
            for (const [protocol, count] of Object.entries(streams)) {
              allStreams[protocol] = allStreams[protocol] ?? [];
              allStreams[protocol].push(count);
            }
          }
        }
        const metric = {};
        for (let [protocol, counts] of Object.entries(allStreams)) {
          counts = counts.sort((a, b) => a - b);
          const index = Math.floor(counts.length * 0.9);
          metric[protocol] = counts[index];
        }
        return metric;
      }
    });
    this.events.addEventListener("connection:open", this.onConnect);
    this.events.addEventListener("connection:close", this.onDisconnect);
    await start(this.dialQueue, this.reconnectQueue, this.connectionPruner);
    this.started = true;
    this.log("started");
  }
  /**
   * Stops the Connection Manager
   */
  async stop() {
    this.events.removeEventListener("connection:open", this.onConnect);
    this.events.removeEventListener("connection:close", this.onDisconnect);
    await stop(this.reconnectQueue, this.dialQueue, this.connectionPruner);
    const tasks = [];
    for (const connectionList of this.connections.values()) {
      for (const connection of connectionList) {
        tasks.push((async () => {
          try {
            await connection.close();
          } catch (err) {
            this.log.error(err);
          }
        })());
      }
    }
    this.log("closing %d connections", tasks.length);
    await Promise.all(tasks);
    this.connections.clear();
    this.log("stopped");
  }
  getMaxConnections() {
    return this.maxConnections;
  }
  onConnect(evt) {
    void this._onConnect(evt).catch((err) => {
      this.log.error(err);
    });
  }
  /**
   * Tracks the incoming connection and check the connection limit
   */
  async _onConnect(evt) {
    const { detail: connection } = evt;
    if (!this.started) {
      await connection.close();
      return;
    }
    if (connection.status !== "open") {
      return;
    }
    const peerId2 = connection.remotePeer;
    const isNewPeer = !this.connections.has(peerId2);
    const storedConns = this.connections.get(peerId2) ?? [];
    storedConns.push(connection);
    this.connections.set(peerId2, storedConns);
    if (peerId2.publicKey != null && peerId2.type === "RSA") {
      await this.peerStore.patch(peerId2, {
        publicKey: peerId2.publicKey
      });
    }
    if (isNewPeer) {
      this.events.safeDispatchEvent("peer:connect", { detail: connection.remotePeer });
    }
  }
  /**
   * Removes the connection from tracking
   */
  onDisconnect(evt) {
    const { detail: connection } = evt;
    const peerId2 = connection.remotePeer;
    const peerConns = this.connections.get(peerId2) ?? [];
    const filteredPeerConns = peerConns.filter((conn) => conn.id !== connection.id);
    this.connections.set(peerId2, filteredPeerConns);
    if (filteredPeerConns.length === 0) {
      this.log("onDisconnect remove all connections for peer %p", peerId2);
      this.connections.delete(peerId2);
      this.events.safeDispatchEvent("peer:disconnect", { detail: connection.remotePeer });
    }
  }
  getConnections(peerId2) {
    if (peerId2 != null) {
      return this.connections.get(peerId2) ?? [];
    }
    let conns = [];
    for (const c of this.connections.values()) {
      conns = conns.concat(c);
    }
    return conns;
  }
  getConnectionsMap() {
    return this.connections;
  }
  async openConnection(peerIdOrMultiaddr, options = {}) {
    if (!this.started) {
      throw new NotStartedError("Not started");
    }
    this.outboundPendingConnections++;
    try {
      options.signal?.throwIfAborted();
      const { peerId: peerId2 } = getPeerAddress(peerIdOrMultiaddr);
      if (this.peerId.equals(peerId2)) {
        throw new InvalidPeerIdError("Can not dial self");
      }
      if (peerId2 != null && options.force !== true) {
        this.log("dial %p", peerId2);
        const existingConnection = this.getConnections(peerId2).find((conn) => conn.limits == null);
        if (existingConnection != null) {
          this.log("had an existing non-limited connection to %p", peerId2);
          options.onProgress?.(new CustomProgressEvent("dial-queue:already-connected"));
          return existingConnection;
        }
      }
      const connection = await this.dialQueue.dial(peerIdOrMultiaddr, {
        ...options,
        priority: options.priority ?? DEFAULT_DIAL_PRIORITY
      });
      if (connection.status !== "open") {
        throw new ConnectionClosedError("Remote closed connection during opening");
      }
      let peerConnections = this.connections.get(connection.remotePeer);
      if (peerConnections == null) {
        peerConnections = [];
        this.connections.set(connection.remotePeer, peerConnections);
      }
      let trackedConnection = false;
      for (const conn of peerConnections) {
        if (conn.id === connection.id) {
          trackedConnection = true;
        }
        if (options.force !== true && conn.id !== connection.id && conn.remoteAddr.equals(connection.remoteAddr)) {
          connection.abort(new InvalidMultiaddrError2("Duplicate multiaddr connection"));
          return conn;
        }
      }
      if (!trackedConnection) {
        peerConnections.push(connection);
      }
      return connection;
    } finally {
      this.outboundPendingConnections--;
    }
  }
  async closeConnections(peerId2, options = {}) {
    const connections = this.connections.get(peerId2) ?? [];
    await Promise.all(connections.map(async (connection) => {
      try {
        await connection.close(options);
      } catch (err) {
        connection.abort(err);
      }
    }));
  }
  async acceptIncomingConnection(maConn) {
    const denyConnection = this.deny.some((ma) => {
      return ma.contains(maConn.remoteAddr.nodeAddress().address);
    });
    if (denyConnection) {
      this.log("connection from %a refused - connection remote address was in deny list", maConn.remoteAddr);
      return false;
    }
    const allowConnection = this.allow.some((ipNet) => {
      return ipNet.contains(maConn.remoteAddr.nodeAddress().address);
    });
    if (allowConnection) {
      this.incomingPendingConnections++;
      return true;
    }
    if (this.incomingPendingConnections === this.maxIncomingPendingConnections) {
      this.log("connection from %a refused - incomingPendingConnections exceeded by host", maConn.remoteAddr);
      return false;
    }
    if (maConn.remoteAddr.isThinWaistAddress()) {
      const host = maConn.remoteAddr.nodeAddress().address;
      try {
        await this.inboundConnectionRateLimiter.consume(host, 1);
      } catch {
        this.log("connection from %a refused - inboundConnectionThreshold exceeded by host %s", maConn.remoteAddr, host);
        return false;
      }
    }
    if (this.getConnections().length < this.maxConnections) {
      this.incomingPendingConnections++;
      return true;
    }
    this.log("connection from %a refused - maxConnections exceeded", maConn.remoteAddr);
    return false;
  }
  afterUpgradeInbound() {
    this.incomingPendingConnections--;
  }
  getDialQueue() {
    const statusMap = {
      queued: "queued",
      running: "active",
      errored: "error",
      complete: "success"
    };
    return this.dialQueue.queue.queue.map((job) => {
      return {
        id: job.id,
        status: statusMap[job.status],
        peerId: job.options.peerId,
        multiaddrs: [...job.options.multiaddrs].map((ma) => multiaddr(ma))
      };
    });
  }
  async isDialable(multiaddr2, options = {}) {
    return this.dialQueue.isDialable(multiaddr2, options);
  }
};

// ../../node_modules/libp2p/dist/src/connection-monitor.js
import { randomBytes } from "@libp2p/crypto";
import { serviceCapabilities as serviceCapabilities2, setMaxListeners as setMaxListeners2 } from "@libp2p/interface";
import { AdaptiveTimeout } from "@libp2p/utils/adaptive-timeout";

// ../../node_modules/p-defer/index.js
function pDefer() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

// ../../node_modules/race-signal/dist/src/index.js
var AbortError3 = class extends Error {
  type;
  code;
  constructor(message2, code2, name3) {
    super(message2 ?? "The operation was aborted");
    this.type = "aborted";
    this.name = name3 ?? "AbortError";
    this.code = code2 ?? "ABORT_ERR";
  }
};
async function raceSignal(promise, signal, opts) {
  if (signal == null) {
    return promise;
  }
  if (signal.aborted) {
    return Promise.reject(new AbortError3(opts?.errorMessage, opts?.errorCode, opts?.errorName));
  }
  let listener;
  const error = new AbortError3(opts?.errorMessage, opts?.errorCode, opts?.errorName);
  try {
    return await Promise.race([
      promise,
      new Promise((resolve, reject) => {
        listener = () => {
          reject(error);
        };
        signal.addEventListener("abort", listener);
      })
    ]);
  } finally {
    if (listener != null) {
      signal.removeEventListener("abort", listener);
    }
  }
}

// ../../node_modules/it-queueless-pushable/dist/src/index.js
var QueuelessPushable = class {
  readNext;
  haveNext;
  ended;
  nextResult;
  constructor() {
    this.ended = false;
    this.readNext = pDefer();
    this.haveNext = pDefer();
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  async next() {
    if (this.nextResult == null) {
      await this.haveNext.promise;
    }
    if (this.nextResult == null) {
      throw new Error("HaveNext promise resolved but nextResult was undefined");
    }
    const nextResult = this.nextResult;
    this.nextResult = void 0;
    this.readNext.resolve();
    this.readNext = pDefer();
    return nextResult;
  }
  async throw(err) {
    this.ended = true;
    if (err != null) {
      this.haveNext.promise.catch(() => {
      });
      this.haveNext.reject(err);
    }
    const result = {
      done: true,
      value: void 0
    };
    return result;
  }
  async return() {
    const result = {
      done: true,
      value: void 0
    };
    await this._push(void 0);
    return result;
  }
  async push(value, options) {
    await this._push(value, options);
  }
  async end(err, options) {
    if (err != null) {
      await this.throw(err);
    } else {
      await this._push(void 0, options);
    }
  }
  async _push(value, options) {
    if (value != null && this.ended) {
      throw new Error("Cannot push value onto an ended pushable");
    }
    while (this.nextResult != null) {
      await this.readNext.promise;
    }
    if (value != null) {
      this.nextResult = { done: false, value };
    } else {
      this.ended = true;
      this.nextResult = { done: true, value: void 0 };
    }
    this.haveNext.resolve();
    this.haveNext = pDefer();
    await raceSignal(this.readNext.promise, options?.signal, options);
  }
};
function queuelessPushable() {
  return new QueuelessPushable();
}

// ../../node_modules/uint8arraylist/dist/src/index.js
var symbol2 = Symbol.for("@achingbrain/uint8arraylist");
function findBufAndOffset(bufs, index) {
  if (index == null || index < 0) {
    throw new RangeError("index is out of bounds");
  }
  let offset = 0;
  for (const buf of bufs) {
    const bufEnd = offset + buf.byteLength;
    if (index < bufEnd) {
      return {
        buf,
        index: index - offset
      };
    }
    offset = bufEnd;
  }
  throw new RangeError("index is out of bounds");
}
function isUint8ArrayList(value) {
  return Boolean(value?.[symbol2]);
}
var Uint8ArrayList = class _Uint8ArrayList {
  bufs;
  length;
  [symbol2] = true;
  constructor(...data) {
    this.bufs = [];
    this.length = 0;
    if (data.length > 0) {
      this.appendAll(data);
    }
  }
  *[Symbol.iterator]() {
    yield* this.bufs;
  }
  get byteLength() {
    return this.length;
  }
  /**
   * Add one or more `bufs` to the end of this Uint8ArrayList
   */
  append(...bufs) {
    this.appendAll(bufs);
  }
  /**
   * Add all `bufs` to the end of this Uint8ArrayList
   */
  appendAll(bufs) {
    let length3 = 0;
    for (const buf of bufs) {
      if (buf instanceof Uint8Array) {
        length3 += buf.byteLength;
        this.bufs.push(buf);
      } else if (isUint8ArrayList(buf)) {
        length3 += buf.byteLength;
        this.bufs.push(...buf.bufs);
      } else {
        throw new Error("Could not append value, must be an Uint8Array or a Uint8ArrayList");
      }
    }
    this.length += length3;
  }
  /**
   * Add one or more `bufs` to the start of this Uint8ArrayList
   */
  prepend(...bufs) {
    this.prependAll(bufs);
  }
  /**
   * Add all `bufs` to the start of this Uint8ArrayList
   */
  prependAll(bufs) {
    let length3 = 0;
    for (const buf of bufs.reverse()) {
      if (buf instanceof Uint8Array) {
        length3 += buf.byteLength;
        this.bufs.unshift(buf);
      } else if (isUint8ArrayList(buf)) {
        length3 += buf.byteLength;
        this.bufs.unshift(...buf.bufs);
      } else {
        throw new Error("Could not prepend value, must be an Uint8Array or a Uint8ArrayList");
      }
    }
    this.length += length3;
  }
  /**
   * Read the value at `index`
   */
  get(index) {
    const res = findBufAndOffset(this.bufs, index);
    return res.buf[res.index];
  }
  /**
   * Set the value at `index` to `value`
   */
  set(index, value) {
    const res = findBufAndOffset(this.bufs, index);
    res.buf[res.index] = value;
  }
  /**
   * Copy bytes from `buf` to the index specified by `offset`
   */
  write(buf, offset = 0) {
    if (buf instanceof Uint8Array) {
      for (let i = 0; i < buf.length; i++) {
        this.set(offset + i, buf[i]);
      }
    } else if (isUint8ArrayList(buf)) {
      for (let i = 0; i < buf.length; i++) {
        this.set(offset + i, buf.get(i));
      }
    } else {
      throw new Error("Could not write value, must be an Uint8Array or a Uint8ArrayList");
    }
  }
  /**
   * Remove bytes from the front of the pool
   */
  consume(bytes2) {
    bytes2 = Math.trunc(bytes2);
    if (Number.isNaN(bytes2) || bytes2 <= 0) {
      return;
    }
    if (bytes2 === this.byteLength) {
      this.bufs = [];
      this.length = 0;
      return;
    }
    while (this.bufs.length > 0) {
      if (bytes2 >= this.bufs[0].byteLength) {
        bytes2 -= this.bufs[0].byteLength;
        this.length -= this.bufs[0].byteLength;
        this.bufs.shift();
      } else {
        this.bufs[0] = this.bufs[0].subarray(bytes2);
        this.length -= bytes2;
        break;
      }
    }
  }
  /**
   * Extracts a section of an array and returns a new array.
   *
   * This is a copy operation as it is with Uint8Arrays and Arrays
   * - note this is different to the behaviour of Node Buffers.
   */
  slice(beginInclusive, endExclusive) {
    const { bufs, length: length3 } = this._subList(beginInclusive, endExclusive);
    return concat(bufs, length3);
  }
  /**
   * Returns a alloc from the given start and end element index.
   *
   * In the best case where the data extracted comes from a single Uint8Array
   * internally this is a no-copy operation otherwise it is a copy operation.
   */
  subarray(beginInclusive, endExclusive) {
    const { bufs, length: length3 } = this._subList(beginInclusive, endExclusive);
    if (bufs.length === 1) {
      return bufs[0];
    }
    return concat(bufs, length3);
  }
  /**
   * Returns a allocList from the given start and end element index.
   *
   * This is a no-copy operation.
   */
  sublist(beginInclusive, endExclusive) {
    const { bufs, length: length3 } = this._subList(beginInclusive, endExclusive);
    const list = new _Uint8ArrayList();
    list.length = length3;
    list.bufs = [...bufs];
    return list;
  }
  _subList(beginInclusive, endExclusive) {
    beginInclusive = beginInclusive ?? 0;
    endExclusive = endExclusive ?? this.length;
    if (beginInclusive < 0) {
      beginInclusive = this.length + beginInclusive;
    }
    if (endExclusive < 0) {
      endExclusive = this.length + endExclusive;
    }
    if (beginInclusive < 0 || endExclusive > this.length) {
      throw new RangeError("index is out of bounds");
    }
    if (beginInclusive === endExclusive) {
      return { bufs: [], length: 0 };
    }
    if (beginInclusive === 0 && endExclusive === this.length) {
      return { bufs: this.bufs, length: this.length };
    }
    const bufs = [];
    let offset = 0;
    for (let i = 0; i < this.bufs.length; i++) {
      const buf = this.bufs[i];
      const bufStart = offset;
      const bufEnd = bufStart + buf.byteLength;
      offset = bufEnd;
      if (beginInclusive >= bufEnd) {
        continue;
      }
      const sliceStartInBuf = beginInclusive >= bufStart && beginInclusive < bufEnd;
      const sliceEndsInBuf = endExclusive > bufStart && endExclusive <= bufEnd;
      if (sliceStartInBuf && sliceEndsInBuf) {
        if (beginInclusive === bufStart && endExclusive === bufEnd) {
          bufs.push(buf);
          break;
        }
        const start2 = beginInclusive - bufStart;
        bufs.push(buf.subarray(start2, start2 + (endExclusive - beginInclusive)));
        break;
      }
      if (sliceStartInBuf) {
        if (beginInclusive === 0) {
          bufs.push(buf);
          continue;
        }
        bufs.push(buf.subarray(beginInclusive - bufStart));
        continue;
      }
      if (sliceEndsInBuf) {
        if (endExclusive === bufEnd) {
          bufs.push(buf);
          break;
        }
        bufs.push(buf.subarray(0, endExclusive - bufStart));
        break;
      }
      bufs.push(buf);
    }
    return { bufs, length: endExclusive - beginInclusive };
  }
  indexOf(search, offset = 0) {
    if (!isUint8ArrayList(search) && !(search instanceof Uint8Array)) {
      throw new TypeError('The "value" argument must be a Uint8ArrayList or Uint8Array');
    }
    const needle = search instanceof Uint8Array ? search : search.subarray();
    offset = Number(offset ?? 0);
    if (isNaN(offset)) {
      offset = 0;
    }
    if (offset < 0) {
      offset = this.length + offset;
    }
    if (offset < 0) {
      offset = 0;
    }
    if (search.length === 0) {
      return offset > this.length ? this.length : offset;
    }
    const M = needle.byteLength;
    if (M === 0) {
      throw new TypeError("search must be at least 1 byte long");
    }
    const radix = 256;
    const rightmostPositions = new Int32Array(radix);
    for (let c = 0; c < radix; c++) {
      rightmostPositions[c] = -1;
    }
    for (let j = 0; j < M; j++) {
      rightmostPositions[needle[j]] = j;
    }
    const right = rightmostPositions;
    const lastIndex = this.byteLength - needle.byteLength;
    const lastPatIndex = needle.byteLength - 1;
    let skip;
    for (let i = offset; i <= lastIndex; i += skip) {
      skip = 0;
      for (let j = lastPatIndex; j >= 0; j--) {
        const char = this.get(i + j);
        if (needle[j] !== char) {
          skip = Math.max(1, j - right[char]);
          break;
        }
      }
      if (skip === 0) {
        return i;
      }
    }
    return -1;
  }
  getInt8(byteOffset) {
    const buf = this.subarray(byteOffset, byteOffset + 1);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getInt8(0);
  }
  setInt8(byteOffset, value) {
    const buf = allocUnsafe(1);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setInt8(0, value);
    this.write(buf, byteOffset);
  }
  getInt16(byteOffset, littleEndian) {
    const buf = this.subarray(byteOffset, byteOffset + 2);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getInt16(0, littleEndian);
  }
  setInt16(byteOffset, value, littleEndian) {
    const buf = alloc(2);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setInt16(0, value, littleEndian);
    this.write(buf, byteOffset);
  }
  getInt32(byteOffset, littleEndian) {
    const buf = this.subarray(byteOffset, byteOffset + 4);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getInt32(0, littleEndian);
  }
  setInt32(byteOffset, value, littleEndian) {
    const buf = alloc(4);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setInt32(0, value, littleEndian);
    this.write(buf, byteOffset);
  }
  getBigInt64(byteOffset, littleEndian) {
    const buf = this.subarray(byteOffset, byteOffset + 8);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getBigInt64(0, littleEndian);
  }
  setBigInt64(byteOffset, value, littleEndian) {
    const buf = alloc(8);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setBigInt64(0, value, littleEndian);
    this.write(buf, byteOffset);
  }
  getUint8(byteOffset) {
    const buf = this.subarray(byteOffset, byteOffset + 1);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getUint8(0);
  }
  setUint8(byteOffset, value) {
    const buf = allocUnsafe(1);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setUint8(0, value);
    this.write(buf, byteOffset);
  }
  getUint16(byteOffset, littleEndian) {
    const buf = this.subarray(byteOffset, byteOffset + 2);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getUint16(0, littleEndian);
  }
  setUint16(byteOffset, value, littleEndian) {
    const buf = alloc(2);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setUint16(0, value, littleEndian);
    this.write(buf, byteOffset);
  }
  getUint32(byteOffset, littleEndian) {
    const buf = this.subarray(byteOffset, byteOffset + 4);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getUint32(0, littleEndian);
  }
  setUint32(byteOffset, value, littleEndian) {
    const buf = alloc(4);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setUint32(0, value, littleEndian);
    this.write(buf, byteOffset);
  }
  getBigUint64(byteOffset, littleEndian) {
    const buf = this.subarray(byteOffset, byteOffset + 8);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getBigUint64(0, littleEndian);
  }
  setBigUint64(byteOffset, value, littleEndian) {
    const buf = alloc(8);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setBigUint64(0, value, littleEndian);
    this.write(buf, byteOffset);
  }
  getFloat32(byteOffset, littleEndian) {
    const buf = this.subarray(byteOffset, byteOffset + 4);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getFloat32(0, littleEndian);
  }
  setFloat32(byteOffset, value, littleEndian) {
    const buf = alloc(4);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setFloat32(0, value, littleEndian);
    this.write(buf, byteOffset);
  }
  getFloat64(byteOffset, littleEndian) {
    const buf = this.subarray(byteOffset, byteOffset + 8);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return view.getFloat64(0, littleEndian);
  }
  setFloat64(byteOffset, value, littleEndian) {
    const buf = alloc(8);
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setFloat64(0, value, littleEndian);
    this.write(buf, byteOffset);
  }
  equals(other) {
    if (other == null) {
      return false;
    }
    if (!(other instanceof _Uint8ArrayList)) {
      return false;
    }
    if (other.bufs.length !== this.bufs.length) {
      return false;
    }
    for (let i = 0; i < this.bufs.length; i++) {
      if (!equals3(this.bufs[i], other.bufs[i])) {
        return false;
      }
    }
    return true;
  }
  /**
   * Create a Uint8ArrayList from a pre-existing list of Uint8Arrays.  Use this
   * method if you know the total size of all the Uint8Arrays ahead of time.
   */
  static fromUint8Arrays(bufs, length3) {
    const list = new _Uint8ArrayList();
    list.bufs = bufs;
    if (length3 == null) {
      length3 = bufs.reduce((acc, curr) => acc + curr.byteLength, 0);
    }
    list.length = length3;
    return list;
  }
};

// ../../node_modules/it-byte-stream/dist/src/errors.js
var UnexpectedEOFError = class extends Error {
  name = "UnexpectedEOFError";
  code = "ERR_UNEXPECTED_EOF";
};

// ../../node_modules/it-byte-stream/dist/src/index.js
var CodeError = class extends Error {
  code;
  constructor(message2, code2) {
    super(message2);
    this.code = code2;
  }
};
var AbortError4 = class extends CodeError {
  type;
  constructor(message2) {
    super(message2, "ABORT_ERR");
    this.type = "aborted";
    this.name = "AbortError";
  }
};
function byteStream(duplex, opts) {
  const write2 = queuelessPushable();
  duplex.sink(write2).catch(async (err) => {
    await write2.end(err);
  });
  duplex.sink = async (source2) => {
    for await (const buf of source2) {
      await write2.push(buf);
    }
    await write2.end();
  };
  let source = duplex.source;
  if (duplex.source[Symbol.iterator] != null) {
    source = duplex.source[Symbol.iterator]();
  } else if (duplex.source[Symbol.asyncIterator] != null) {
    source = duplex.source[Symbol.asyncIterator]();
  }
  const readBuffer = new Uint8ArrayList();
  const W = {
    read: async (bytes2, options) => {
      options?.signal?.throwIfAborted();
      let listener;
      const abortPromise = new Promise((resolve, reject) => {
        listener = () => {
          reject(new AbortError4("Read aborted"));
        };
        options?.signal?.addEventListener("abort", listener);
      });
      try {
        if (bytes2 == null) {
          const { done, value } = await Promise.race([
            source.next(),
            abortPromise
          ]);
          if (done === true) {
            return new Uint8ArrayList();
          }
          return value;
        }
        while (readBuffer.byteLength < bytes2) {
          const { value, done } = await Promise.race([
            source.next(),
            abortPromise
          ]);
          if (done === true) {
            throw new UnexpectedEOFError("unexpected end of input");
          }
          readBuffer.append(value);
        }
        const buf = readBuffer.sublist(0, bytes2);
        readBuffer.consume(bytes2);
        return buf;
      } finally {
        if (listener != null) {
          options?.signal?.removeEventListener("abort", listener);
        }
      }
    },
    write: async (data, options) => {
      options?.signal?.throwIfAborted();
      if (data instanceof Uint8Array) {
        await write2.push(data, options);
      } else {
        await write2.push(data.subarray(), options);
      }
    },
    unwrap: () => {
      if (readBuffer.byteLength > 0) {
        const originalStream = duplex.source;
        duplex.source = async function* () {
          if (opts?.yieldBytes === false) {
            yield readBuffer;
          } else {
            yield* readBuffer;
          }
          yield* originalStream;
        }();
      }
      return duplex;
    }
  };
  return W;
}

// ../../node_modules/libp2p/dist/src/connection-monitor.js
var DEFAULT_PING_INTERVAL_MS = 1e4;
var PROTOCOL_VERSION = "1.0.0";
var PROTOCOL_NAME = "ping";
var PROTOCOL_PREFIX = "ipfs";
var PING_LENGTH = 32;
var DEFAULT_ABORT_CONNECTION_ON_PING_FAILURE = true;
var ConnectionMonitor = class {
  protocol;
  components;
  log;
  heartbeatInterval;
  pingIntervalMs;
  abortController;
  timeout;
  abortConnectionOnPingFailure;
  constructor(components, init = {}) {
    this.components = components;
    this.protocol = `/${init.protocolPrefix ?? PROTOCOL_PREFIX}/${PROTOCOL_NAME}/${PROTOCOL_VERSION}`;
    this.log = components.logger.forComponent("libp2p:connection-monitor");
    this.pingIntervalMs = init.pingInterval ?? DEFAULT_PING_INTERVAL_MS;
    this.abortConnectionOnPingFailure = init.abortConnectionOnPingFailure ?? DEFAULT_ABORT_CONNECTION_ON_PING_FAILURE;
    this.timeout = new AdaptiveTimeout({
      ...init.pingTimeout ?? {},
      metrics: components.metrics,
      metricName: "libp2p_connection_monitor_ping_time_milliseconds"
    });
  }
  [Symbol.toStringTag] = "@libp2p/connection-monitor";
  [serviceCapabilities2] = [
    "@libp2p/connection-monitor"
  ];
  start() {
    this.abortController = new AbortController();
    setMaxListeners2(Infinity, this.abortController.signal);
    this.heartbeatInterval = setInterval(() => {
      this.components.connectionManager.getConnections().forEach((conn) => {
        Promise.resolve().then(async () => {
          let start2 = Date.now();
          try {
            const signal = this.timeout.getTimeoutSignal({
              signal: this.abortController?.signal
            });
            const stream = await conn.newStream(this.protocol, {
              signal,
              runOnLimitedConnection: true
            });
            const bs = byteStream(stream);
            start2 = Date.now();
            await Promise.all([
              bs.write(randomBytes(PING_LENGTH), {
                signal
              }),
              bs.read(PING_LENGTH, {
                signal
              })
            ]);
            conn.rtt = Date.now() - start2;
            await bs.unwrap().close({
              signal
            });
          } catch (err) {
            if (err.name !== "UnsupportedProtocolError") {
              throw err;
            }
            conn.rtt = (Date.now() - start2) / 2;
          }
        }).catch((err) => {
          this.log.error("error during heartbeat", err);
          if (this.abortConnectionOnPingFailure) {
            this.log.error("aborting connection due to ping failure");
            conn.abort(err);
          } else {
            this.log("connection ping failed, but not aborting due to abortConnectionOnPingFailure flag");
          }
        });
      });
    }, this.pingIntervalMs);
  }
  stop() {
    this.abortController?.abort();
    if (this.heartbeatInterval != null) {
      clearInterval(this.heartbeatInterval);
    }
  }
};

// ../../node_modules/libp2p/dist/src/content-routing.js
import { NotStartedError as NotStartedError2 } from "@libp2p/interface";
import { PeerSet } from "@libp2p/peer-collections";

// ../../node_modules/it-pushable/dist/src/fifo.js
var FixedFIFO = class {
  buffer;
  mask;
  top;
  btm;
  next;
  constructor(hwm) {
    if (!(hwm > 0) || (hwm - 1 & hwm) !== 0) {
      throw new Error("Max size for a FixedFIFO should be a power of two");
    }
    this.buffer = new Array(hwm);
    this.mask = hwm - 1;
    this.top = 0;
    this.btm = 0;
    this.next = null;
  }
  push(data) {
    if (this.buffer[this.top] !== void 0) {
      return false;
    }
    this.buffer[this.top] = data;
    this.top = this.top + 1 & this.mask;
    return true;
  }
  shift() {
    const last = this.buffer[this.btm];
    if (last === void 0) {
      return void 0;
    }
    this.buffer[this.btm] = void 0;
    this.btm = this.btm + 1 & this.mask;
    return last;
  }
  isEmpty() {
    return this.buffer[this.btm] === void 0;
  }
};
var FIFO = class {
  size;
  hwm;
  head;
  tail;
  constructor(options = {}) {
    this.hwm = options.splitLimit ?? 16;
    this.head = new FixedFIFO(this.hwm);
    this.tail = this.head;
    this.size = 0;
  }
  calculateSize(obj) {
    if (obj?.byteLength != null) {
      return obj.byteLength;
    }
    return 1;
  }
  push(val) {
    if (val?.value != null) {
      this.size += this.calculateSize(val.value);
    }
    if (!this.head.push(val)) {
      const prev = this.head;
      this.head = prev.next = new FixedFIFO(2 * this.head.buffer.length);
      this.head.push(val);
    }
  }
  shift() {
    let val = this.tail.shift();
    if (val === void 0 && this.tail.next != null) {
      const next = this.tail.next;
      this.tail.next = null;
      this.tail = next;
      val = this.tail.shift();
    }
    if (val?.value != null) {
      this.size -= this.calculateSize(val.value);
    }
    return val;
  }
  isEmpty() {
    return this.head.isEmpty();
  }
};

// ../../node_modules/it-pushable/dist/src/index.js
var AbortError5 = class extends Error {
  type;
  code;
  constructor(message2, code2) {
    super(message2 ?? "The operation was aborted");
    this.type = "aborted";
    this.code = code2 ?? "ABORT_ERR";
  }
};
function pushable(options = {}) {
  const getNext = (buffer) => {
    const next = buffer.shift();
    if (next == null) {
      return { done: true };
    }
    if (next.error != null) {
      throw next.error;
    }
    return {
      done: next.done === true,
      // @ts-expect-error if done is false, value will be present
      value: next.value
    };
  };
  return _pushable(getNext, options);
}
function _pushable(getNext, options) {
  options = options ?? {};
  let onEnd = options.onEnd;
  let buffer = new FIFO();
  let pushable2;
  let onNext;
  let ended;
  let drain2 = pDefer();
  const waitNext = async () => {
    try {
      if (!buffer.isEmpty()) {
        return getNext(buffer);
      }
      if (ended) {
        return { done: true };
      }
      return await new Promise((resolve, reject) => {
        onNext = (next) => {
          onNext = null;
          buffer.push(next);
          try {
            resolve(getNext(buffer));
          } catch (err) {
            reject(err);
          }
          return pushable2;
        };
      });
    } finally {
      if (buffer.isEmpty()) {
        queueMicrotask(() => {
          drain2.resolve();
          drain2 = pDefer();
        });
      }
    }
  };
  const bufferNext = (next) => {
    if (onNext != null) {
      return onNext(next);
    }
    buffer.push(next);
    return pushable2;
  };
  const bufferError = (err) => {
    buffer = new FIFO();
    if (onNext != null) {
      return onNext({ error: err });
    }
    buffer.push({ error: err });
    return pushable2;
  };
  const push = (value) => {
    if (ended) {
      return pushable2;
    }
    if (options?.objectMode !== true && value?.byteLength == null) {
      throw new Error("objectMode was not true but tried to push non-Uint8Array value");
    }
    return bufferNext({ done: false, value });
  };
  const end = (err) => {
    if (ended)
      return pushable2;
    ended = true;
    return err != null ? bufferError(err) : bufferNext({ done: true });
  };
  const _return = () => {
    buffer = new FIFO();
    end();
    return { done: true };
  };
  const _throw = (err) => {
    end(err);
    return { done: true };
  };
  pushable2 = {
    [Symbol.asyncIterator]() {
      return this;
    },
    next: waitNext,
    return: _return,
    throw: _throw,
    push,
    end,
    get readableLength() {
      return buffer.size;
    },
    onEmpty: async (options2) => {
      const signal = options2?.signal;
      signal?.throwIfAborted();
      if (buffer.isEmpty()) {
        return;
      }
      let cancel;
      let listener;
      if (signal != null) {
        cancel = new Promise((resolve, reject) => {
          listener = () => {
            reject(new AbortError5());
          };
          signal.addEventListener("abort", listener);
        });
      }
      try {
        await Promise.race([
          drain2.promise,
          cancel
        ]);
      } finally {
        if (listener != null && signal != null) {
          signal?.removeEventListener("abort", listener);
        }
      }
    }
  };
  if (onEnd == null) {
    return pushable2;
  }
  const _pushable2 = pushable2;
  pushable2 = {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return _pushable2.next();
    },
    throw(err) {
      _pushable2.throw(err);
      if (onEnd != null) {
        onEnd(err);
        onEnd = void 0;
      }
      return { done: true };
    },
    return() {
      _pushable2.return();
      if (onEnd != null) {
        onEnd();
        onEnd = void 0;
      }
      return { done: true };
    },
    push,
    end(err) {
      _pushable2.end(err);
      if (onEnd != null) {
        onEnd(err);
        onEnd = void 0;
      }
      return pushable2;
    },
    get readableLength() {
      return _pushable2.readableLength;
    },
    onEmpty: (opts) => {
      return _pushable2.onEmpty(opts);
    }
  };
  return pushable2;
}

// ../../node_modules/it-merge/dist/src/index.js
function isAsyncIterable6(thing) {
  return thing[Symbol.asyncIterator] != null;
}
function merge(...sources) {
  const syncSources = [];
  for (const source of sources) {
    if (!isAsyncIterable6(source)) {
      syncSources.push(source);
    }
  }
  if (syncSources.length === sources.length) {
    return function* () {
      for (const source of syncSources) {
        yield* source;
      }
    }();
  }
  return async function* () {
    const output2 = pushable({
      objectMode: true
    });
    void Promise.resolve().then(async () => {
      try {
        await Promise.all(sources.map(async (source) => {
          for await (const item of source) {
            output2.push(item);
          }
        }));
        output2.end();
      } catch (err) {
        output2.end(err);
      }
    });
    yield* output2;
  }();
}
var src_default7 = merge;

// ../../node_modules/libp2p/dist/src/content-routing.js
var CompoundContentRouting = class {
  routers;
  started;
  components;
  constructor(components, init) {
    this.routers = init.routers ?? [];
    this.started = false;
    this.components = components;
    this.findProviders = components.metrics?.traceFunction("libp2p.contentRouting.findProviders", this.findProviders.bind(this), {
      optionsIndex: 1,
      getAttributesFromArgs: ([cid], attrs) => {
        return {
          ...attrs,
          cid: cid.toString()
        };
      },
      getAttributesFromYieldedValue: (value, attrs) => {
        return {
          ...attrs,
          providers: [...Array.isArray(attrs.providers) ? attrs.providers : [], value.id.toString()]
        };
      }
    }) ?? this.findProviders;
    this.provide = components.metrics?.traceFunction("libp2p.contentRouting.provide", this.provide.bind(this), {
      optionsIndex: 1,
      getAttributesFromArgs: ([cid], attrs) => {
        return {
          ...attrs,
          cid: cid.toString()
        };
      }
    }) ?? this.provide;
    this.cancelReprovide = components.metrics?.traceFunction("libp2p.contentRouting.cancelReprovide", this.cancelReprovide.bind(this), {
      optionsIndex: 1,
      getAttributesFromArgs: ([cid], attrs) => {
        return {
          ...attrs,
          cid: cid.toString()
        };
      }
    }) ?? this.cancelReprovide;
    this.put = components.metrics?.traceFunction("libp2p.contentRouting.put", this.put.bind(this), {
      optionsIndex: 2,
      getAttributesFromArgs: ([key]) => {
        return {
          key: toString2(key, "base36")
        };
      }
    }) ?? this.put;
    this.get = components.metrics?.traceFunction("libp2p.contentRouting.get", this.get.bind(this), {
      optionsIndex: 1,
      getAttributesFromArgs: ([key]) => {
        return {
          key: toString2(key, "base36")
        };
      }
    }) ?? this.get;
  }
  [Symbol.toStringTag] = "@libp2p/content-routing";
  isStarted() {
    return this.started;
  }
  async start() {
    this.started = true;
  }
  async stop() {
    this.started = false;
  }
  /**
   * Iterates over all content routers in parallel to find providers of the given key
   */
  async *findProviders(key, options = {}) {
    if (this.routers.length === 0) {
      throw new NoContentRoutersError("No content routers available");
    }
    const self2 = this;
    const seen = new PeerSet();
    for await (const peer of src_default7(...self2.routers.map((router) => router.findProviders(key, options)))) {
      if (peer == null) {
        continue;
      }
      if (peer.multiaddrs.length > 0) {
        await this.components.peerStore.merge(peer.id, {
          multiaddrs: peer.multiaddrs
        });
      }
      if (seen.has(peer.id)) {
        continue;
      }
      seen.add(peer.id);
      yield peer;
    }
  }
  /**
   * Iterates over all content routers in parallel to notify it is
   * a provider of the given key
   */
  async provide(key, options = {}) {
    if (this.routers.length === 0) {
      throw new NoContentRoutersError("No content routers available");
    }
    await Promise.all(this.routers.map(async (router) => {
      await router.provide(key, options);
    }));
  }
  async cancelReprovide(key, options = {}) {
    if (this.routers.length === 0) {
      throw new NoContentRoutersError("No content routers available");
    }
    await Promise.all(this.routers.map(async (router) => {
      await router.cancelReprovide(key, options);
    }));
  }
  /**
   * Store the given key/value pair in the available content routings
   */
  async put(key, value, options) {
    if (!this.isStarted()) {
      throw new NotStartedError2();
    }
    await Promise.all(this.routers.map(async (router) => {
      await router.put(key, value, options);
    }));
  }
  /**
   * Get the value to the given key.
   * Times out after 1 minute by default.
   */
  async get(key, options) {
    if (!this.isStarted()) {
      throw new NotStartedError2();
    }
    return Promise.any(this.routers.map(async (router) => {
      return router.get(key, options);
    }));
  }
};

// ../../node_modules/libp2p/dist/src/peer-routing.js
import { NotFoundError as NotFoundError2 } from "@libp2p/interface";
import { createScalableCuckooFilter as createScalableCuckooFilter2 } from "@libp2p/utils/filters";

// ../../node_modules/it-parallel/dist/src/index.js
var CustomEvent2 = globalThis.CustomEvent ?? Event;
async function* parallel(source, options = {}) {
  let concurrency = options.concurrency ?? Infinity;
  if (concurrency < 1) {
    concurrency = Infinity;
  }
  const ordered = options.ordered == null ? false : options.ordered;
  const emitter = new EventTarget();
  const ops = [];
  let slotAvailable = pDefer();
  let resultAvailable = pDefer();
  let sourceFinished = false;
  let sourceErr;
  let opErred = false;
  emitter.addEventListener("task-complete", () => {
    resultAvailable.resolve();
  });
  void Promise.resolve().then(async () => {
    try {
      for await (const task of source) {
        if (ops.length === concurrency) {
          slotAvailable = pDefer();
          await slotAvailable.promise;
        }
        if (opErred) {
          break;
        }
        const op = {
          done: false
        };
        ops.push(op);
        task().then((result) => {
          op.done = true;
          op.ok = true;
          op.value = result;
          emitter.dispatchEvent(new CustomEvent2("task-complete"));
        }, (err) => {
          op.done = true;
          op.err = err;
          emitter.dispatchEvent(new CustomEvent2("task-complete"));
        });
      }
      sourceFinished = true;
      emitter.dispatchEvent(new CustomEvent2("task-complete"));
    } catch (err) {
      sourceErr = err;
      emitter.dispatchEvent(new CustomEvent2("task-complete"));
    }
  });
  function valuesAvailable() {
    if (ordered) {
      return ops[0]?.done;
    }
    return Boolean(ops.find((op) => op.done));
  }
  function* yieldOrderedValues() {
    while (ops.length > 0 && ops[0].done) {
      const op = ops[0];
      ops.shift();
      if (op.ok) {
        yield op.value;
      } else {
        opErred = true;
        slotAvailable.resolve();
        throw op.err;
      }
      slotAvailable.resolve();
    }
  }
  function* yieldUnOrderedValues() {
    while (valuesAvailable()) {
      for (let i = 0; i < ops.length; i++) {
        if (ops[i].done) {
          const op = ops[i];
          ops.splice(i, 1);
          i--;
          if (op.ok) {
            yield op.value;
          } else {
            opErred = true;
            slotAvailable.resolve();
            throw op.err;
          }
          slotAvailable.resolve();
        }
      }
    }
  }
  while (true) {
    if (!valuesAvailable()) {
      resultAvailable = pDefer();
      await resultAvailable.promise;
    }
    if (sourceErr != null) {
      throw sourceErr;
    }
    if (ordered) {
      yield* yieldOrderedValues();
    } else {
      yield* yieldUnOrderedValues();
    }
    if (sourceFinished && ops.length === 0) {
      break;
    }
  }
}

// ../../node_modules/libp2p/dist/src/peer-routing.js
var DefaultPeerRouting = class {
  log;
  peerId;
  peerStore;
  routers;
  constructor(components, init = {}) {
    this.log = components.logger.forComponent("libp2p:peer-routing");
    this.peerId = components.peerId;
    this.peerStore = components.peerStore;
    this.routers = init.routers ?? [];
    this.findPeer = components.metrics?.traceFunction("libp2p.peerRouting.findPeer", this.findPeer.bind(this), {
      optionsIndex: 1,
      getAttributesFromArgs: ([peer], attrs) => {
        return {
          ...attrs,
          peer: peer.toString()
        };
      }
    }) ?? this.findPeer;
    this.getClosestPeers = components.metrics?.traceFunction("libp2p.peerRouting.getClosestPeers", this.getClosestPeers.bind(this), {
      optionsIndex: 1,
      getAttributesFromArgs: ([key], attrs) => {
        return {
          ...attrs,
          key: toString2(key, "base36")
        };
      },
      getAttributesFromYieldedValue: (value, attrs) => {
        return {
          ...attrs,
          peers: [...Array.isArray(attrs.peers) ? attrs.peers : [], value.id.toString()]
        };
      }
    }) ?? this.getClosestPeers;
  }
  [Symbol.toStringTag] = "@libp2p/peer-routing";
  /**
   * Iterates over all peer routers in parallel to find the given peer
   */
  async findPeer(id, options) {
    if (this.routers.length === 0) {
      throw new NoPeerRoutersError("No peer routers available");
    }
    if (id.toString() === this.peerId.toString()) {
      throw new QueriedForSelfError("Should not try to find self");
    }
    const self2 = this;
    const source = src_default7(...this.routers.map((router) => async function* () {
      try {
        yield await router.findPeer(id, options);
      } catch (err) {
        self2.log.error(err);
      }
    }()));
    for await (const peer of source) {
      if (peer == null) {
        continue;
      }
      if (peer.multiaddrs.length > 0) {
        await this.peerStore.merge(peer.id, {
          multiaddrs: peer.multiaddrs
        });
      }
      return peer;
    }
    throw new NotFoundError2();
  }
  /**
   * Attempt to find the closest peers on the network to the given key
   */
  async *getClosestPeers(key, options = {}) {
    if (this.routers.length === 0) {
      throw new NoPeerRoutersError("No peer routers available");
    }
    const self2 = this;
    const seen = createScalableCuckooFilter2(1024);
    for await (const peer of parallel(async function* () {
      const source = src_default7(...self2.routers.map((router) => router.getClosestPeers(key, options)));
      for await (let peer2 of source) {
        yield async () => {
          if (peer2.multiaddrs.length === 0) {
            try {
              peer2 = await self2.findPeer(peer2.id, {
                ...options,
                useCache: false
              });
            } catch (err) {
              self2.log.error("could not find peer multiaddrs", err);
              return;
            }
          }
          return peer2;
        };
      }
    }())) {
      if (peer == null) {
        continue;
      }
      if (peer.multiaddrs.length > 0) {
        await this.peerStore.merge(peer.id, {
          multiaddrs: peer.multiaddrs
        });
      }
      if (seen.has(peer.id.toMultihash().bytes)) {
        continue;
      }
      seen.add(peer.id.toMultihash().bytes);
      yield peer;
    }
  }
};

// ../../node_modules/libp2p/dist/src/random-walk.js
import { randomBytes as randomBytes2 } from "@libp2p/crypto";
import { TypedEventEmitter, setMaxListeners as setMaxListeners3 } from "@libp2p/interface";

// ../../node_modules/race-event/dist/src/index.js
var AbortError6 = class extends Error {
  type;
  code;
  constructor(message2, code2) {
    super(message2 ?? "The operation was aborted");
    this.type = "aborted";
    this.name = "AbortError";
    this.code = code2 ?? "ABORT_ERR";
  }
};
async function raceEvent(emitter, eventName, signal, opts) {
  const error = new AbortError6(opts?.errorMessage, opts?.errorCode);
  if (signal?.aborted === true) {
    return Promise.reject(error);
  }
  return new Promise((resolve, reject) => {
    function removeListeners() {
      signal?.removeEventListener("abort", abortListener);
      emitter.removeEventListener(eventName, eventListener);
      if (opts?.errorEvent != null) {
        emitter.removeEventListener(opts.errorEvent, errorEventListener);
      }
    }
    const eventListener = (evt) => {
      try {
        if (opts?.filter?.(evt) === false) {
          return;
        }
      } catch (err) {
        removeListeners();
        reject(err);
        return;
      }
      removeListeners();
      resolve(evt);
    };
    const errorEventListener = (evt) => {
      removeListeners();
      reject(evt.detail);
    };
    const abortListener = () => {
      removeListeners();
      reject(error);
    };
    signal?.addEventListener("abort", abortListener);
    emitter.addEventListener(eventName, eventListener);
    if (opts?.errorEvent != null) {
      emitter.addEventListener(opts.errorEvent, errorEventListener);
    }
  });
}

// ../../node_modules/libp2p/dist/src/random-walk.js
var RandomWalk = class extends TypedEventEmitter {
  peerRouting;
  log;
  walking;
  walkers;
  shutdownController;
  walkController;
  needNext;
  constructor(components) {
    super();
    this.log = components.logger.forComponent("libp2p:random-walk");
    this.peerRouting = components.peerRouting;
    this.walkers = 0;
    this.walking = false;
    this.shutdownController = new AbortController();
    setMaxListeners3(Infinity, this.shutdownController.signal);
  }
  [Symbol.toStringTag] = "@libp2p/random-walk";
  start() {
    this.shutdownController = new AbortController();
    setMaxListeners3(Infinity, this.shutdownController.signal);
  }
  stop() {
    this.shutdownController.abort();
  }
  async *walk(options) {
    if (!this.walking) {
      this.startWalk();
    }
    this.walkers++;
    const signal = anySignal([this.shutdownController.signal, options?.signal]);
    setMaxListeners3(Infinity, signal);
    try {
      while (true) {
        this.needNext?.resolve();
        this.needNext = pDefer();
        const event = await raceEvent(this, "walk:peer", signal, {
          errorEvent: "walk:error"
        });
        yield event.detail;
      }
    } finally {
      signal.clear();
      this.walkers--;
      if (this.walkers === 0) {
        this.walkController?.abort();
        this.walkController = void 0;
      }
    }
  }
  startWalk() {
    this.walking = true;
    this.walkController = new AbortController();
    setMaxListeners3(Infinity, this.walkController.signal);
    const signal = anySignal([this.walkController.signal, this.shutdownController.signal]);
    setMaxListeners3(Infinity, signal);
    const start2 = Date.now();
    let found = 0;
    Promise.resolve().then(async () => {
      this.log("start walk");
      while (this.walkers > 0) {
        try {
          const data = randomBytes2(32);
          let s = Date.now();
          for await (const peer of this.peerRouting.getClosestPeers(data, { signal })) {
            if (signal.aborted) {
              this.log("aborting walk");
            }
            signal.throwIfAborted();
            this.log("found peer %p after %dms for %d walkers", peer.id, Date.now() - s, this.walkers);
            found++;
            this.safeDispatchEvent("walk:peer", {
              detail: peer
            });
            if (this.walkers === 1 && this.needNext != null) {
              this.log("wait for need next");
              await raceSignal(this.needNext.promise, signal);
            }
            s = Date.now();
          }
          this.log("walk iteration for %b and %d walkers finished, found %d peers", data, this.walkers, found);
        } catch (err) {
          this.log.error("randomwalk errored", err);
          this.safeDispatchEvent("walk:error", {
            detail: err
          });
        }
      }
      this.log("no walkers left, ended walk");
    }).catch((err) => {
      this.log.error("randomwalk errored", err);
    }).finally(() => {
      this.log("finished walk, found %d peers after %dms", found, Date.now() - start2);
      this.walking = false;
    });
  }
};

// ../../node_modules/libp2p/dist/src/registrar.js
import { InvalidParametersError as InvalidParametersError4 } from "@libp2p/interface";
var DEFAULT_MAX_INBOUND_STREAMS = 32;
var DEFAULT_MAX_OUTBOUND_STREAMS = 64;
var DefaultRegistrar = class {
  log;
  topologies;
  handlers;
  components;
  constructor(components) {
    this.log = components.logger.forComponent("libp2p:registrar");
    this.topologies = /* @__PURE__ */ new Map();
    this.handlers = /* @__PURE__ */ new Map();
    this.components = components;
    this._onDisconnect = this._onDisconnect.bind(this);
    this._onPeerUpdate = this._onPeerUpdate.bind(this);
    this._onPeerIdentify = this._onPeerIdentify.bind(this);
    this.components.events.addEventListener("peer:disconnect", this._onDisconnect);
    this.components.events.addEventListener("peer:update", this._onPeerUpdate);
    this.components.events.addEventListener("peer:identify", this._onPeerIdentify);
  }
  [Symbol.toStringTag] = "@libp2p/registrar";
  getProtocols() {
    return Array.from(/* @__PURE__ */ new Set([
      ...this.handlers.keys()
    ])).sort();
  }
  getHandler(protocol) {
    const handler = this.handlers.get(protocol);
    if (handler == null) {
      throw new UnhandledProtocolError(`No handler registered for protocol ${protocol}`);
    }
    return handler;
  }
  getTopologies(protocol) {
    const topologies = this.topologies.get(protocol);
    if (topologies == null) {
      return [];
    }
    return [
      ...topologies.values()
    ];
  }
  /**
   * Registers the `handler` for each protocol
   */
  async handle(protocol, handler, opts) {
    if (this.handlers.has(protocol)) {
      throw new DuplicateProtocolHandlerError(`Handler already registered for protocol ${protocol}`);
    }
    const options = merge_options_default.bind({ ignoreUndefined: true })({
      maxInboundStreams: DEFAULT_MAX_INBOUND_STREAMS,
      maxOutboundStreams: DEFAULT_MAX_OUTBOUND_STREAMS
    }, opts);
    this.handlers.set(protocol, {
      handler,
      options
    });
    await this.components.peerStore.merge(this.components.peerId, {
      protocols: [protocol]
    });
  }
  /**
   * Removes the handler for each protocol. The protocol
   * will no longer be supported on streams.
   */
  async unhandle(protocols) {
    const protocolList = Array.isArray(protocols) ? protocols : [protocols];
    protocolList.forEach((protocol) => {
      this.handlers.delete(protocol);
    });
    await this.components.peerStore.patch(this.components.peerId, {
      protocols: this.getProtocols()
    });
  }
  /**
   * Register handlers for a set of multicodecs given
   */
  async register(protocol, topology) {
    if (topology == null) {
      throw new InvalidParametersError4("invalid topology");
    }
    const id = `${(Math.random() * 1e9).toString(36)}${Date.now()}`;
    let topologies = this.topologies.get(protocol);
    if (topologies == null) {
      topologies = /* @__PURE__ */ new Map();
      this.topologies.set(protocol, topologies);
    }
    topologies.set(id, topology);
    return id;
  }
  /**
   * Unregister topology
   */
  unregister(id) {
    for (const [protocol, topologies] of this.topologies.entries()) {
      if (topologies.has(id)) {
        topologies.delete(id);
        if (topologies.size === 0) {
          this.topologies.delete(protocol);
        }
      }
    }
  }
  /**
   * Remove a disconnected peer from the record
   */
  _onDisconnect(evt) {
    const remotePeer = evt.detail;
    void this.components.peerStore.get(remotePeer).then((peer) => {
      for (const protocol of peer.protocols) {
        const topologies = this.topologies.get(protocol);
        if (topologies == null) {
          continue;
        }
        for (const topology of topologies.values()) {
          if (topology.filter?.has(remotePeer) === false) {
            continue;
          }
          topology.filter?.remove(remotePeer);
          topology.onDisconnect?.(remotePeer);
        }
      }
    }).catch((err) => {
      if (err.name === "NotFoundError") {
        return;
      }
      this.log.error("could not inform topologies of disconnecting peer %p", remotePeer, err);
    });
  }
  /**
   * When a peer is updated, if they have removed supported protocols notify any
   * topologies interested in the removed protocols.
   */
  _onPeerUpdate(evt) {
    const { peer, previous } = evt.detail;
    const removed = (previous?.protocols ?? []).filter((protocol) => !peer.protocols.includes(protocol));
    for (const protocol of removed) {
      const topologies = this.topologies.get(protocol);
      if (topologies == null) {
        continue;
      }
      for (const topology of topologies.values()) {
        if (topology.filter?.has(peer.id) === false) {
          continue;
        }
        topology.filter?.remove(peer.id);
        topology.onDisconnect?.(peer.id);
      }
    }
  }
  /**
   * After identify has completed and we have received the list of supported
   * protocols, notify any topologies interested in those protocols.
   */
  _onPeerIdentify(evt) {
    const protocols = evt.detail.protocols;
    const connection = evt.detail.connection;
    const peerId2 = evt.detail.peerId;
    for (const protocol of protocols) {
      const topologies = this.topologies.get(protocol);
      if (topologies == null) {
        continue;
      }
      for (const topology of topologies.values()) {
        if (connection.limits != null && topology.notifyOnLimitedConnection !== true) {
          continue;
        }
        if (topology.filter?.has(peerId2) === true) {
          continue;
        }
        topology.filter?.add(peerId2);
        topology.onConnect?.(peerId2, connection);
      }
    }
  }
};

// ../../node_modules/libp2p/dist/src/transport-manager.js
import { FaultTolerance as FaultTolerance2, InvalidParametersError as InvalidParametersError5, NotStartedError as NotStartedError3 } from "@libp2p/interface";
import { trackedMap } from "@libp2p/utils/tracked-map";
var DefaultTransportManager = class {
  log;
  components;
  transports;
  listeners;
  faultTolerance;
  started;
  constructor(components, init = {}) {
    this.log = components.logger.forComponent("libp2p:transports");
    this.components = components;
    this.started = false;
    this.transports = /* @__PURE__ */ new Map();
    this.listeners = trackedMap({
      name: "libp2p_transport_manager_listeners",
      metrics: this.components.metrics
    });
    this.faultTolerance = init.faultTolerance ?? FaultTolerance2.FATAL_ALL;
  }
  [Symbol.toStringTag] = "@libp2p/transport-manager";
  /**
   * Adds a `Transport` to the manager
   */
  add(transport) {
    const tag = transport[Symbol.toStringTag];
    if (tag == null) {
      throw new InvalidParametersError5("Transport must have a valid tag");
    }
    if (this.transports.has(tag)) {
      throw new InvalidParametersError5(`There is already a transport with the tag ${tag}`);
    }
    this.log("adding transport %s", tag);
    this.transports.set(tag, transport);
    if (!this.listeners.has(tag)) {
      this.listeners.set(tag, []);
    }
  }
  isStarted() {
    return this.started;
  }
  start() {
    this.started = true;
  }
  async afterStart() {
    const addrs = this.components.addressManager.getListenAddrs();
    await this.listen(addrs);
  }
  /**
   * Stops all listeners
   */
  async stop() {
    const tasks = [];
    for (const [key, listeners] of this.listeners) {
      this.log("closing listeners for %s", key);
      while (listeners.length > 0) {
        const listener = listeners.pop();
        if (listener == null) {
          continue;
        }
        tasks.push(listener.close());
      }
    }
    await Promise.all(tasks);
    this.log("all listeners closed");
    for (const key of this.listeners.keys()) {
      this.listeners.set(key, []);
    }
    this.started = false;
  }
  /**
   * Dials the given Multiaddr over it's supported transport
   */
  async dial(ma, options) {
    const transport = this.dialTransportForMultiaddr(ma);
    if (transport == null) {
      throw new TransportUnavailableError(`No transport available for address ${String(ma)}`);
    }
    options?.onProgress?.(new CustomProgressEvent("transport-manager:selected-transport", transport[Symbol.toStringTag]));
    return transport.dial(ma, {
      ...options,
      upgrader: this.components.upgrader
    });
  }
  /**
   * Returns all Multiaddr's the listeners are using
   */
  getAddrs() {
    let addrs = [];
    for (const listeners of this.listeners.values()) {
      for (const listener of listeners) {
        addrs = [...addrs, ...listener.getAddrs()];
      }
    }
    return addrs;
  }
  /**
   * Returns all the transports instances
   */
  getTransports() {
    return Array.of(...this.transports.values());
  }
  /**
   * Returns all the listener instances
   */
  getListeners() {
    return Array.of(...this.listeners.values()).flat();
  }
  /**
   * Finds a transport that matches the given Multiaddr
   */
  dialTransportForMultiaddr(ma) {
    for (const transport of this.transports.values()) {
      const addrs = transport.dialFilter([ma]);
      if (addrs.length > 0) {
        return transport;
      }
    }
  }
  /**
   * Finds a transport that matches the given Multiaddr
   */
  listenTransportForMultiaddr(ma) {
    for (const transport of this.transports.values()) {
      const addrs = transport.listenFilter([ma]);
      if (addrs.length > 0) {
        return transport;
      }
    }
  }
  /**
   * Starts listeners for each listen Multiaddr
   */
  async listen(addrs) {
    if (!this.isStarted()) {
      throw new NotStartedError3("Not started");
    }
    if (addrs == null || addrs.length === 0) {
      this.log("no addresses were provided for listening, this node is dial only");
      return;
    }
    const couldNotListen = [];
    for (const [key, transport] of this.transports.entries()) {
      const supportedAddrs = transport.listenFilter(addrs);
      const tasks = [];
      for (const addr of supportedAddrs) {
        this.log("creating listener for %s on %a", key, addr);
        const listener = transport.createListener({
          upgrader: this.components.upgrader
        });
        let listeners = this.listeners.get(key) ?? [];
        if (listeners == null) {
          listeners = [];
          this.listeners.set(key, listeners);
        }
        listeners.push(listener);
        listener.addEventListener("listening", () => {
          this.components.events.safeDispatchEvent("transport:listening", {
            detail: listener
          });
        });
        listener.addEventListener("close", () => {
          const index = listeners.findIndex((l) => l === listener);
          listeners.splice(index, 1);
          this.components.events.safeDispatchEvent("transport:close", {
            detail: listener
          });
        });
        tasks.push(listener.listen(addr));
      }
      if (tasks.length === 0) {
        couldNotListen.push(key);
        continue;
      }
      const results = await Promise.allSettled(tasks);
      const isListening = results.find((r) => r.status === "fulfilled");
      if (isListening == null && this.faultTolerance !== FaultTolerance2.NO_FATAL) {
        throw new NoValidAddressesError(`Transport (${key}) could not listen on any available address`);
      }
    }
    if (couldNotListen.length === this.transports.size) {
      const message2 = `no valid addresses were provided for transports [${couldNotListen.join(", ")}]`;
      if (this.faultTolerance === FaultTolerance2.FATAL_ALL) {
        throw new NoValidAddressesError(message2);
      }
      this.log(`libp2p in dial mode only: ${message2}`);
    }
  }
  /**
   * Removes the given transport from the manager.
   * If a transport has any running listeners, they will be closed.
   */
  async remove(key) {
    const listeners = this.listeners.get(key) ?? [];
    this.log.trace("removing transport %s", key);
    const tasks = [];
    this.log.trace("closing listeners for %s", key);
    while (listeners.length > 0) {
      const listener = listeners.pop();
      if (listener == null) {
        continue;
      }
      tasks.push(listener.close());
    }
    await Promise.all(tasks);
    this.transports.delete(key);
    this.listeners.delete(key);
  }
  /**
   * Removes all transports from the manager.
   * If any listeners are running, they will be closed.
   *
   * @async
   */
  async removeAll() {
    const tasks = [];
    for (const key of this.transports.keys()) {
      tasks.push(this.remove(key));
    }
    await Promise.all(tasks);
  }
};

// ../../node_modules/libp2p/dist/src/upgrader.js
import { InvalidMultiaddrError as InvalidMultiaddrError3, TooManyInboundProtocolStreamsError, TooManyOutboundProtocolStreamsError, LimitedConnectionError as LimitedConnectionError2, setMaxListeners as setMaxListeners5, InvalidPeerIdError as InvalidPeerIdError2 } from "@libp2p/interface";
import * as mss from "@libp2p/multistream-select";
import { peerIdFromString as peerIdFromString3 } from "@libp2p/peer-id";

// ../../node_modules/libp2p/dist/src/connection/index.js
import { connectionSymbol, setMaxListeners as setMaxListeners4, LimitedConnectionError, ConnectionClosedError as ConnectionClosedError2, ConnectionClosingError } from "@libp2p/interface";
var CLOSE_TIMEOUT = 500;
var ConnectionImpl = class {
  /**
   * Connection identifier.
   */
  id;
  /**
   * Observed multiaddr of the remote peer
   */
  remoteAddr;
  /**
   * Remote peer id
   */
  remotePeer;
  direction;
  timeline;
  multiplexer;
  encryption;
  status;
  limits;
  log;
  /**
   * User provided tags
   *
   */
  tags;
  /**
   * Reference to the new stream function of the multiplexer
   */
  _newStream;
  /**
   * Reference to the close function of the raw connection
   */
  _close;
  _abort;
  /**
   * Reference to the getStreams function of the muxer
   */
  _getStreams;
  /**
   * An implementation of the js-libp2p connection.
   * Any libp2p transport should use an upgrader to return this connection.
   */
  constructor(init) {
    const { remoteAddr, remotePeer, newStream, close, abort, getStreams } = init;
    this.id = `${parseInt(String(Math.random() * 1e9)).toString(36)}${Date.now()}`;
    this.remoteAddr = remoteAddr;
    this.remotePeer = remotePeer;
    this.direction = init.direction;
    this.status = "open";
    this.timeline = init.timeline;
    this.multiplexer = init.multiplexer;
    this.encryption = init.encryption;
    this.limits = init.limits;
    this.log = init.logger.forComponent(`libp2p:connection:${this.direction}:${this.id}`);
    if (this.remoteAddr.getPeerId() == null) {
      this.remoteAddr = this.remoteAddr.encapsulate(`/p2p/${this.remotePeer}`);
    }
    this._newStream = newStream;
    this._close = close;
    this._abort = abort;
    this._getStreams = getStreams;
    this.tags = [];
  }
  [Symbol.toStringTag] = "Connection";
  [connectionSymbol] = true;
  /**
   * Get all the streams of the muxer
   */
  get streams() {
    return this._getStreams();
  }
  /**
   * Create a new stream from this connection
   */
  async newStream(protocols, options) {
    if (this.status === "closing") {
      throw new ConnectionClosingError("the connection is being closed");
    }
    if (this.status === "closed") {
      throw new ConnectionClosedError2("the connection is closed");
    }
    if (!Array.isArray(protocols)) {
      protocols = [protocols];
    }
    if (this.limits != null && options?.runOnLimitedConnection !== true) {
      throw new LimitedConnectionError("Cannot open protocol stream on limited connection");
    }
    const stream = await this._newStream(protocols, options);
    stream.direction = "outbound";
    return stream;
  }
  /**
   * Close the connection
   */
  async close(options = {}) {
    if (this.status === "closed" || this.status === "closing") {
      return;
    }
    this.log("closing connection to %a", this.remoteAddr);
    this.status = "closing";
    if (options.signal == null) {
      const signal = AbortSignal.timeout(CLOSE_TIMEOUT);
      setMaxListeners4(Infinity, signal);
      options = {
        ...options,
        signal
      };
    }
    try {
      this.log.trace("closing underlying transport");
      await this._close(options);
      this.log.trace("updating timeline with close time");
      this.status = "closed";
      this.timeline.close = Date.now();
    } catch (err) {
      this.log.error("error encountered during graceful close of connection to %a", this.remoteAddr, err);
      this.abort(err);
    }
  }
  abort(err) {
    if (this.status === "closed") {
      return;
    }
    this.log.error("aborting connection to %a due to error", this.remoteAddr, err);
    this.status = "closing";
    this._abort(err);
    this.status = "closed";
    this.timeline.close = Date.now();
  }
};
function createConnection(init) {
  return new ConnectionImpl(init);
}

// ../../node_modules/libp2p/dist/src/upgrader.js
function findIncomingStreamLimit(protocol, registrar) {
  try {
    const { options } = registrar.getHandler(protocol);
    return options.maxInboundStreams;
  } catch (err) {
    if (err.name !== "UnhandledProtocolError") {
      throw err;
    }
  }
  return DEFAULT_MAX_INBOUND_STREAMS;
}
function findOutgoingStreamLimit(protocol, registrar, options = {}) {
  try {
    const { options: options2 } = registrar.getHandler(protocol);
    if (options2.maxOutboundStreams != null) {
      return options2.maxOutboundStreams;
    }
  } catch (err) {
    if (err.name !== "UnhandledProtocolError") {
      throw err;
    }
  }
  return options.maxOutboundStreams ?? DEFAULT_MAX_OUTBOUND_STREAMS;
}
function countStreams(protocol, direction, connection) {
  let streamCount = 0;
  connection.streams.forEach((stream) => {
    if (stream.direction === direction && stream.protocol === protocol) {
      streamCount++;
    }
  });
  return streamCount;
}
var DefaultUpgrader = class {
  components;
  connectionEncrypters;
  streamMuxers;
  inboundUpgradeTimeout;
  outboundUpgradeTimeout;
  inboundStreamProtocolNegotiationTimeout;
  outboundStreamProtocolNegotiationTimeout;
  events;
  metrics;
  constructor(components, init) {
    this.components = components;
    this.connectionEncrypters = /* @__PURE__ */ new Map();
    init.connectionEncrypters.forEach((encrypter) => {
      this.connectionEncrypters.set(encrypter.protocol, encrypter);
    });
    this.streamMuxers = /* @__PURE__ */ new Map();
    init.streamMuxers.forEach((muxer) => {
      this.streamMuxers.set(muxer.protocol, muxer);
    });
    this.inboundUpgradeTimeout = init.inboundUpgradeTimeout ?? UPGRADE_TIMEOUT;
    this.outboundUpgradeTimeout = init.outboundUpgradeTimeout ?? UPGRADE_TIMEOUT;
    this.inboundStreamProtocolNegotiationTimeout = init.inboundStreamProtocolNegotiationTimeout ?? PROTOCOL_NEGOTIATION_TIMEOUT;
    this.outboundStreamProtocolNegotiationTimeout = init.outboundStreamProtocolNegotiationTimeout ?? PROTOCOL_NEGOTIATION_TIMEOUT;
    this.events = components.events;
    this.metrics = {
      dials: components.metrics?.registerCounterGroup("libp2p_connection_manager_dials_total"),
      errors: components.metrics?.registerCounterGroup("libp2p_connection_manager_dial_errors_total")
    };
  }
  [Symbol.toStringTag] = "@libp2p/upgrader";
  async shouldBlockConnection(method, ...args) {
    const denyOperation = this.components.connectionGater[method];
    if (denyOperation == null) {
      return;
    }
    const result = await denyOperation.apply(this.components.connectionGater, args);
    if (result === true) {
      throw new ConnectionInterceptedError(`The multiaddr connection is blocked by gater.${method}`);
    }
  }
  /**
   * Upgrades an inbound connection
   */
  async upgradeInbound(maConn, opts = {}) {
    let accepted = false;
    try {
      this.metrics.dials?.increment({
        inbound: true
      });
      accepted = await this.components.connectionManager.acceptIncomingConnection(maConn);
      if (!accepted) {
        throw new ConnectionDeniedError("Connection denied");
      }
      await this.shouldBlockConnection("denyInboundConnection", maConn);
      await this._performUpgrade(maConn, "inbound", opts);
    } catch (err) {
      this.metrics.errors?.increment({
        inbound: true
      });
      throw err;
    } finally {
      if (accepted) {
        this.components.connectionManager.afterUpgradeInbound();
      }
    }
  }
  /**
   * Upgrades an outbound connection
   */
  async upgradeOutbound(maConn, opts = {}) {
    try {
      this.metrics.dials?.increment({
        outbound: true
      });
      const idStr = maConn.remoteAddr.getPeerId();
      let remotePeerId;
      if (idStr != null) {
        remotePeerId = peerIdFromString3(idStr);
        await this.shouldBlockConnection("denyOutboundConnection", remotePeerId, maConn);
      }
      return await this._performUpgrade(maConn, "outbound", opts);
    } catch (err) {
      this.metrics.errors?.increment({
        outbound: true
      });
      throw err;
    }
  }
  async _performUpgrade(maConn, direction, opts) {
    let encryptedConn;
    let remotePeer;
    let upgradedConn;
    let muxerFactory;
    let cryptoProtocol;
    const upgradeTimeoutSignal = AbortSignal.timeout(direction === "inbound" ? this.inboundUpgradeTimeout : this.outboundUpgradeTimeout);
    const signal = anySignal([upgradeTimeoutSignal, opts.signal]);
    setMaxListeners5(Infinity, upgradeTimeoutSignal, signal);
    opts.signal = signal;
    this.components.metrics?.trackMultiaddrConnection(maConn);
    maConn.log.trace("starting the %s connection upgrade", direction);
    let protectedConn = maConn;
    if (opts?.skipProtection !== true) {
      const protector = this.components.connectionProtector;
      if (protector != null) {
        maConn.log("protecting the %s connection", direction);
        protectedConn = await protector.protect(maConn, opts);
      }
    }
    try {
      encryptedConn = protectedConn;
      if (opts?.skipEncryption !== true) {
        opts?.onProgress?.(new CustomProgressEvent(`upgrader:encrypt-${direction}-connection`));
        ({
          conn: encryptedConn,
          remotePeer,
          protocol: cryptoProtocol
        } = await (direction === "inbound" ? this._encryptInbound(protectedConn, {
          ...opts,
          signal
        }) : this._encryptOutbound(protectedConn, {
          ...opts,
          signal
        })));
        const maConn2 = {
          ...protectedConn,
          ...encryptedConn
        };
        await this.shouldBlockConnection(direction === "inbound" ? "denyInboundEncryptedConnection" : "denyOutboundEncryptedConnection", remotePeer, maConn2);
      } else {
        const idStr = maConn.remoteAddr.getPeerId();
        if (idStr == null) {
          throw new InvalidMultiaddrError3(`${direction} connection that skipped encryption must have a peer id`);
        }
        const remotePeerId = peerIdFromString3(idStr);
        cryptoProtocol = "native";
        remotePeer = remotePeerId;
      }
      if (remotePeer.equals(this.components.peerId)) {
        const err = new InvalidPeerIdError2("Can not dial self");
        maConn.abort(err);
        throw err;
      }
      upgradedConn = encryptedConn;
      if (opts?.muxerFactory != null) {
        muxerFactory = opts.muxerFactory;
      } else if (this.streamMuxers.size > 0) {
        opts?.onProgress?.(new CustomProgressEvent(`upgrader:multiplex-${direction}-connection`));
        const multiplexed = await (direction === "inbound" ? this._multiplexInbound({
          ...protectedConn,
          ...encryptedConn
        }, this.streamMuxers, opts) : this._multiplexOutbound({
          ...protectedConn,
          ...encryptedConn
        }, this.streamMuxers, opts));
        muxerFactory = multiplexed.muxerFactory;
        upgradedConn = multiplexed.stream;
      }
    } catch (err) {
      maConn.log.error("failed to upgrade inbound connection %s %a - %e", direction === "inbound" ? "from" : "to", maConn.remoteAddr, err);
      throw err;
    } finally {
      signal.clear();
    }
    await this.shouldBlockConnection(direction === "inbound" ? "denyInboundUpgradedConnection" : "denyOutboundUpgradedConnection", remotePeer, maConn);
    maConn.log("successfully upgraded %s connection", direction);
    return this._createConnection({
      cryptoProtocol,
      direction,
      maConn,
      upgradedConn,
      muxerFactory,
      remotePeer,
      limits: opts?.limits
    });
  }
  /**
   * A convenience method for generating a new `Connection`
   */
  _createConnection(opts) {
    const { cryptoProtocol, direction, maConn, upgradedConn, remotePeer, muxerFactory, limits } = opts;
    let muxer;
    let newStream;
    let connection;
    if (muxerFactory != null) {
      muxer = muxerFactory.createStreamMuxer({
        direction,
        // Run anytime a remote stream is created
        onIncomingStream: (muxedStream) => {
          if (connection == null) {
            return;
          }
          void Promise.resolve().then(async () => {
            const protocols = this.components.registrar.getProtocols();
            const signal = AbortSignal.timeout(this.inboundStreamProtocolNegotiationTimeout);
            setMaxListeners5(Infinity, signal);
            const { stream, protocol } = await mss.handle(muxedStream, protocols, {
              signal,
              log: muxedStream.log,
              yieldBytes: false
            });
            if (connection == null) {
              return;
            }
            connection.log("incoming stream opened on %s", protocol);
            const incomingLimit = findIncomingStreamLimit(protocol, this.components.registrar);
            const streamCount = countStreams(protocol, "inbound", connection);
            if (streamCount === incomingLimit) {
              const err = new TooManyInboundProtocolStreamsError(`Too many inbound protocol streams for protocol "${protocol}" - limit ${incomingLimit}`);
              muxedStream.abort(err);
              throw err;
            }
            muxedStream.source = stream.source;
            muxedStream.sink = stream.sink;
            muxedStream.protocol = protocol;
            if (stream.closeWrite != null) {
              muxedStream.closeWrite = stream.closeWrite;
            }
            if (stream.closeRead != null) {
              muxedStream.closeRead = stream.closeRead;
            }
            if (stream.close != null) {
              muxedStream.close = stream.close;
            }
            await this.components.peerStore.merge(remotePeer, {
              protocols: [protocol]
            });
            this.components.metrics?.trackProtocolStream(muxedStream, connection);
            this._onStream({ connection, stream: muxedStream, protocol });
          }).catch(async (err) => {
            connection.log.error("error handling incoming stream id %s - %e", muxedStream.id, err);
            if (muxedStream.timeline.close == null) {
              await muxedStream.close();
            }
          });
        }
      });
      newStream = async (protocols, options = {}) => {
        if (muxer == null) {
          throw new MuxerUnavailableError("Connection is not multiplexed");
        }
        connection.log.trace("starting new stream for protocols %s", protocols);
        const muxedStream = await muxer.newStream();
        connection.log.trace("started new stream %s for protocols %s", muxedStream.id, protocols);
        try {
          if (options.signal == null) {
            muxedStream.log("no abort signal was passed while trying to negotiate protocols %s falling back to default timeout", protocols);
            const signal = AbortSignal.timeout(this.outboundStreamProtocolNegotiationTimeout);
            setMaxListeners5(Infinity, signal);
            options = {
              ...options,
              signal
            };
          }
          muxedStream.log.trace("selecting protocol from protocols %s", protocols);
          const { stream, protocol } = await mss.select(muxedStream, protocols, {
            ...options,
            log: muxedStream.log,
            yieldBytes: true
          });
          muxedStream.log.trace("selected protocol %s", protocol);
          const outgoingLimit = findOutgoingStreamLimit(protocol, this.components.registrar, options);
          const streamCount = countStreams(protocol, "outbound", connection);
          if (streamCount >= outgoingLimit) {
            const err = new TooManyOutboundProtocolStreamsError(`Too many outbound protocol streams for protocol "${protocol}" - ${streamCount}/${outgoingLimit}`);
            muxedStream.abort(err);
            throw err;
          }
          await this.components.peerStore.merge(remotePeer, {
            protocols: [protocol]
          });
          muxedStream.source = stream.source;
          muxedStream.sink = stream.sink;
          muxedStream.protocol = protocol;
          if (stream.closeWrite != null) {
            muxedStream.closeWrite = stream.closeWrite;
          }
          if (stream.closeRead != null) {
            muxedStream.closeRead = stream.closeRead;
          }
          if (stream.close != null) {
            muxedStream.close = stream.close;
          }
          this.components.metrics?.trackProtocolStream(muxedStream, connection);
          return muxedStream;
        } catch (err) {
          connection.log.error("could not create new outbound stream on connection %s %a for protocols %s - %e", direction === "inbound" ? "from" : "to", opts.maConn.remoteAddr, protocols, err);
          if (muxedStream.timeline.close == null) {
            muxedStream.abort(err);
          }
          throw err;
        }
      };
      void Promise.all([
        muxer.sink(upgradedConn.source),
        upgradedConn.sink(muxer.source)
      ]).catch((err) => {
        connection.log.error("error piping data through muxer - %e", err);
      });
    }
    const _timeline = maConn.timeline;
    maConn.timeline = new Proxy(_timeline, {
      set: (...args) => {
        if (args[1] === "close" && args[2] != null && _timeline.close == null) {
          (async () => {
            try {
              if (connection.status === "open") {
                await connection.close();
              }
            } catch (err) {
              connection.log.error("error closing connection after timeline close %e", err);
            } finally {
              this.events.safeDispatchEvent("connection:close", {
                detail: connection
              });
            }
          })().catch((err) => {
            connection.log.error("error thrown while dispatching connection:close event %e", err);
          });
        }
        return Reflect.set(...args);
      }
    });
    maConn.timeline.upgraded = Date.now();
    const errConnectionNotMultiplexed = () => {
      throw new MuxerUnavailableError("Connection is not multiplexed");
    };
    connection = createConnection({
      remoteAddr: maConn.remoteAddr,
      remotePeer,
      status: "open",
      direction,
      timeline: maConn.timeline,
      multiplexer: muxer?.protocol,
      encryption: cryptoProtocol,
      limits,
      logger: this.components.logger,
      newStream: newStream ?? errConnectionNotMultiplexed,
      getStreams: () => {
        return muxer?.streams ?? [];
      },
      close: async (options) => {
        await muxer?.close(options);
        await maConn.close(options);
      },
      abort: (err) => {
        maConn.abort(err);
        muxer?.abort(err);
      }
    });
    this.events.safeDispatchEvent("connection:open", {
      detail: connection
    });
    connection.__maConnTimeline = _timeline;
    return connection;
  }
  /**
   * Routes incoming streams to the correct handler
   */
  _onStream(opts) {
    const { connection, stream, protocol } = opts;
    const { handler, options } = this.components.registrar.getHandler(protocol);
    if (connection.limits != null && options.runOnLimitedConnection !== true) {
      throw new LimitedConnectionError2("Cannot open protocol stream on limited connection");
    }
    handler({ connection, stream });
  }
  /**
   * Attempts to encrypt the incoming `connection` with the provided `cryptos`
   */
  async _encryptInbound(connection, options) {
    const protocols = Array.from(this.connectionEncrypters.keys());
    try {
      const { stream, protocol } = await mss.handle(connection, protocols, {
        ...options,
        log: connection.log
      });
      const encrypter = this.connectionEncrypters.get(protocol);
      if (encrypter == null) {
        throw new EncryptionFailedError(`no crypto module found for ${protocol}`);
      }
      connection.log("encrypting inbound connection to %a using %s", connection.remoteAddr, protocol);
      return {
        ...await encrypter.secureInbound(stream, options),
        protocol
      };
    } catch (err) {
      connection.log.error("encrypting inbound connection from %a failed", connection.remoteAddr, err);
      throw new EncryptionFailedError(err.message);
    }
  }
  /**
   * Attempts to encrypt the given `connection` with the provided connection encrypters.
   * The first `ConnectionEncrypter` module to succeed will be used
   */
  async _encryptOutbound(connection, options) {
    const protocols = Array.from(this.connectionEncrypters.keys());
    try {
      connection.log.trace("selecting encrypter from %s", protocols);
      const { stream, protocol } = await mss.select(connection, protocols, {
        ...options,
        log: connection.log,
        yieldBytes: true
      });
      const encrypter = this.connectionEncrypters.get(protocol);
      if (encrypter == null) {
        throw new EncryptionFailedError(`no crypto module found for ${protocol}`);
      }
      connection.log("encrypting outbound connection to %a using %s", connection.remoteAddr, protocol);
      return {
        ...await encrypter.secureOutbound(stream, options),
        protocol
      };
    } catch (err) {
      connection.log.error("encrypting outbound connection to %a failed", connection.remoteAddr, err);
      throw new EncryptionFailedError(err.message);
    }
  }
  /**
   * Selects one of the given muxers via multistream-select. That
   * muxer will be used for all future streams on the connection.
   */
  async _multiplexOutbound(connection, muxers, options) {
    const protocols = Array.from(muxers.keys());
    connection.log("outbound selecting muxer %s", protocols);
    try {
      connection.log.trace("selecting stream muxer from %s", protocols);
      const { stream, protocol } = await mss.select(connection, protocols, {
        ...options,
        log: connection.log,
        yieldBytes: true
      });
      connection.log("selected %s as muxer protocol", protocol);
      const muxerFactory = muxers.get(protocol);
      return { stream, muxerFactory };
    } catch (err) {
      connection.log.error("error multiplexing outbound connection", err);
      throw new MuxerUnavailableError(String(err));
    }
  }
  /**
   * Registers support for one of the given muxers via multistream-select. The
   * selected muxer will be used for all future streams on the connection.
   */
  async _multiplexInbound(connection, muxers, options) {
    const protocols = Array.from(muxers.keys());
    connection.log("inbound handling muxers %s", protocols);
    try {
      const { stream, protocol } = await mss.handle(connection, protocols, {
        ...options,
        log: connection.log
      });
      const muxerFactory = muxers.get(protocol);
      return { stream, muxerFactory };
    } catch (err) {
      connection.log.error("error multiplexing inbound connection", err);
      throw new MuxerUnavailableError(String(err));
    }
  }
};

// ../../node_modules/libp2p/dist/src/version.js
var version = "2.5.0";
var name2 = "js-libp2p";

// ../../node_modules/libp2p/dist/src/libp2p.js
var Libp2p = class extends TypedEventEmitter2 {
  peerId;
  peerStore;
  contentRouting;
  peerRouting;
  metrics;
  services;
  logger;
  status;
  components;
  log;
  constructor(init) {
    super();
    this.status = "stopped";
    const events = new TypedEventEmitter2();
    const originalDispatch = events.dispatchEvent.bind(events);
    events.dispatchEvent = (evt) => {
      const internalResult = originalDispatch(evt);
      const externalResult = this.dispatchEvent(new CustomEvent(evt.type, { detail: evt.detail }));
      return internalResult || externalResult;
    };
    setMaxListeners6(Infinity, events);
    this.peerId = init.peerId;
    this.logger = init.logger ?? defaultLogger2();
    this.log = this.logger.forComponent("libp2p");
    this.services = {};
    const components = this.components = defaultComponents({
      peerId: init.peerId,
      privateKey: init.privateKey,
      nodeInfo: init.nodeInfo ?? {
        name: name2,
        version
      },
      logger: this.logger,
      events,
      datastore: init.datastore ?? new MemoryDatastore(),
      connectionGater: connectionGater(init.connectionGater),
      dns: init.dns
    });
    this.peerStore = this.configureComponent("peerStore", persistentPeerStore(components, {
      addressFilter: this.components.connectionGater.filterMultiaddrForPeer,
      ...init.peerStore
    }));
    if (init.metrics != null) {
      this.metrics = this.configureComponent("metrics", init.metrics(this.components));
    }
    components.events.addEventListener("peer:update", (evt) => {
      if (evt.detail.previous == null) {
        const peerInfo = {
          id: evt.detail.peer.id,
          multiaddrs: evt.detail.peer.addresses.map((a) => a.multiaddr)
        };
        components.events.safeDispatchEvent("peer:discovery", { detail: peerInfo });
      }
    });
    if (init.connectionProtector != null) {
      this.configureComponent("connectionProtector", init.connectionProtector(components));
    }
    this.components.upgrader = new DefaultUpgrader(this.components, {
      connectionEncrypters: (init.connectionEncrypters ?? []).map((fn, index) => this.configureComponent(`connection-encryption-${index}`, fn(this.components))),
      streamMuxers: (init.streamMuxers ?? []).map((fn, index) => this.configureComponent(`stream-muxers-${index}`, fn(this.components))),
      inboundUpgradeTimeout: init.connectionManager?.inboundUpgradeTimeout,
      outboundUpgradeTimeout: init.connectionManager?.outboundUpgradeTimeout
    });
    this.configureComponent("transportManager", new DefaultTransportManager(this.components, init.transportManager));
    this.configureComponent("connectionManager", new DefaultConnectionManager(this.components, init.connectionManager));
    if (init.connectionMonitor?.enabled !== false) {
      this.configureComponent("connectionMonitor", new ConnectionMonitor(this.components, init.connectionMonitor));
    }
    this.configureComponent("registrar", new DefaultRegistrar(this.components));
    this.configureComponent("addressManager", new AddressManager(this.components, init.addresses));
    const peerRouters = (init.peerRouters ?? []).map((fn, index) => this.configureComponent(`peer-router-${index}`, fn(this.components)));
    this.peerRouting = this.components.peerRouting = this.configureComponent("peerRouting", new DefaultPeerRouting(this.components, {
      routers: peerRouters
    }));
    const contentRouters = (init.contentRouters ?? []).map((fn, index) => this.configureComponent(`content-router-${index}`, fn(this.components)));
    this.contentRouting = this.components.contentRouting = this.configureComponent("contentRouting", new CompoundContentRouting(this.components, {
      routers: contentRouters
    }));
    this.configureComponent("randomWalk", new RandomWalk(this.components));
    (init.peerDiscovery ?? []).forEach((fn, index) => {
      const service = this.configureComponent(`peer-discovery-${index}`, fn(this.components));
      service.addEventListener("peer", (evt) => {
        this.#onDiscoveryPeer(evt);
      });
    });
    init.transports?.forEach((fn, index) => {
      this.components.transportManager.add(this.configureComponent(`transport-${index}`, fn(this.components)));
    });
    if (init.services != null) {
      for (const name3 of Object.keys(init.services)) {
        const createService = init.services[name3];
        const service = createService(this.components);
        if (service == null) {
          this.log.error("service factory %s returned null or undefined instance", name3);
          continue;
        }
        this.services[name3] = service;
        this.configureComponent(name3, service);
        if (service[contentRoutingSymbol] != null) {
          this.log("registering service %s for content routing", name3);
          contentRouters.push(service[contentRoutingSymbol]);
        }
        if (service[peerRoutingSymbol] != null) {
          this.log("registering service %s for peer routing", name3);
          peerRouters.push(service[peerRoutingSymbol]);
        }
        if (service[peerDiscoverySymbol] != null) {
          this.log("registering service %s for peer discovery", name3);
          service[peerDiscoverySymbol].addEventListener?.("peer", (evt) => {
            this.#onDiscoveryPeer(evt);
          });
        }
      }
    }
    checkServiceDependencies(components);
  }
  configureComponent(name3, component) {
    if (component == null) {
      this.log.error("component %s was null or undefined", name3);
    }
    this.components[name3] = component;
    return component;
  }
  /**
   * Starts the libp2p node and all its subsystems
   */
  async start() {
    if (this.status !== "stopped") {
      return;
    }
    this.status = "starting";
    this.log("libp2p is starting");
    try {
      await this.components.beforeStart?.();
      await this.components.start();
      await this.components.afterStart?.();
      this.status = "started";
      this.safeDispatchEvent("start", { detail: this });
      this.log("libp2p has started");
    } catch (err) {
      this.log.error("An error occurred starting libp2p", err);
      this.status = "started";
      await this.stop();
      throw err;
    }
  }
  /**
   * Stop the libp2p node by closing its listeners and open connections
   */
  async stop() {
    if (this.status !== "started") {
      return;
    }
    this.log("libp2p is stopping");
    this.status = "stopping";
    await this.components.beforeStop?.();
    await this.components.stop();
    await this.components.afterStop?.();
    this.status = "stopped";
    this.safeDispatchEvent("stop", { detail: this });
    this.log("libp2p has stopped");
  }
  getConnections(peerId2) {
    return this.components.connectionManager.getConnections(peerId2);
  }
  getDialQueue() {
    return this.components.connectionManager.getDialQueue();
  }
  getPeers() {
    const peerSet = new PeerSet2();
    for (const conn of this.components.connectionManager.getConnections()) {
      peerSet.add(conn.remotePeer);
    }
    return Array.from(peerSet);
  }
  async dial(peer, options = {}) {
    return this.components.connectionManager.openConnection(peer, {
      // ensure any userland dials take top priority in the queue
      priority: 75,
      ...options
    });
  }
  async dialProtocol(peer, protocols, options = {}) {
    if (protocols == null) {
      throw new InvalidParametersError6("no protocols were provided to open a stream");
    }
    protocols = Array.isArray(protocols) ? protocols : [protocols];
    if (protocols.length === 0) {
      throw new InvalidParametersError6("no protocols were provided to open a stream");
    }
    const connection = await this.dial(peer, options);
    return connection.newStream(protocols, options);
  }
  getMultiaddrs() {
    return this.components.addressManager.getAddresses();
  }
  getProtocols() {
    return this.components.registrar.getProtocols();
  }
  async hangUp(peer, options = {}) {
    if (isMultiaddr(peer)) {
      peer = peerIdFromString4(peer.getPeerId() ?? "");
    }
    await this.components.connectionManager.closeConnections(peer, options);
  }
  async getPublicKey(peer, options = {}) {
    this.log("getPublicKey %p", peer);
    if (peer.publicKey != null) {
      return peer.publicKey;
    }
    try {
      const peerInfo = await this.peerStore.get(peer);
      if (peerInfo.id.publicKey != null) {
        return peerInfo.id.publicKey;
      }
    } catch (err) {
      if (err.name !== "NotFoundError") {
        throw err;
      }
    }
    const peerKey = concat([
      fromString2("/pk/"),
      peer.toMultihash().bytes
    ]);
    const bytes2 = await this.contentRouting.get(peerKey, options);
    const publicKey = publicKeyFromProtobuf(bytes2);
    await this.peerStore.patch(peer, {
      publicKey
    });
    return publicKey;
  }
  async handle(protocols, handler, options) {
    if (!Array.isArray(protocols)) {
      protocols = [protocols];
    }
    await Promise.all(protocols.map(async (protocol) => {
      await this.components.registrar.handle(protocol, handler, options);
    }));
  }
  async unhandle(protocols) {
    if (!Array.isArray(protocols)) {
      protocols = [protocols];
    }
    await Promise.all(protocols.map(async (protocol) => {
      await this.components.registrar.unhandle(protocol);
    }));
  }
  async register(protocol, topology) {
    return this.components.registrar.register(protocol, topology);
  }
  unregister(id) {
    this.components.registrar.unregister(id);
  }
  async isDialable(multiaddr2, options = {}) {
    return this.components.connectionManager.isDialable(multiaddr2, options);
  }
  /**
   * Called whenever peer discovery services emit `peer` events and adds peers
   * to the peer store.
   */
  #onDiscoveryPeer(evt) {
    const { detail: peer } = evt;
    if (peer.id.toString() === this.peerId.toString()) {
      this.log.error("peer discovery mechanism discovered self");
      return;
    }
    void this.components.peerStore.merge(peer.id, {
      multiaddrs: peer.multiaddrs
    }).catch((err) => {
      this.log.error(err);
    });
  }
};

// ../../node_modules/libp2p/dist/src/index.js
async function createLibp2p(options = {}) {
  options.privateKey ??= await generateKeyPair("Ed25519");
  const node = new Libp2p({
    ...await validateConfig(options),
    peerId: peerIdFromPrivateKey(options.privateKey)
  });
  if (options.start !== false) {
    await node.start();
  }
  return node;
}

// src/client.ts
import { createOrbitDB } from "@orbitdb/core";
import { FsBlockstore } from "blockstore-fs";
import { LevelDatastore } from "datastore-level";

// src/config/libp2p.ts
import { identify, identifyPush } from "@libp2p/identify";
import { bootstrap } from "@libp2p/bootstrap";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/noise.js
import { publicKeyFromProtobuf as publicKeyFromProtobuf3 } from "@libp2p/crypto/keys";
import { serviceCapabilities as serviceCapabilities3 } from "@libp2p/interface";
import { peerIdFromPublicKey } from "@libp2p/peer-id";

// ../../node_modules/it-length-prefixed/dist/src/utils.js
function isAsyncIterable7(thing) {
  return thing[Symbol.asyncIterator] != null;
}

// ../../node_modules/it-length-prefixed/dist/src/encode.js
var defaultEncoder = (length3) => {
  const lengthLength = encodingLength2(length3);
  const lengthBuf = allocUnsafe(lengthLength);
  encode5(length3, lengthBuf);
  defaultEncoder.bytes = lengthLength;
  return lengthBuf;
};
defaultEncoder.bytes = 0;
function encode6(source, options) {
  options = options ?? {};
  const encodeLength = options.lengthEncoder ?? defaultEncoder;
  function* maybeYield(chunk) {
    const length3 = encodeLength(chunk.byteLength);
    if (length3 instanceof Uint8Array) {
      yield length3;
    } else {
      yield* length3;
    }
    if (chunk instanceof Uint8Array) {
      yield chunk;
    } else {
      yield* chunk;
    }
  }
  if (isAsyncIterable7(source)) {
    return async function* () {
      for await (const chunk of source) {
        yield* maybeYield(chunk);
      }
    }();
  }
  return function* () {
    for (const chunk of source) {
      yield* maybeYield(chunk);
    }
  }();
}
encode6.single = (chunk, options) => {
  options = options ?? {};
  const encodeLength = options.lengthEncoder ?? defaultEncoder;
  return new Uint8ArrayList(encodeLength(chunk.byteLength), chunk);
};

// ../../node_modules/it-length-prefixed/dist/src/errors.js
var InvalidMessageLengthError = class extends Error {
  name = "InvalidMessageLengthError";
  code = "ERR_INVALID_MSG_LENGTH";
};
var InvalidDataLengthError = class extends Error {
  name = "InvalidDataLengthError";
  code = "ERR_MSG_DATA_TOO_LONG";
};
var InvalidDataLengthLengthError = class extends Error {
  name = "InvalidDataLengthLengthError";
  code = "ERR_MSG_LENGTH_TOO_LONG";
};
var UnexpectedEOFError2 = class extends Error {
  name = "UnexpectedEOFError";
  code = "ERR_UNEXPECTED_EOF";
};

// ../../node_modules/it-length-prefixed/dist/src/decode.js
var MAX_LENGTH_LENGTH = 8;
var MAX_DATA_LENGTH = 1024 * 1024 * 4;
var ReadMode;
(function(ReadMode2) {
  ReadMode2[ReadMode2["LENGTH"] = 0] = "LENGTH";
  ReadMode2[ReadMode2["DATA"] = 1] = "DATA";
})(ReadMode || (ReadMode = {}));
var defaultDecoder = (buf) => {
  const length3 = decode6(buf);
  defaultDecoder.bytes = encodingLength2(length3);
  return length3;
};
defaultDecoder.bytes = 0;
function decode7(source, options) {
  const buffer = new Uint8ArrayList();
  let mode = ReadMode.LENGTH;
  let dataLength = -1;
  const lengthDecoder = options?.lengthDecoder ?? defaultDecoder;
  const maxLengthLength = options?.maxLengthLength ?? MAX_LENGTH_LENGTH;
  const maxDataLength = options?.maxDataLength ?? MAX_DATA_LENGTH;
  function* maybeYield() {
    while (buffer.byteLength > 0) {
      if (mode === ReadMode.LENGTH) {
        try {
          dataLength = lengthDecoder(buffer);
          if (dataLength < 0) {
            throw new InvalidMessageLengthError("Invalid message length");
          }
          if (dataLength > maxDataLength) {
            throw new InvalidDataLengthError("Message length too long");
          }
          const dataLengthLength = lengthDecoder.bytes;
          buffer.consume(dataLengthLength);
          if (options?.onLength != null) {
            options.onLength(dataLength);
          }
          mode = ReadMode.DATA;
        } catch (err) {
          if (err instanceof RangeError) {
            if (buffer.byteLength > maxLengthLength) {
              throw new InvalidDataLengthLengthError("Message length length too long");
            }
            break;
          }
          throw err;
        }
      }
      if (mode === ReadMode.DATA) {
        if (buffer.byteLength < dataLength) {
          break;
        }
        const data = buffer.sublist(0, dataLength);
        buffer.consume(dataLength);
        if (options?.onData != null) {
          options.onData(data);
        }
        yield data;
        mode = ReadMode.LENGTH;
      }
    }
  }
  if (isAsyncIterable7(source)) {
    return async function* () {
      for await (const buf of source) {
        buffer.append(buf);
        yield* maybeYield();
      }
      if (buffer.byteLength > 0) {
        throw new UnexpectedEOFError2("Unexpected end of input");
      }
    }();
  }
  return function* () {
    for (const buf of source) {
      buffer.append(buf);
      yield* maybeYield();
    }
    if (buffer.byteLength > 0) {
      throw new UnexpectedEOFError2("Unexpected end of input");
    }
  }();
}
decode7.fromReader = (reader, options) => {
  let byteLength = 1;
  const varByteSource = async function* () {
    while (true) {
      try {
        const { done, value } = await reader.next(byteLength);
        if (done === true) {
          return;
        }
        if (value != null) {
          yield value;
        }
      } catch (err) {
        if (err.code === "ERR_UNDER_READ") {
          return { done: true, value: null };
        }
        throw err;
      } finally {
        byteLength = 1;
      }
    }
  }();
  const onLength = (l) => {
    byteLength = l;
  };
  return decode7(varByteSource, {
    ...options ?? {},
    onLength
  });
};

// ../../node_modules/it-length-prefixed-stream/dist/src/errors.js
var InvalidMessageLengthError2 = class extends Error {
  name = "InvalidMessageLengthError";
  code = "ERR_INVALID_MSG_LENGTH";
};
var InvalidDataLengthError2 = class extends Error {
  name = "InvalidDataLengthError";
  code = "ERR_MSG_DATA_TOO_LONG";
};
var InvalidDataLengthLengthError2 = class extends Error {
  name = "InvalidDataLengthLengthError";
  code = "ERR_MSG_LENGTH_TOO_LONG";
};

// ../../node_modules/it-length-prefixed-stream/dist/src/index.js
function lpStream(duplex, opts = {}) {
  const bytes2 = byteStream(duplex, opts);
  if (opts.maxDataLength != null && opts.maxLengthLength == null) {
    opts.maxLengthLength = encodingLength2(opts.maxDataLength);
  }
  const decodeLength = opts?.lengthDecoder ?? decode6;
  const encodeLength = opts?.lengthEncoder ?? encode5;
  const W = {
    read: async (options) => {
      let dataLength = -1;
      const lengthBuffer = new Uint8ArrayList();
      while (true) {
        lengthBuffer.append(await bytes2.read(1, options));
        try {
          dataLength = decodeLength(lengthBuffer);
        } catch (err) {
          if (err instanceof RangeError) {
            continue;
          }
          throw err;
        }
        if (dataLength < 0) {
          throw new InvalidMessageLengthError2("Invalid message length");
        }
        if (opts?.maxLengthLength != null && lengthBuffer.byteLength > opts.maxLengthLength) {
          throw new InvalidDataLengthLengthError2("message length length too long");
        }
        if (dataLength > -1) {
          break;
        }
      }
      if (opts?.maxDataLength != null && dataLength > opts.maxDataLength) {
        throw new InvalidDataLengthError2("message length too long");
      }
      return bytes2.read(dataLength, options);
    },
    write: async (data, options) => {
      await bytes2.write(new Uint8ArrayList(encodeLength(data.byteLength), data), options);
    },
    writeV: async (data, options) => {
      const list = new Uint8ArrayList(...data.flatMap((buf) => [encodeLength(buf.byteLength), buf]));
      await bytes2.write(list, options);
    },
    unwrap: () => {
      return bytes2.unwrap();
    }
  };
  return W;
}

// ../../node_modules/it-pair/dist/src/index.js
function pair() {
  const deferred = pDefer();
  let piped = false;
  return {
    sink: async (source) => {
      if (piped) {
        throw new Error("already piped");
      }
      piped = true;
      deferred.resolve(source);
    },
    source: async function* () {
      const source = await deferred.promise;
      yield* source;
    }()
  };
}

// ../../node_modules/it-pair/dist/src/duplex.js
function duplexPair() {
  const a = pair();
  const b = pair();
  return [
    {
      source: a.source,
      sink: b.sink
    },
    {
      source: b.source,
      sink: a.sink
    }
  ];
}

// ../../node_modules/it-pipe/dist/src/index.js
function pipe(first, ...rest) {
  if (first == null) {
    throw new Error("Empty pipeline");
  }
  if (isDuplex(first)) {
    const duplex = first;
    first = () => duplex.source;
  } else if (isIterable(first) || isAsyncIterable8(first)) {
    const source = first;
    first = () => source;
  }
  const fns = [first, ...rest];
  if (fns.length > 1) {
    if (isDuplex(fns[fns.length - 1])) {
      fns[fns.length - 1] = fns[fns.length - 1].sink;
    }
  }
  if (fns.length > 2) {
    for (let i = 1; i < fns.length - 1; i++) {
      if (isDuplex(fns[i])) {
        fns[i] = duplexPipelineFn(fns[i]);
      }
    }
  }
  return rawPipe(...fns);
}
var rawPipe = (...fns) => {
  let res;
  while (fns.length > 0) {
    res = fns.shift()(res);
  }
  return res;
};
var isAsyncIterable8 = (obj) => {
  return obj?.[Symbol.asyncIterator] != null;
};
var isIterable = (obj) => {
  return obj?.[Symbol.iterator] != null;
};
var isDuplex = (obj) => {
  if (obj == null) {
    return false;
  }
  return obj.sink != null && obj.source != null;
};
var duplexPipelineFn = (duplex) => {
  return (source) => {
    const p = duplex.sink(source);
    if (p?.then != null) {
      const stream = pushable({
        objectMode: true
      });
      p.then(() => {
        stream.end();
      }, (err) => {
        stream.end(err);
      });
      let sourceWrap;
      const source2 = duplex.source;
      if (isAsyncIterable8(source2)) {
        sourceWrap = async function* () {
          yield* source2;
          stream.end();
        };
      } else if (isIterable(source2)) {
        sourceWrap = function* () {
          yield* source2;
          stream.end();
        };
      } else {
        throw new Error("Unknown duplex source type - must be Iterable or AsyncIterable");
      }
      return src_default7(stream, sourceWrap());
    }
    return duplex.source;
  };
};

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/constants.js
var NOISE_MSG_MAX_LENGTH_BYTES = 65535;
var NOISE_MSG_MAX_LENGTH_BYTES_WITHOUT_TAG = NOISE_MSG_MAX_LENGTH_BYTES - 16;
var DUMP_SESSION_KEYS = Boolean(globalThis.process?.env?.DUMP_SESSION_KEYS);

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/crypto/index.js
var import_as_chacha20poly1305 = __toESM(require_src(), 1);
import crypto4 from "node:crypto";

// ../../node_modules/@chainsafe/as-sha256/lib/alloc.js
var isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
var allocUnsafe2 = isNode ? _allocUnsafeNode : _allocUnsafe;
function _allocUnsafe(size = 0) {
  return new Uint8Array(size);
}
function _allocUnsafeNode(size = 0) {
  const out = Buffer.allocUnsafe(size);
  return new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
}

// ../../node_modules/@chainsafe/as-sha256/lib/wasmCode.js
var wasmCode = Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0, 1, 43, 8, 96, 2, 127, 127, 0, 96, 1, 127, 0, 96, 1, 127, 1, 127, 96, 2, 127, 127, 1, 127, 96, 0, 0, 96, 3, 127, 127, 127, 0, 96, 4, 127, 127, 127, 127, 0, 96, 3, 127, 127, 126, 0, 2, 13, 1, 3, 101, 110, 118, 5, 97, 98, 111, 114, 116, 0, 6, 3, 23, 22, 0, 0, 0, 0, 0, 7, 2, 3, 3, 2, 4, 5, 1, 2, 5, 0, 1, 1, 0, 1, 1, 4, 5, 3, 1, 0, 1, 6, 187, 1, 37, 127, 0, 65, 4, 11, 127, 0, 65, 128, 4, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 0, 65, 0, 11, 7, 169, 1, 13, 8, 72, 65, 83, 95, 83, 73, 77, 68, 3, 36, 22, 98, 97, 116, 99, 104, 72, 97, 115, 104, 52, 85, 105, 110, 116, 65, 114, 114, 97, 121, 54, 52, 115, 0, 17, 26, 98, 97, 116, 99, 104, 72, 97, 115, 104, 52, 72, 97, 115, 104, 79, 98, 106, 101, 99, 116, 73, 110, 112, 117, 116, 115, 0, 18, 12, 73, 78, 80, 85, 84, 95, 76, 69, 78, 71, 84, 72, 3, 1, 15, 80, 65, 82, 65, 76, 76, 69, 76, 95, 70, 65, 67, 84, 79, 82, 3, 0, 5, 105, 110, 112, 117, 116, 3, 30, 6, 111, 117, 116, 112, 117, 116, 3, 32, 4, 105, 110, 105, 116, 0, 11, 6, 117, 112, 100, 97, 116, 101, 0, 19, 5, 102, 105, 110, 97, 108, 0, 20, 6, 100, 105, 103, 101, 115, 116, 0, 21, 8, 100, 105, 103, 101, 115, 116, 54, 52, 0, 16, 6, 109, 101, 109, 111, 114, 121, 2, 0, 8, 1, 22, 12, 1, 18, 10, 196, 23, 22, 9, 0, 32, 0, 32, 1, 54, 2, 0, 11, 9, 0, 32, 0, 32, 1, 54, 2, 4, 11, 9, 0, 32, 0, 32, 1, 54, 2, 8, 11, 192, 1, 1, 4, 127, 32, 1, 40, 2, 0, 65, 124, 113, 34, 3, 65, 128, 2, 73, 4, 127, 32, 3, 65, 4, 118, 5, 65, 31, 65, 252, 255, 255, 255, 3, 32, 3, 32, 3, 65, 252, 255, 255, 255, 3, 79, 27, 34, 3, 103, 107, 34, 4, 65, 7, 107, 33, 2, 32, 3, 32, 4, 65, 4, 107, 118, 65, 16, 115, 11, 33, 3, 32, 1, 40, 2, 8, 33, 5, 32, 1, 40, 2, 4, 34, 4, 4, 64, 32, 4, 32, 5, 16, 3, 11, 32, 5, 4, 64, 32, 5, 32, 4, 16, 2, 11, 32, 1, 32, 0, 32, 2, 65, 4, 116, 32, 3, 106, 65, 2, 116, 106, 34, 1, 40, 2, 96, 70, 4, 64, 32, 1, 32, 5, 54, 2, 96, 32, 5, 69, 4, 64, 32, 0, 32, 2, 65, 2, 116, 106, 34, 1, 40, 2, 4, 65, 126, 32, 3, 119, 113, 33, 3, 32, 1, 32, 3, 54, 2, 4, 32, 3, 69, 4, 64, 32, 0, 32, 0, 40, 2, 0, 65, 126, 32, 2, 119, 113, 16, 1, 11, 11, 11, 11, 181, 2, 1, 5, 127, 32, 1, 40, 2, 0, 33, 3, 32, 1, 65, 4, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106, 34, 4, 40, 2, 0, 34, 2, 65, 1, 113, 4, 64, 32, 0, 32, 4, 16, 4, 32, 1, 32, 3, 65, 4, 106, 32, 2, 65, 124, 113, 106, 34, 3, 16, 1, 32, 1, 65, 4, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106, 34, 4, 40, 2, 0, 33, 2, 11, 32, 3, 65, 2, 113, 4, 64, 32, 1, 65, 4, 107, 40, 2, 0, 34, 1, 40, 2, 0, 33, 6, 32, 0, 32, 1, 16, 4, 32, 1, 32, 6, 65, 4, 106, 32, 3, 65, 124, 113, 106, 34, 3, 16, 1, 11, 32, 4, 32, 2, 65, 2, 114, 16, 1, 32, 4, 65, 4, 107, 32, 1, 54, 2, 0, 32, 0, 32, 3, 65, 124, 113, 34, 2, 65, 128, 2, 73, 4, 127, 32, 2, 65, 4, 118, 5, 65, 31, 65, 252, 255, 255, 255, 3, 32, 2, 32, 2, 65, 252, 255, 255, 255, 3, 79, 27, 34, 2, 103, 107, 34, 3, 65, 7, 107, 33, 5, 32, 2, 32, 3, 65, 4, 107, 118, 65, 16, 115, 11, 34, 2, 32, 5, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 33, 3, 32, 1, 65, 0, 16, 2, 32, 1, 32, 3, 16, 3, 32, 3, 4, 64, 32, 3, 32, 1, 16, 2, 11, 32, 0, 32, 5, 65, 4, 116, 32, 2, 106, 65, 2, 116, 106, 32, 1, 54, 2, 96, 32, 0, 32, 0, 40, 2, 0, 65, 1, 32, 5, 116, 114, 16, 1, 32, 0, 32, 5, 65, 2, 116, 106, 34, 0, 32, 0, 40, 2, 4, 65, 1, 32, 2, 116, 114, 54, 2, 4, 11, 130, 1, 1, 3, 127, 32, 1, 65, 19, 106, 65, 112, 113, 65, 4, 107, 33, 1, 32, 0, 40, 2, 160, 12, 34, 3, 4, 64, 32, 3, 32, 1, 65, 16, 107, 34, 5, 70, 4, 64, 32, 3, 40, 2, 0, 33, 4, 32, 5, 33, 1, 11, 11, 32, 2, 167, 65, 112, 113, 32, 1, 107, 34, 3, 65, 20, 73, 4, 64, 15, 11, 32, 1, 32, 4, 65, 2, 113, 32, 3, 65, 8, 107, 34, 3, 65, 1, 114, 114, 16, 1, 32, 1, 65, 0, 16, 2, 32, 1, 65, 0, 16, 3, 32, 1, 65, 4, 106, 32, 3, 106, 34, 3, 65, 2, 16, 1, 32, 0, 32, 3, 54, 2, 160, 12, 32, 0, 32, 1, 16, 5, 11, 29, 0, 32, 0, 65, 1, 65, 27, 32, 0, 103, 107, 116, 106, 65, 1, 107, 32, 0, 32, 0, 65, 254, 255, 255, 255, 1, 73, 27, 11, 142, 1, 1, 2, 127, 32, 1, 65, 128, 2, 73, 4, 127, 32, 1, 65, 4, 118, 5, 65, 31, 32, 1, 16, 7, 34, 1, 103, 107, 34, 3, 65, 7, 107, 33, 2, 32, 1, 32, 3, 65, 4, 107, 118, 65, 16, 115, 11, 33, 1, 32, 0, 32, 2, 65, 2, 116, 106, 40, 2, 4, 65, 127, 32, 1, 116, 113, 34, 1, 4, 127, 32, 0, 32, 1, 104, 32, 2, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 5, 32, 0, 40, 2, 0, 65, 127, 32, 2, 65, 1, 106, 116, 113, 34, 1, 4, 127, 32, 0, 32, 0, 32, 1, 104, 34, 0, 65, 2, 116, 106, 40, 2, 4, 104, 32, 0, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 5, 65, 0, 11, 11, 11, 148, 2, 1, 3, 127, 32, 1, 65, 252, 255, 255, 255, 3, 75, 4, 64, 65, 176, 14, 65, 176, 15, 65, 205, 3, 65, 29, 16, 0, 0, 11, 32, 0, 65, 12, 32, 1, 65, 19, 106, 65, 112, 113, 65, 4, 107, 32, 1, 65, 12, 77, 27, 34, 1, 16, 8, 34, 2, 69, 4, 64, 32, 1, 65, 128, 2, 79, 4, 127, 32, 1, 16, 7, 5, 32, 1, 11, 33, 2, 63, 0, 34, 3, 32, 2, 65, 4, 32, 0, 40, 2, 160, 12, 32, 3, 65, 16, 116, 65, 4, 107, 71, 116, 106, 65, 255, 255, 3, 106, 65, 128, 128, 124, 113, 65, 16, 118, 34, 2, 32, 2, 32, 3, 72, 27, 64, 0, 65, 0, 72, 4, 64, 32, 2, 64, 0, 65, 0, 72, 4, 64, 0, 11, 11, 32, 0, 32, 3, 65, 16, 116, 63, 0, 172, 66, 16, 134, 16, 6, 32, 0, 32, 1, 16, 8, 33, 2, 11, 32, 2, 40, 2, 0, 26, 32, 0, 32, 2, 16, 4, 32, 2, 40, 2, 0, 34, 3, 65, 124, 113, 32, 1, 107, 34, 4, 65, 16, 79, 4, 64, 32, 2, 32, 1, 32, 3, 65, 2, 113, 114, 16, 1, 32, 2, 65, 4, 106, 32, 1, 106, 34, 1, 32, 4, 65, 4, 107, 65, 1, 114, 16, 1, 32, 0, 32, 1, 16, 5, 5, 32, 2, 32, 3, 65, 126, 113, 16, 1, 32, 2, 65, 4, 106, 32, 2, 40, 2, 0, 65, 124, 113, 106, 34, 0, 32, 0, 40, 2, 0, 65, 125, 113, 16, 1, 11, 32, 2, 11, 169, 2, 1, 3, 127, 32, 0, 65, 252, 255, 255, 255, 3, 75, 4, 64, 65, 192, 13, 65, 240, 13, 65, 52, 65, 43, 16, 0, 0, 11, 32, 0, 65, 236, 255, 255, 255, 3, 75, 4, 64, 65, 176, 14, 65, 240, 14, 65, 253, 0, 65, 30, 16, 0, 0, 11, 35, 23, 69, 4, 64, 63, 0, 34, 2, 65, 0, 76, 4, 127, 65, 1, 32, 2, 107, 64, 0, 65, 0, 72, 5, 65, 0, 11, 4, 64, 0, 11, 65, 128, 16, 65, 0, 16, 1, 65, 160, 28, 65, 0, 54, 2, 0, 3, 64, 32, 1, 65, 23, 73, 4, 64, 32, 1, 65, 2, 116, 65, 128, 16, 106, 65, 0, 54, 2, 4, 65, 0, 33, 2, 3, 64, 32, 2, 65, 16, 73, 4, 64, 32, 1, 65, 4, 116, 32, 2, 106, 65, 2, 116, 65, 128, 16, 106, 65, 0, 54, 2, 96, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 65, 128, 16, 65, 164, 28, 63, 0, 172, 66, 16, 134, 16, 6, 65, 128, 16, 36, 23, 11, 35, 23, 32, 0, 65, 16, 106, 16, 9, 34, 2, 65, 1, 54, 2, 12, 32, 2, 32, 0, 54, 2, 16, 35, 24, 34, 3, 40, 2, 8, 33, 1, 32, 2, 32, 3, 16, 2, 32, 2, 32, 1, 16, 3, 32, 1, 32, 2, 32, 1, 40, 2, 4, 65, 3, 113, 114, 16, 2, 32, 3, 32, 2, 16, 3, 35, 25, 32, 2, 40, 2, 0, 65, 124, 113, 65, 4, 106, 106, 36, 25, 32, 2, 65, 20, 106, 34, 1, 65, 0, 32, 0, 252, 11, 0, 32, 1, 11, 74, 0, 65, 231, 204, 167, 208, 6, 36, 4, 65, 133, 221, 158, 219, 123, 36, 5, 65, 242, 230, 187, 227, 3, 36, 6, 65, 186, 234, 191, 170, 122, 36, 7, 65, 255, 164, 185, 136, 5, 36, 8, 65, 140, 209, 149, 216, 121, 36, 9, 65, 171, 179, 143, 252, 1, 36, 10, 65, 153, 154, 131, 223, 5, 36, 11, 65, 0, 36, 34, 65, 0, 36, 35, 11, 233, 3, 1, 1, 127, 35, 4, 36, 12, 35, 5, 36, 13, 35, 6, 36, 14, 35, 7, 36, 15, 35, 8, 36, 16, 35, 9, 36, 17, 35, 10, 36, 18, 35, 11, 36, 19, 65, 0, 36, 20, 3, 64, 35, 20, 65, 16, 73, 4, 64, 32, 0, 35, 20, 65, 2, 116, 106, 32, 1, 35, 20, 32, 2, 108, 65, 2, 116, 34, 3, 65, 3, 106, 106, 45, 0, 0, 32, 1, 32, 3, 106, 45, 0, 0, 65, 24, 116, 32, 1, 32, 3, 65, 1, 106, 106, 45, 0, 0, 65, 16, 116, 114, 32, 1, 32, 3, 65, 2, 106, 106, 45, 0, 0, 65, 8, 116, 114, 114, 54, 2, 0, 35, 20, 65, 1, 106, 36, 20, 12, 1, 11, 11, 65, 16, 36, 20, 3, 64, 35, 20, 65, 192, 0, 73, 4, 64, 32, 0, 35, 20, 65, 2, 116, 106, 32, 0, 35, 20, 65, 16, 107, 65, 2, 116, 106, 40, 2, 0, 32, 0, 35, 20, 65, 7, 107, 65, 2, 116, 106, 40, 2, 0, 32, 0, 35, 20, 65, 2, 107, 65, 2, 116, 106, 40, 2, 0, 34, 1, 65, 17, 120, 32, 1, 65, 19, 120, 115, 32, 1, 65, 10, 118, 115, 106, 32, 0, 35, 20, 65, 15, 107, 65, 2, 116, 106, 40, 2, 0, 34, 1, 65, 7, 120, 32, 1, 65, 18, 120, 115, 32, 1, 65, 3, 118, 115, 106, 106, 54, 2, 0, 35, 20, 65, 1, 106, 36, 20, 12, 1, 11, 11, 65, 0, 36, 20, 3, 64, 35, 20, 65, 192, 0, 73, 4, 64, 32, 0, 35, 20, 65, 2, 116, 34, 1, 106, 40, 2, 0, 32, 1, 35, 2, 106, 40, 2, 0, 35, 19, 35, 16, 34, 1, 65, 6, 120, 32, 1, 65, 11, 120, 115, 32, 1, 65, 25, 120, 115, 106, 35, 16, 34, 1, 35, 17, 113, 35, 18, 32, 1, 65, 127, 115, 113, 115, 106, 106, 106, 36, 21, 35, 12, 34, 1, 65, 2, 120, 32, 1, 65, 13, 120, 115, 32, 1, 65, 22, 120, 115, 35, 13, 34, 1, 35, 14, 34, 2, 113, 32, 1, 35, 12, 34, 1, 113, 32, 1, 32, 2, 113, 115, 115, 106, 36, 22, 35, 18, 36, 19, 35, 17, 36, 18, 35, 16, 36, 17, 35, 15, 35, 21, 106, 36, 16, 35, 14, 36, 15, 35, 13, 36, 14, 35, 12, 36, 13, 35, 21, 35, 22, 106, 36, 12, 35, 20, 65, 1, 106, 36, 20, 12, 1, 11, 11, 35, 4, 35, 12, 106, 36, 4, 35, 5, 35, 13, 106, 36, 5, 35, 6, 35, 14, 106, 36, 6, 35, 7, 35, 15, 106, 36, 7, 35, 8, 35, 16, 106, 36, 8, 35, 9, 35, 17, 106, 36, 9, 35, 10, 35, 18, 106, 36, 10, 35, 11, 35, 19, 106, 36, 11, 11, 253, 1, 1, 2, 127, 35, 4, 36, 12, 35, 5, 36, 13, 35, 6, 36, 14, 35, 7, 36, 15, 35, 8, 36, 16, 35, 9, 36, 17, 35, 10, 36, 18, 35, 11, 36, 19, 65, 0, 36, 20, 3, 64, 35, 20, 65, 192, 0, 73, 4, 64, 32, 0, 35, 20, 65, 2, 116, 106, 40, 2, 0, 35, 19, 35, 16, 34, 1, 65, 6, 120, 32, 1, 65, 11, 120, 115, 32, 1, 65, 25, 120, 115, 106, 35, 16, 34, 1, 35, 17, 113, 35, 18, 32, 1, 65, 127, 115, 113, 115, 106, 106, 36, 21, 35, 12, 34, 1, 65, 2, 120, 32, 1, 65, 13, 120, 115, 32, 1, 65, 22, 120, 115, 35, 13, 34, 2, 35, 14, 34, 1, 113, 32, 2, 35, 12, 34, 2, 113, 32, 1, 32, 2, 113, 115, 115, 106, 36, 22, 35, 18, 36, 19, 35, 17, 36, 18, 35, 16, 36, 17, 35, 15, 35, 21, 106, 36, 16, 35, 14, 36, 15, 35, 13, 36, 14, 35, 12, 36, 13, 35, 21, 35, 22, 106, 36, 12, 35, 20, 65, 1, 106, 36, 20, 12, 1, 11, 11, 35, 4, 35, 12, 106, 36, 4, 35, 5, 35, 13, 106, 36, 5, 35, 6, 35, 14, 106, 36, 6, 35, 7, 35, 15, 106, 36, 7, 35, 8, 35, 16, 106, 36, 8, 35, 9, 35, 17, 106, 36, 9, 35, 10, 35, 18, 106, 36, 10, 35, 11, 35, 19, 106, 36, 11, 11, 25, 0, 32, 0, 65, 128, 254, 131, 120, 113, 65, 8, 119, 32, 0, 65, 255, 129, 252, 7, 113, 65, 8, 120, 114, 11, 88, 0, 16, 11, 35, 29, 32, 0, 32, 2, 16, 12, 35, 3, 16, 13, 32, 1, 35, 4, 16, 14, 54, 2, 0, 32, 1, 35, 5, 16, 14, 54, 2, 4, 32, 1, 35, 6, 16, 14, 54, 2, 8, 32, 1, 35, 7, 16, 14, 54, 2, 12, 32, 1, 35, 8, 16, 14, 54, 2, 16, 32, 1, 35, 9, 16, 14, 54, 2, 20, 32, 1, 35, 10, 16, 14, 54, 2, 24, 32, 1, 35, 11, 16, 14, 54, 2, 28, 11, 10, 0, 32, 0, 32, 1, 65, 1, 16, 15, 11, 42, 1, 1, 127, 3, 64, 32, 1, 65, 4, 72, 4, 64, 35, 31, 32, 1, 65, 6, 116, 106, 32, 0, 32, 1, 65, 5, 116, 106, 16, 16, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 11, 44, 1, 1, 127, 3, 64, 32, 1, 65, 4, 72, 4, 64, 35, 31, 32, 1, 65, 2, 116, 106, 32, 0, 32, 1, 65, 5, 116, 106, 65, 4, 16, 15, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 11, 178, 1, 1, 2, 127, 35, 35, 32, 1, 106, 36, 35, 35, 34, 4, 64, 65, 192, 0, 35, 34, 107, 34, 2, 32, 1, 76, 4, 64, 35, 27, 35, 34, 106, 32, 0, 32, 2, 252, 10, 0, 0, 35, 34, 32, 2, 106, 36, 34, 65, 192, 0, 35, 34, 107, 33, 2, 32, 1, 65, 192, 0, 35, 34, 107, 107, 33, 1, 35, 29, 35, 27, 65, 1, 16, 12, 65, 0, 36, 34, 5, 35, 27, 35, 34, 106, 32, 0, 32, 1, 252, 10, 0, 0, 35, 34, 32, 1, 106, 36, 34, 15, 11, 11, 3, 64, 32, 3, 32, 1, 65, 192, 0, 109, 72, 4, 64, 35, 29, 32, 0, 32, 2, 106, 65, 1, 16, 12, 32, 3, 65, 1, 106, 33, 3, 32, 2, 65, 64, 107, 33, 2, 12, 1, 11, 11, 32, 1, 65, 63, 113, 34, 1, 4, 64, 35, 27, 35, 34, 106, 32, 0, 32, 2, 106, 32, 1, 252, 10, 0, 0, 35, 34, 32, 1, 106, 36, 34, 11, 11, 150, 2, 1, 2, 127, 35, 35, 65, 63, 113, 65, 63, 73, 4, 64, 35, 27, 35, 34, 106, 65, 128, 1, 58, 0, 0, 35, 34, 65, 1, 106, 36, 34, 11, 35, 35, 65, 63, 113, 65, 56, 79, 4, 64, 35, 27, 35, 34, 106, 34, 1, 65, 192, 0, 35, 34, 107, 106, 33, 2, 3, 64, 32, 1, 32, 2, 73, 4, 64, 32, 1, 65, 0, 58, 0, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 35, 29, 35, 27, 65, 1, 16, 12, 65, 0, 36, 34, 11, 35, 35, 65, 63, 113, 65, 63, 79, 4, 64, 35, 27, 35, 34, 106, 65, 128, 1, 58, 0, 0, 35, 34, 65, 1, 106, 36, 34, 11, 35, 27, 35, 34, 106, 34, 1, 65, 56, 35, 34, 107, 106, 33, 2, 3, 64, 32, 1, 32, 2, 73, 4, 64, 32, 1, 65, 0, 58, 0, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 35, 27, 35, 35, 65, 128, 128, 128, 128, 2, 109, 16, 14, 54, 2, 56, 35, 27, 35, 35, 65, 3, 116, 16, 14, 54, 2, 60, 35, 29, 35, 27, 65, 1, 16, 12, 32, 0, 35, 4, 16, 14, 54, 2, 0, 32, 0, 35, 5, 16, 14, 54, 2, 4, 32, 0, 35, 6, 16, 14, 54, 2, 8, 32, 0, 35, 7, 16, 14, 54, 2, 12, 32, 0, 35, 8, 16, 14, 54, 2, 16, 32, 0, 35, 9, 16, 14, 54, 2, 20, 32, 0, 35, 10, 16, 14, 54, 2, 24, 32, 0, 35, 11, 16, 14, 54, 2, 28, 11, 14, 0, 16, 11, 35, 31, 32, 0, 16, 19, 35, 33, 16, 20, 11, 82, 0, 65, 196, 10, 40, 2, 0, 36, 2, 65, 148, 13, 40, 2, 0, 36, 3, 65, 224, 15, 65, 224, 15, 16, 2, 65, 224, 15, 65, 224, 15, 16, 3, 65, 224, 15, 36, 24, 65, 192, 0, 16, 10, 36, 26, 35, 26, 36, 27, 65, 128, 8, 16, 10, 36, 28, 35, 28, 36, 29, 65, 128, 4, 16, 10, 36, 30, 35, 30, 36, 31, 65, 32, 16, 10, 36, 32, 35, 32, 36, 33, 11, 11, 253, 6, 18, 0, 65, 140, 8, 11, 2, 28, 1, 0, 65, 152, 8, 11, 136, 2, 1, 0, 0, 0, 0, 1, 0, 0, 152, 47, 138, 66, 145, 68, 55, 113, 207, 251, 192, 181, 165, 219, 181, 233, 91, 194, 86, 57, 241, 17, 241, 89, 164, 130, 63, 146, 213, 94, 28, 171, 152, 170, 7, 216, 1, 91, 131, 18, 190, 133, 49, 36, 195, 125, 12, 85, 116, 93, 190, 114, 254, 177, 222, 128, 167, 6, 220, 155, 116, 241, 155, 193, 193, 105, 155, 228, 134, 71, 190, 239, 198, 157, 193, 15, 204, 161, 12, 36, 111, 44, 233, 45, 170, 132, 116, 74, 220, 169, 176, 92, 218, 136, 249, 118, 82, 81, 62, 152, 109, 198, 49, 168, 200, 39, 3, 176, 199, 127, 89, 191, 243, 11, 224, 198, 71, 145, 167, 213, 81, 99, 202, 6, 103, 41, 41, 20, 133, 10, 183, 39, 56, 33, 27, 46, 252, 109, 44, 77, 19, 13, 56, 83, 84, 115, 10, 101, 187, 10, 106, 118, 46, 201, 194, 129, 133, 44, 114, 146, 161, 232, 191, 162, 75, 102, 26, 168, 112, 139, 75, 194, 163, 81, 108, 199, 25, 232, 146, 209, 36, 6, 153, 214, 133, 53, 14, 244, 112, 160, 106, 16, 22, 193, 164, 25, 8, 108, 55, 30, 76, 119, 72, 39, 181, 188, 176, 52, 179, 12, 28, 57, 74, 170, 216, 78, 79, 202, 156, 91, 243, 111, 46, 104, 238, 130, 143, 116, 111, 99, 165, 120, 20, 120, 200, 132, 8, 2, 199, 140, 250, 255, 190, 144, 235, 108, 80, 164, 247, 163, 249, 190, 242, 120, 113, 198, 0, 65, 172, 10, 11, 1, 44, 0, 65, 184, 10, 11, 21, 4, 0, 0, 0, 16, 0, 0, 0, 32, 4, 0, 0, 32, 4, 0, 0, 0, 1, 0, 0, 64, 0, 65, 220, 10, 11, 2, 28, 1, 0, 65, 232, 10, 11, 136, 2, 1, 0, 0, 0, 0, 1, 0, 0, 152, 47, 138, 194, 145, 68, 55, 113, 207, 251, 192, 181, 165, 219, 181, 233, 91, 194, 86, 57, 241, 17, 241, 89, 164, 130, 63, 146, 213, 94, 28, 171, 152, 170, 7, 216, 1, 91, 131, 18, 190, 133, 49, 36, 195, 125, 12, 85, 116, 93, 190, 114, 254, 177, 222, 128, 167, 6, 220, 155, 116, 243, 155, 193, 193, 105, 155, 100, 134, 71, 254, 240, 198, 237, 225, 15, 84, 242, 12, 36, 111, 52, 233, 79, 190, 132, 201, 108, 30, 65, 185, 97, 250, 136, 249, 22, 82, 81, 198, 242, 109, 90, 142, 168, 101, 252, 25, 176, 199, 158, 217, 185, 195, 49, 18, 154, 160, 234, 14, 231, 43, 35, 177, 253, 176, 62, 53, 199, 213, 186, 105, 48, 95, 109, 151, 203, 143, 17, 15, 90, 253, 238, 30, 220, 137, 182, 53, 10, 4, 122, 11, 222, 157, 202, 244, 88, 22, 91, 93, 225, 134, 62, 127, 0, 128, 137, 8, 55, 50, 234, 7, 165, 55, 149, 171, 111, 16, 97, 64, 23, 241, 214, 140, 13, 109, 59, 170, 205, 55, 190, 187, 192, 218, 59, 97, 131, 99, 163, 72, 219, 49, 233, 2, 11, 167, 92, 209, 111, 202, 250, 26, 82, 49, 132, 51, 49, 149, 26, 212, 110, 144, 120, 67, 109, 242, 145, 156, 195, 189, 171, 204, 158, 230, 160, 201, 181, 60, 182, 47, 83, 198, 65, 199, 210, 163, 126, 35, 7, 104, 75, 149, 164, 118, 29, 25, 76, 0, 65, 252, 12, 11, 1, 44, 0, 65, 136, 13, 11, 21, 4, 0, 0, 0, 16, 0, 0, 0, 112, 5, 0, 0, 112, 5, 0, 0, 0, 1, 0, 0, 64, 0, 65, 172, 13, 11, 1, 44, 0, 65, 184, 13, 11, 35, 2, 0, 0, 0, 28, 0, 0, 0, 73, 0, 110, 0, 118, 0, 97, 0, 108, 0, 105, 0, 100, 0, 32, 0, 108, 0, 101, 0, 110, 0, 103, 0, 116, 0, 104, 0, 65, 220, 13, 11, 1, 60, 0, 65, 232, 13, 11, 45, 2, 0, 0, 0, 38, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 97, 0, 114, 0, 114, 0, 97, 0, 121, 0, 98, 0, 117, 0, 102, 0, 102, 0, 101, 0, 114, 0, 46, 0, 116, 0, 115, 0, 65, 156, 14, 11, 1, 60, 0, 65, 168, 14, 11, 47, 2, 0, 0, 0, 40, 0, 0, 0, 65, 0, 108, 0, 108, 0, 111, 0, 99, 0, 97, 0, 116, 0, 105, 0, 111, 0, 110, 0, 32, 0, 116, 0, 111, 0, 111, 0, 32, 0, 108, 0, 97, 0, 114, 0, 103, 0, 101, 0, 65, 220, 14, 11, 1, 60, 0, 65, 232, 14, 11, 37, 2, 0, 0, 0, 30, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 114, 0, 116, 0, 47, 0, 116, 0, 99, 0, 109, 0, 115, 0, 46, 0, 116, 0, 115, 0, 65, 156, 15, 11, 1, 60, 0, 65, 168, 15, 11, 37, 2, 0, 0, 0, 30, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 114, 0, 116, 0, 47, 0, 116, 0, 108, 0, 115, 0, 102, 0, 46, 0, 116, 0, 115]);

// ../../node_modules/@chainsafe/as-sha256/lib/wasmSimdCode.js
var wasmSimdCode = Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0, 1, 37, 7, 96, 2, 127, 127, 0, 96, 1, 127, 1, 127, 96, 2, 127, 127, 1, 127, 96, 1, 127, 0, 96, 0, 0, 96, 4, 127, 127, 127, 127, 0, 96, 3, 127, 127, 126, 0, 2, 13, 1, 3, 101, 110, 118, 5, 97, 98, 111, 114, 116, 0, 5, 3, 30, 29, 0, 0, 0, 0, 0, 6, 1, 2, 2, 2, 1, 2, 1, 1, 2, 4, 4, 1, 0, 3, 3, 4, 0, 0, 3, 3, 3, 0, 4, 5, 3, 1, 0, 1, 6, 227, 4, 61, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 127, 1, 65, 0, 11, 123, 1, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 0, 65, 4, 11, 127, 0, 65, 128, 4, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 0, 65, 1, 11, 7, 169, 1, 13, 8, 72, 65, 83, 95, 83, 73, 77, 68, 3, 60, 22, 98, 97, 116, 99, 104, 72, 97, 115, 104, 52, 85, 105, 110, 116, 65, 114, 114, 97, 121, 54, 52, 115, 0, 20, 26, 98, 97, 116, 99, 104, 72, 97, 115, 104, 52, 72, 97, 115, 104, 79, 98, 106, 101, 99, 116, 73, 110, 112, 117, 116, 115, 0, 21, 12, 73, 78, 80, 85, 84, 95, 76, 69, 78, 71, 84, 72, 3, 28, 15, 80, 65, 82, 65, 76, 76, 69, 76, 95, 70, 65, 67, 84, 79, 82, 3, 27, 5, 105, 110, 112, 117, 116, 3, 54, 6, 111, 117, 116, 112, 117, 116, 3, 56, 4, 105, 110, 105, 116, 0, 22, 6, 117, 112, 100, 97, 116, 101, 0, 24, 5, 102, 105, 110, 97, 108, 0, 25, 6, 100, 105, 103, 101, 115, 116, 0, 26, 8, 100, 105, 103, 101, 115, 116, 54, 52, 0, 28, 6, 109, 101, 109, 111, 114, 121, 2, 0, 8, 1, 29, 12, 1, 38, 10, 158, 112, 29, 9, 0, 32, 0, 32, 1, 54, 2, 0, 11, 9, 0, 32, 0, 32, 1, 54, 2, 4, 11, 9, 0, 32, 0, 32, 1, 54, 2, 8, 11, 192, 1, 1, 4, 127, 32, 1, 40, 2, 0, 65, 124, 113, 34, 3, 65, 128, 2, 73, 4, 127, 32, 3, 65, 4, 118, 5, 65, 31, 65, 252, 255, 255, 255, 3, 32, 3, 32, 3, 65, 252, 255, 255, 255, 3, 79, 27, 34, 3, 103, 107, 34, 4, 65, 7, 107, 33, 2, 32, 3, 32, 4, 65, 4, 107, 118, 65, 16, 115, 11, 33, 3, 32, 1, 40, 2, 8, 33, 5, 32, 1, 40, 2, 4, 34, 4, 4, 64, 32, 4, 32, 5, 16, 3, 11, 32, 5, 4, 64, 32, 5, 32, 4, 16, 2, 11, 32, 1, 32, 0, 32, 2, 65, 4, 116, 32, 3, 106, 65, 2, 116, 106, 34, 1, 40, 2, 96, 70, 4, 64, 32, 1, 32, 5, 54, 2, 96, 32, 5, 69, 4, 64, 32, 0, 32, 2, 65, 2, 116, 106, 34, 1, 40, 2, 4, 65, 126, 32, 3, 119, 113, 33, 3, 32, 1, 32, 3, 54, 2, 4, 32, 3, 69, 4, 64, 32, 0, 32, 0, 40, 2, 0, 65, 126, 32, 2, 119, 113, 16, 1, 11, 11, 11, 11, 181, 2, 1, 5, 127, 32, 1, 40, 2, 0, 33, 3, 32, 1, 65, 4, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106, 34, 4, 40, 2, 0, 34, 2, 65, 1, 113, 4, 64, 32, 0, 32, 4, 16, 4, 32, 1, 32, 3, 65, 4, 106, 32, 2, 65, 124, 113, 106, 34, 3, 16, 1, 32, 1, 65, 4, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106, 34, 4, 40, 2, 0, 33, 2, 11, 32, 3, 65, 2, 113, 4, 64, 32, 1, 65, 4, 107, 40, 2, 0, 34, 1, 40, 2, 0, 33, 6, 32, 0, 32, 1, 16, 4, 32, 1, 32, 6, 65, 4, 106, 32, 3, 65, 124, 113, 106, 34, 3, 16, 1, 11, 32, 4, 32, 2, 65, 2, 114, 16, 1, 32, 4, 65, 4, 107, 32, 1, 54, 2, 0, 32, 0, 32, 3, 65, 124, 113, 34, 2, 65, 128, 2, 73, 4, 127, 32, 2, 65, 4, 118, 5, 65, 31, 65, 252, 255, 255, 255, 3, 32, 2, 32, 2, 65, 252, 255, 255, 255, 3, 79, 27, 34, 2, 103, 107, 34, 3, 65, 7, 107, 33, 5, 32, 2, 32, 3, 65, 4, 107, 118, 65, 16, 115, 11, 34, 2, 32, 5, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 33, 3, 32, 1, 65, 0, 16, 2, 32, 1, 32, 3, 16, 3, 32, 3, 4, 64, 32, 3, 32, 1, 16, 2, 11, 32, 0, 32, 5, 65, 4, 116, 32, 2, 106, 65, 2, 116, 106, 32, 1, 54, 2, 96, 32, 0, 32, 0, 40, 2, 0, 65, 1, 32, 5, 116, 114, 16, 1, 32, 0, 32, 5, 65, 2, 116, 106, 34, 0, 32, 0, 40, 2, 4, 65, 1, 32, 2, 116, 114, 54, 2, 4, 11, 130, 1, 1, 3, 127, 32, 1, 65, 19, 106, 65, 112, 113, 65, 4, 107, 33, 1, 32, 0, 40, 2, 160, 12, 34, 3, 4, 64, 32, 3, 32, 1, 65, 16, 107, 34, 5, 70, 4, 64, 32, 3, 40, 2, 0, 33, 4, 32, 5, 33, 1, 11, 11, 32, 2, 167, 65, 112, 113, 32, 1, 107, 34, 3, 65, 20, 73, 4, 64, 15, 11, 32, 1, 32, 4, 65, 2, 113, 32, 3, 65, 8, 107, 34, 3, 65, 1, 114, 114, 16, 1, 32, 1, 65, 0, 16, 2, 32, 1, 65, 0, 16, 3, 32, 1, 65, 4, 106, 32, 3, 106, 34, 3, 65, 2, 16, 1, 32, 0, 32, 3, 54, 2, 160, 12, 32, 0, 32, 1, 16, 5, 11, 29, 0, 32, 0, 65, 1, 65, 27, 32, 0, 103, 107, 116, 106, 65, 1, 107, 32, 0, 32, 0, 65, 254, 255, 255, 255, 1, 73, 27, 11, 142, 1, 1, 2, 127, 32, 1, 65, 128, 2, 73, 4, 127, 32, 1, 65, 4, 118, 5, 65, 31, 32, 1, 16, 7, 34, 1, 103, 107, 34, 3, 65, 7, 107, 33, 2, 32, 1, 32, 3, 65, 4, 107, 118, 65, 16, 115, 11, 33, 1, 32, 0, 32, 2, 65, 2, 116, 106, 40, 2, 4, 65, 127, 32, 1, 116, 113, 34, 1, 4, 127, 32, 0, 32, 1, 104, 32, 2, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 5, 32, 0, 40, 2, 0, 65, 127, 32, 2, 65, 1, 106, 116, 113, 34, 1, 4, 127, 32, 0, 32, 0, 32, 1, 104, 34, 0, 65, 2, 116, 106, 40, 2, 4, 104, 32, 0, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 5, 65, 0, 11, 11, 11, 148, 2, 1, 3, 127, 32, 1, 65, 252, 255, 255, 255, 3, 75, 4, 64, 65, 176, 14, 65, 176, 15, 65, 205, 3, 65, 29, 16, 0, 0, 11, 32, 0, 65, 12, 32, 1, 65, 19, 106, 65, 112, 113, 65, 4, 107, 32, 1, 65, 12, 77, 27, 34, 1, 16, 8, 34, 2, 69, 4, 64, 32, 1, 65, 128, 2, 79, 4, 127, 32, 1, 16, 7, 5, 32, 1, 11, 33, 2, 63, 0, 34, 3, 32, 2, 65, 4, 32, 0, 40, 2, 160, 12, 32, 3, 65, 16, 116, 65, 4, 107, 71, 116, 106, 65, 255, 255, 3, 106, 65, 128, 128, 124, 113, 65, 16, 118, 34, 2, 32, 2, 32, 3, 72, 27, 64, 0, 65, 0, 72, 4, 64, 32, 2, 64, 0, 65, 0, 72, 4, 64, 0, 11, 11, 32, 0, 32, 3, 65, 16, 116, 63, 0, 172, 66, 16, 134, 16, 6, 32, 0, 32, 1, 16, 8, 33, 2, 11, 32, 2, 40, 2, 0, 26, 32, 0, 32, 2, 16, 4, 32, 2, 40, 2, 0, 34, 3, 65, 124, 113, 32, 1, 107, 34, 4, 65, 16, 79, 4, 64, 32, 2, 32, 1, 32, 3, 65, 2, 113, 114, 16, 1, 32, 2, 65, 4, 106, 32, 1, 106, 34, 1, 32, 4, 65, 4, 107, 65, 1, 114, 16, 1, 32, 0, 32, 1, 16, 5, 5, 32, 2, 32, 3, 65, 126, 113, 16, 1, 32, 2, 65, 4, 106, 32, 2, 40, 2, 0, 65, 124, 113, 106, 34, 0, 32, 0, 40, 2, 0, 65, 125, 113, 16, 1, 11, 32, 2, 11, 133, 2, 1, 2, 127, 32, 0, 65, 236, 255, 255, 255, 3, 75, 4, 64, 65, 176, 14, 65, 240, 14, 65, 253, 0, 65, 30, 16, 0, 0, 11, 35, 20, 69, 4, 64, 63, 0, 34, 3, 65, 0, 76, 4, 127, 65, 1, 32, 3, 107, 64, 0, 65, 0, 72, 5, 65, 0, 11, 4, 64, 0, 11, 65, 208, 21, 65, 0, 16, 1, 65, 240, 33, 65, 0, 54, 2, 0, 3, 64, 32, 2, 65, 23, 73, 4, 64, 32, 2, 65, 2, 116, 65, 208, 21, 106, 65, 0, 54, 2, 4, 65, 0, 33, 3, 3, 64, 32, 3, 65, 16, 73, 4, 64, 32, 2, 65, 4, 116, 32, 3, 106, 65, 2, 116, 65, 208, 21, 106, 65, 0, 54, 2, 96, 32, 3, 65, 1, 106, 33, 3, 12, 1, 11, 11, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 65, 208, 21, 65, 244, 33, 63, 0, 172, 66, 16, 134, 16, 6, 65, 208, 21, 36, 20, 11, 35, 20, 32, 0, 65, 16, 106, 16, 9, 34, 2, 32, 1, 54, 2, 12, 32, 2, 32, 0, 54, 2, 16, 35, 21, 34, 0, 40, 2, 8, 33, 1, 32, 2, 32, 0, 16, 2, 32, 2, 32, 1, 16, 3, 32, 1, 32, 2, 32, 1, 40, 2, 4, 65, 3, 113, 114, 16, 2, 32, 0, 32, 2, 16, 3, 35, 22, 32, 2, 40, 2, 0, 65, 124, 113, 65, 4, 106, 106, 36, 22, 32, 2, 65, 20, 106, 11, 46, 1, 1, 127, 32, 0, 65, 252, 255, 255, 255, 3, 75, 4, 64, 65, 192, 13, 65, 240, 13, 65, 52, 65, 43, 16, 0, 0, 11, 32, 0, 65, 1, 16, 10, 34, 1, 65, 0, 32, 0, 252, 11, 0, 32, 1, 11, 41, 0, 32, 1, 32, 0, 40, 2, 12, 79, 4, 64, 65, 144, 16, 65, 208, 16, 65, 242, 0, 65, 42, 16, 0, 0, 11, 32, 0, 40, 2, 4, 32, 1, 65, 2, 116, 106, 40, 2, 0, 11, 181, 1, 1, 4, 127, 32, 0, 69, 4, 64, 65, 192, 18, 15, 11, 65, 0, 32, 0, 107, 32, 0, 32, 0, 65, 31, 118, 65, 1, 116, 34, 1, 27, 34, 0, 65, 10, 79, 65, 1, 106, 32, 0, 65, 144, 206, 0, 79, 65, 3, 106, 32, 0, 65, 232, 7, 79, 106, 32, 0, 65, 228, 0, 73, 27, 32, 0, 65, 192, 132, 61, 79, 65, 6, 106, 32, 0, 65, 128, 148, 235, 220, 3, 79, 65, 8, 106, 32, 0, 65, 128, 194, 215, 47, 79, 106, 32, 0, 65, 128, 173, 226, 4, 73, 27, 32, 0, 65, 160, 141, 6, 73, 27, 34, 2, 65, 1, 116, 32, 1, 106, 65, 2, 16, 10, 34, 3, 32, 1, 106, 33, 4, 3, 64, 32, 4, 32, 2, 65, 1, 107, 34, 2, 65, 1, 116, 106, 32, 0, 65, 10, 112, 65, 48, 106, 59, 1, 0, 32, 0, 65, 10, 110, 34, 0, 13, 0, 11, 32, 1, 4, 64, 32, 3, 65, 45, 59, 1, 0, 11, 32, 3, 11, 13, 0, 32, 0, 65, 20, 107, 40, 2, 16, 65, 1, 118, 11, 64, 1, 3, 127, 32, 0, 16, 14, 65, 1, 116, 34, 2, 32, 1, 16, 14, 65, 1, 116, 34, 3, 106, 34, 4, 69, 4, 64, 65, 160, 20, 15, 11, 32, 4, 65, 2, 16, 10, 34, 4, 32, 0, 32, 2, 252, 10, 0, 0, 32, 2, 32, 4, 106, 32, 1, 32, 3, 252, 10, 0, 0, 32, 4, 11, 145, 16, 2, 2, 127, 1, 123, 65, 224, 15, 65, 224, 15, 16, 2, 65, 224, 15, 65, 224, 15, 16, 3, 65, 224, 15, 36, 21, 65, 128, 8, 16, 11, 36, 23, 35, 23, 36, 24, 2, 64, 3, 64, 32, 0, 65, 192, 0, 72, 4, 64, 35, 24, 33, 1, 65, 192, 10, 32, 0, 16, 12, 253, 17, 33, 2, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 32, 0, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 67, 11, 32, 1, 32, 2, 253, 11, 4, 0, 12, 63, 11, 32, 1, 32, 2, 253, 11, 4, 16, 12, 62, 11, 32, 1, 32, 2, 253, 11, 4, 32, 12, 61, 11, 32, 1, 32, 2, 253, 11, 4, 48, 12, 60, 11, 32, 1, 32, 2, 253, 11, 4, 64, 12, 59, 11, 32, 1, 32, 2, 253, 11, 4, 80, 12, 58, 11, 32, 1, 32, 2, 253, 11, 4, 96, 12, 57, 11, 32, 1, 32, 2, 253, 11, 4, 112, 12, 56, 11, 32, 1, 32, 2, 253, 11, 4, 128, 1, 12, 55, 11, 32, 1, 32, 2, 253, 11, 4, 144, 1, 12, 54, 11, 32, 1, 32, 2, 253, 11, 4, 160, 1, 12, 53, 11, 32, 1, 32, 2, 253, 11, 4, 176, 1, 12, 52, 11, 32, 1, 32, 2, 253, 11, 4, 192, 1, 12, 51, 11, 32, 1, 32, 2, 253, 11, 4, 208, 1, 12, 50, 11, 32, 1, 32, 2, 253, 11, 4, 224, 1, 12, 49, 11, 32, 1, 32, 2, 253, 11, 4, 240, 1, 12, 48, 11, 32, 1, 32, 2, 253, 11, 4, 128, 2, 12, 47, 11, 32, 1, 32, 2, 253, 11, 4, 144, 2, 12, 46, 11, 32, 1, 32, 2, 253, 11, 4, 160, 2, 12, 45, 11, 32, 1, 32, 2, 253, 11, 4, 176, 2, 12, 44, 11, 32, 1, 32, 2, 253, 11, 4, 192, 2, 12, 43, 11, 32, 1, 32, 2, 253, 11, 4, 208, 2, 12, 42, 11, 32, 1, 32, 2, 253, 11, 4, 224, 2, 12, 41, 11, 32, 1, 32, 2, 253, 11, 4, 240, 2, 12, 40, 11, 32, 1, 32, 2, 253, 11, 4, 128, 3, 12, 39, 11, 32, 1, 32, 2, 253, 11, 4, 144, 3, 12, 38, 11, 32, 1, 32, 2, 253, 11, 4, 160, 3, 12, 37, 11, 32, 1, 32, 2, 253, 11, 4, 176, 3, 12, 36, 11, 32, 1, 32, 2, 253, 11, 4, 192, 3, 12, 35, 11, 32, 1, 32, 2, 253, 11, 4, 208, 3, 12, 34, 11, 32, 1, 32, 2, 253, 11, 4, 224, 3, 12, 33, 11, 32, 1, 32, 2, 253, 11, 4, 240, 3, 12, 32, 11, 32, 1, 32, 2, 253, 11, 4, 128, 4, 12, 31, 11, 32, 1, 32, 2, 253, 11, 4, 144, 4, 12, 30, 11, 32, 1, 32, 2, 253, 11, 4, 160, 4, 12, 29, 11, 32, 1, 32, 2, 253, 11, 4, 176, 4, 12, 28, 11, 32, 1, 32, 2, 253, 11, 4, 192, 4, 12, 27, 11, 32, 1, 32, 2, 253, 11, 4, 208, 4, 12, 26, 11, 32, 1, 32, 2, 253, 11, 4, 224, 4, 12, 25, 11, 32, 1, 32, 2, 253, 11, 4, 240, 4, 12, 24, 11, 32, 1, 32, 2, 253, 11, 4, 128, 5, 12, 23, 11, 32, 1, 32, 2, 253, 11, 4, 144, 5, 12, 22, 11, 32, 1, 32, 2, 253, 11, 4, 160, 5, 12, 21, 11, 32, 1, 32, 2, 253, 11, 4, 176, 5, 12, 20, 11, 32, 1, 32, 2, 253, 11, 4, 192, 5, 12, 19, 11, 32, 1, 32, 2, 253, 11, 4, 208, 5, 12, 18, 11, 32, 1, 32, 2, 253, 11, 4, 224, 5, 12, 17, 11, 32, 1, 32, 2, 253, 11, 4, 240, 5, 12, 16, 11, 32, 1, 32, 2, 253, 11, 4, 128, 6, 12, 15, 11, 32, 1, 32, 2, 253, 11, 4, 144, 6, 12, 14, 11, 32, 1, 32, 2, 253, 11, 4, 160, 6, 12, 13, 11, 32, 1, 32, 2, 253, 11, 4, 176, 6, 12, 12, 11, 32, 1, 32, 2, 253, 11, 4, 192, 6, 12, 11, 11, 32, 1, 32, 2, 253, 11, 4, 208, 6, 12, 10, 11, 32, 1, 32, 2, 253, 11, 4, 224, 6, 12, 9, 11, 32, 1, 32, 2, 253, 11, 4, 240, 6, 12, 8, 11, 32, 1, 32, 2, 253, 11, 4, 128, 7, 12, 7, 11, 32, 1, 32, 2, 253, 11, 4, 144, 7, 12, 6, 11, 32, 1, 32, 2, 253, 11, 4, 160, 7, 12, 5, 11, 32, 1, 32, 2, 253, 11, 4, 176, 7, 12, 4, 11, 32, 1, 32, 2, 253, 11, 4, 192, 7, 12, 3, 11, 32, 1, 32, 2, 253, 11, 4, 208, 7, 12, 2, 11, 32, 1, 32, 2, 253, 11, 4, 224, 7, 12, 1, 11, 32, 1, 32, 2, 253, 11, 4, 240, 7, 11, 32, 0, 65, 1, 106, 33, 0, 12, 1, 11, 11, 65, 128, 8, 16, 11, 36, 25, 35, 25, 36, 26, 65, 0, 33, 0, 3, 64, 32, 0, 65, 192, 0, 72, 4, 64, 35, 26, 33, 1, 65, 144, 13, 32, 0, 16, 12, 253, 17, 33, 2, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 32, 0, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 67, 11, 32, 1, 32, 2, 253, 11, 4, 0, 12, 63, 11, 32, 1, 32, 2, 253, 11, 4, 16, 12, 62, 11, 32, 1, 32, 2, 253, 11, 4, 32, 12, 61, 11, 32, 1, 32, 2, 253, 11, 4, 48, 12, 60, 11, 32, 1, 32, 2, 253, 11, 4, 64, 12, 59, 11, 32, 1, 32, 2, 253, 11, 4, 80, 12, 58, 11, 32, 1, 32, 2, 253, 11, 4, 96, 12, 57, 11, 32, 1, 32, 2, 253, 11, 4, 112, 12, 56, 11, 32, 1, 32, 2, 253, 11, 4, 128, 1, 12, 55, 11, 32, 1, 32, 2, 253, 11, 4, 144, 1, 12, 54, 11, 32, 1, 32, 2, 253, 11, 4, 160, 1, 12, 53, 11, 32, 1, 32, 2, 253, 11, 4, 176, 1, 12, 52, 11, 32, 1, 32, 2, 253, 11, 4, 192, 1, 12, 51, 11, 32, 1, 32, 2, 253, 11, 4, 208, 1, 12, 50, 11, 32, 1, 32, 2, 253, 11, 4, 224, 1, 12, 49, 11, 32, 1, 32, 2, 253, 11, 4, 240, 1, 12, 48, 11, 32, 1, 32, 2, 253, 11, 4, 128, 2, 12, 47, 11, 32, 1, 32, 2, 253, 11, 4, 144, 2, 12, 46, 11, 32, 1, 32, 2, 253, 11, 4, 160, 2, 12, 45, 11, 32, 1, 32, 2, 253, 11, 4, 176, 2, 12, 44, 11, 32, 1, 32, 2, 253, 11, 4, 192, 2, 12, 43, 11, 32, 1, 32, 2, 253, 11, 4, 208, 2, 12, 42, 11, 32, 1, 32, 2, 253, 11, 4, 224, 2, 12, 41, 11, 32, 1, 32, 2, 253, 11, 4, 240, 2, 12, 40, 11, 32, 1, 32, 2, 253, 11, 4, 128, 3, 12, 39, 11, 32, 1, 32, 2, 253, 11, 4, 144, 3, 12, 38, 11, 32, 1, 32, 2, 253, 11, 4, 160, 3, 12, 37, 11, 32, 1, 32, 2, 253, 11, 4, 176, 3, 12, 36, 11, 32, 1, 32, 2, 253, 11, 4, 192, 3, 12, 35, 11, 32, 1, 32, 2, 253, 11, 4, 208, 3, 12, 34, 11, 32, 1, 32, 2, 253, 11, 4, 224, 3, 12, 33, 11, 32, 1, 32, 2, 253, 11, 4, 240, 3, 12, 32, 11, 32, 1, 32, 2, 253, 11, 4, 128, 4, 12, 31, 11, 32, 1, 32, 2, 253, 11, 4, 144, 4, 12, 30, 11, 32, 1, 32, 2, 253, 11, 4, 160, 4, 12, 29, 11, 32, 1, 32, 2, 253, 11, 4, 176, 4, 12, 28, 11, 32, 1, 32, 2, 253, 11, 4, 192, 4, 12, 27, 11, 32, 1, 32, 2, 253, 11, 4, 208, 4, 12, 26, 11, 32, 1, 32, 2, 253, 11, 4, 224, 4, 12, 25, 11, 32, 1, 32, 2, 253, 11, 4, 240, 4, 12, 24, 11, 32, 1, 32, 2, 253, 11, 4, 128, 5, 12, 23, 11, 32, 1, 32, 2, 253, 11, 4, 144, 5, 12, 22, 11, 32, 1, 32, 2, 253, 11, 4, 160, 5, 12, 21, 11, 32, 1, 32, 2, 253, 11, 4, 176, 5, 12, 20, 11, 32, 1, 32, 2, 253, 11, 4, 192, 5, 12, 19, 11, 32, 1, 32, 2, 253, 11, 4, 208, 5, 12, 18, 11, 32, 1, 32, 2, 253, 11, 4, 224, 5, 12, 17, 11, 32, 1, 32, 2, 253, 11, 4, 240, 5, 12, 16, 11, 32, 1, 32, 2, 253, 11, 4, 128, 6, 12, 15, 11, 32, 1, 32, 2, 253, 11, 4, 144, 6, 12, 14, 11, 32, 1, 32, 2, 253, 11, 4, 160, 6, 12, 13, 11, 32, 1, 32, 2, 253, 11, 4, 176, 6, 12, 12, 11, 32, 1, 32, 2, 253, 11, 4, 192, 6, 12, 11, 11, 32, 1, 32, 2, 253, 11, 4, 208, 6, 12, 10, 11, 32, 1, 32, 2, 253, 11, 4, 224, 6, 12, 9, 11, 32, 1, 32, 2, 253, 11, 4, 240, 6, 12, 8, 11, 32, 1, 32, 2, 253, 11, 4, 128, 7, 12, 7, 11, 32, 1, 32, 2, 253, 11, 4, 144, 7, 12, 6, 11, 32, 1, 32, 2, 253, 11, 4, 160, 7, 12, 5, 11, 32, 1, 32, 2, 253, 11, 4, 176, 7, 12, 4, 11, 32, 1, 32, 2, 253, 11, 4, 192, 7, 12, 3, 11, 32, 1, 32, 2, 253, 11, 4, 208, 7, 12, 2, 11, 32, 1, 32, 2, 253, 11, 4, 224, 7, 12, 1, 11, 32, 1, 32, 2, 253, 11, 4, 240, 7, 11, 32, 0, 65, 1, 106, 33, 0, 12, 1, 11, 11, 15, 11, 65, 192, 19, 32, 0, 16, 13, 16, 15, 65, 192, 20, 65, 201, 1, 65, 7, 16, 0, 0, 11, 192, 10, 2, 2, 123, 2, 127, 35, 0, 36, 8, 35, 1, 36, 9, 35, 2, 36, 10, 35, 3, 36, 11, 35, 4, 36, 12, 35, 5, 36, 13, 35, 6, 36, 14, 35, 7, 36, 15, 65, 0, 36, 18, 3, 64, 35, 18, 65, 192, 0, 72, 4, 64, 35, 15, 35, 12, 34, 0, 65, 6, 253, 173, 1, 32, 0, 65, 26, 253, 171, 1, 253, 80, 32, 0, 65, 11, 253, 173, 1, 32, 0, 65, 21, 253, 171, 1, 253, 80, 253, 81, 32, 0, 65, 25, 253, 173, 1, 32, 0, 65, 7, 253, 171, 1, 253, 80, 253, 81, 253, 174, 1, 35, 12, 34, 0, 35, 13, 253, 78, 32, 0, 253, 77, 35, 14, 253, 78, 253, 81, 253, 174, 1, 33, 1, 35, 26, 33, 2, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 35, 18, 34, 3, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 11, 32, 2, 253, 0, 4, 0, 33, 0, 12, 64, 11, 32, 2, 253, 0, 4, 16, 33, 0, 12, 63, 11, 32, 2, 253, 0, 4, 32, 33, 0, 12, 62, 11, 32, 2, 253, 0, 4, 48, 33, 0, 12, 61, 11, 32, 2, 253, 0, 4, 64, 33, 0, 12, 60, 11, 32, 2, 253, 0, 4, 80, 33, 0, 12, 59, 11, 32, 2, 253, 0, 4, 96, 33, 0, 12, 58, 11, 32, 2, 253, 0, 4, 112, 33, 0, 12, 57, 11, 32, 2, 253, 0, 4, 128, 1, 33, 0, 12, 56, 11, 32, 2, 253, 0, 4, 144, 1, 33, 0, 12, 55, 11, 32, 2, 253, 0, 4, 160, 1, 33, 0, 12, 54, 11, 32, 2, 253, 0, 4, 176, 1, 33, 0, 12, 53, 11, 32, 2, 253, 0, 4, 192, 1, 33, 0, 12, 52, 11, 32, 2, 253, 0, 4, 208, 1, 33, 0, 12, 51, 11, 32, 2, 253, 0, 4, 224, 1, 33, 0, 12, 50, 11, 32, 2, 253, 0, 4, 240, 1, 33, 0, 12, 49, 11, 32, 2, 253, 0, 4, 128, 2, 33, 0, 12, 48, 11, 32, 2, 253, 0, 4, 144, 2, 33, 0, 12, 47, 11, 32, 2, 253, 0, 4, 160, 2, 33, 0, 12, 46, 11, 32, 2, 253, 0, 4, 176, 2, 33, 0, 12, 45, 11, 32, 2, 253, 0, 4, 192, 2, 33, 0, 12, 44, 11, 32, 2, 253, 0, 4, 208, 2, 33, 0, 12, 43, 11, 32, 2, 253, 0, 4, 224, 2, 33, 0, 12, 42, 11, 32, 2, 253, 0, 4, 240, 2, 33, 0, 12, 41, 11, 32, 2, 253, 0, 4, 128, 3, 33, 0, 12, 40, 11, 32, 2, 253, 0, 4, 144, 3, 33, 0, 12, 39, 11, 32, 2, 253, 0, 4, 160, 3, 33, 0, 12, 38, 11, 32, 2, 253, 0, 4, 176, 3, 33, 0, 12, 37, 11, 32, 2, 253, 0, 4, 192, 3, 33, 0, 12, 36, 11, 32, 2, 253, 0, 4, 208, 3, 33, 0, 12, 35, 11, 32, 2, 253, 0, 4, 224, 3, 33, 0, 12, 34, 11, 32, 2, 253, 0, 4, 240, 3, 33, 0, 12, 33, 11, 32, 2, 253, 0, 4, 128, 4, 33, 0, 12, 32, 11, 32, 2, 253, 0, 4, 144, 4, 33, 0, 12, 31, 11, 32, 2, 253, 0, 4, 160, 4, 33, 0, 12, 30, 11, 32, 2, 253, 0, 4, 176, 4, 33, 0, 12, 29, 11, 32, 2, 253, 0, 4, 192, 4, 33, 0, 12, 28, 11, 32, 2, 253, 0, 4, 208, 4, 33, 0, 12, 27, 11, 32, 2, 253, 0, 4, 224, 4, 33, 0, 12, 26, 11, 32, 2, 253, 0, 4, 240, 4, 33, 0, 12, 25, 11, 32, 2, 253, 0, 4, 128, 5, 33, 0, 12, 24, 11, 32, 2, 253, 0, 4, 144, 5, 33, 0, 12, 23, 11, 32, 2, 253, 0, 4, 160, 5, 33, 0, 12, 22, 11, 32, 2, 253, 0, 4, 176, 5, 33, 0, 12, 21, 11, 32, 2, 253, 0, 4, 192, 5, 33, 0, 12, 20, 11, 32, 2, 253, 0, 4, 208, 5, 33, 0, 12, 19, 11, 32, 2, 253, 0, 4, 224, 5, 33, 0, 12, 18, 11, 32, 2, 253, 0, 4, 240, 5, 33, 0, 12, 17, 11, 32, 2, 253, 0, 4, 128, 6, 33, 0, 12, 16, 11, 32, 2, 253, 0, 4, 144, 6, 33, 0, 12, 15, 11, 32, 2, 253, 0, 4, 160, 6, 33, 0, 12, 14, 11, 32, 2, 253, 0, 4, 176, 6, 33, 0, 12, 13, 11, 32, 2, 253, 0, 4, 192, 6, 33, 0, 12, 12, 11, 32, 2, 253, 0, 4, 208, 6, 33, 0, 12, 11, 11, 32, 2, 253, 0, 4, 224, 6, 33, 0, 12, 10, 11, 32, 2, 253, 0, 4, 240, 6, 33, 0, 12, 9, 11, 32, 2, 253, 0, 4, 128, 7, 33, 0, 12, 8, 11, 32, 2, 253, 0, 4, 144, 7, 33, 0, 12, 7, 11, 32, 2, 253, 0, 4, 160, 7, 33, 0, 12, 6, 11, 32, 2, 253, 0, 4, 176, 7, 33, 0, 12, 5, 11, 32, 2, 253, 0, 4, 192, 7, 33, 0, 12, 4, 11, 32, 2, 253, 0, 4, 208, 7, 33, 0, 12, 3, 11, 32, 2, 253, 0, 4, 224, 7, 33, 0, 12, 2, 11, 32, 2, 253, 0, 4, 240, 7, 33, 0, 12, 1, 11, 65, 128, 21, 32, 3, 16, 13, 16, 15, 65, 192, 20, 65, 213, 2, 65, 7, 16, 0, 0, 11, 32, 1, 32, 0, 253, 174, 1, 36, 16, 35, 8, 34, 0, 65, 2, 253, 173, 1, 32, 0, 65, 30, 253, 171, 1, 253, 80, 32, 0, 65, 13, 253, 173, 1, 32, 0, 65, 19, 253, 171, 1, 253, 80, 253, 81, 32, 0, 65, 22, 253, 173, 1, 32, 0, 65, 10, 253, 171, 1, 253, 80, 253, 81, 35, 8, 34, 0, 35, 9, 34, 1, 253, 78, 32, 0, 35, 10, 34, 0, 253, 78, 253, 81, 32, 1, 32, 0, 253, 78, 253, 81, 253, 174, 1, 36, 17, 35, 14, 36, 15, 35, 13, 36, 14, 35, 12, 36, 13, 35, 11, 35, 16, 253, 174, 1, 36, 12, 35, 10, 36, 11, 35, 9, 36, 10, 35, 8, 36, 9, 35, 16, 35, 17, 253, 174, 1, 36, 8, 35, 18, 65, 1, 106, 36, 18, 12, 1, 11, 11, 35, 0, 35, 8, 253, 174, 1, 36, 0, 35, 1, 35, 9, 253, 174, 1, 36, 1, 35, 2, 35, 10, 253, 174, 1, 36, 2, 35, 3, 35, 11, 253, 174, 1, 36, 3, 35, 4, 35, 12, 253, 174, 1, 36, 4, 35, 5, 35, 13, 253, 174, 1, 36, 5, 35, 6, 35, 14, 253, 174, 1, 36, 6, 35, 7, 35, 15, 253, 174, 1, 36, 7, 11, 25, 0, 32, 0, 65, 128, 254, 131, 120, 113, 65, 8, 119, 32, 0, 65, 255, 129, 252, 7, 113, 65, 8, 120, 114, 11, 157, 57, 2, 2, 123, 2, 127, 253, 12, 103, 230, 9, 106, 103, 230, 9, 106, 103, 230, 9, 106, 103, 230, 9, 106, 36, 0, 253, 12, 133, 174, 103, 187, 133, 174, 103, 187, 133, 174, 103, 187, 133, 174, 103, 187, 36, 1, 253, 12, 114, 243, 110, 60, 114, 243, 110, 60, 114, 243, 110, 60, 114, 243, 110, 60, 36, 2, 253, 12, 58, 245, 79, 165, 58, 245, 79, 165, 58, 245, 79, 165, 58, 245, 79, 165, 36, 3, 253, 12, 127, 82, 14, 81, 127, 82, 14, 81, 127, 82, 14, 81, 127, 82, 14, 81, 36, 4, 253, 12, 140, 104, 5, 155, 140, 104, 5, 155, 140, 104, 5, 155, 140, 104, 5, 155, 36, 5, 253, 12, 171, 217, 131, 31, 171, 217, 131, 31, 171, 217, 131, 31, 171, 217, 131, 31, 36, 6, 253, 12, 25, 205, 224, 91, 25, 205, 224, 91, 25, 205, 224, 91, 25, 205, 224, 91, 36, 7, 253, 12, 103, 230, 9, 106, 103, 230, 9, 106, 103, 230, 9, 106, 103, 230, 9, 106, 36, 8, 253, 12, 133, 174, 103, 187, 133, 174, 103, 187, 133, 174, 103, 187, 133, 174, 103, 187, 36, 9, 253, 12, 114, 243, 110, 60, 114, 243, 110, 60, 114, 243, 110, 60, 114, 243, 110, 60, 36, 10, 253, 12, 58, 245, 79, 165, 58, 245, 79, 165, 58, 245, 79, 165, 58, 245, 79, 165, 36, 11, 253, 12, 127, 82, 14, 81, 127, 82, 14, 81, 127, 82, 14, 81, 127, 82, 14, 81, 36, 12, 253, 12, 140, 104, 5, 155, 140, 104, 5, 155, 140, 104, 5, 155, 140, 104, 5, 155, 36, 13, 253, 12, 171, 217, 131, 31, 171, 217, 131, 31, 171, 217, 131, 31, 171, 217, 131, 31, 36, 14, 253, 12, 25, 205, 224, 91, 25, 205, 224, 91, 25, 205, 224, 91, 25, 205, 224, 91, 36, 15, 65, 0, 36, 18, 2, 64, 3, 64, 35, 18, 65, 192, 0, 72, 4, 64, 35, 18, 65, 16, 72, 4, 123, 2, 123, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 35, 18, 34, 4, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 68, 11, 32, 0, 253, 0, 4, 0, 12, 63, 11, 32, 0, 253, 0, 4, 16, 12, 62, 11, 32, 0, 253, 0, 4, 32, 12, 61, 11, 32, 0, 253, 0, 4, 48, 12, 60, 11, 32, 0, 253, 0, 4, 64, 12, 59, 11, 32, 0, 253, 0, 4, 80, 12, 58, 11, 32, 0, 253, 0, 4, 96, 12, 57, 11, 32, 0, 253, 0, 4, 112, 12, 56, 11, 32, 0, 253, 0, 4, 128, 1, 12, 55, 11, 32, 0, 253, 0, 4, 144, 1, 12, 54, 11, 32, 0, 253, 0, 4, 160, 1, 12, 53, 11, 32, 0, 253, 0, 4, 176, 1, 12, 52, 11, 32, 0, 253, 0, 4, 192, 1, 12, 51, 11, 32, 0, 253, 0, 4, 208, 1, 12, 50, 11, 32, 0, 253, 0, 4, 224, 1, 12, 49, 11, 32, 0, 253, 0, 4, 240, 1, 12, 48, 11, 32, 0, 253, 0, 4, 128, 2, 12, 47, 11, 32, 0, 253, 0, 4, 144, 2, 12, 46, 11, 32, 0, 253, 0, 4, 160, 2, 12, 45, 11, 32, 0, 253, 0, 4, 176, 2, 12, 44, 11, 32, 0, 253, 0, 4, 192, 2, 12, 43, 11, 32, 0, 253, 0, 4, 208, 2, 12, 42, 11, 32, 0, 253, 0, 4, 224, 2, 12, 41, 11, 32, 0, 253, 0, 4, 240, 2, 12, 40, 11, 32, 0, 253, 0, 4, 128, 3, 12, 39, 11, 32, 0, 253, 0, 4, 144, 3, 12, 38, 11, 32, 0, 253, 0, 4, 160, 3, 12, 37, 11, 32, 0, 253, 0, 4, 176, 3, 12, 36, 11, 32, 0, 253, 0, 4, 192, 3, 12, 35, 11, 32, 0, 253, 0, 4, 208, 3, 12, 34, 11, 32, 0, 253, 0, 4, 224, 3, 12, 33, 11, 32, 0, 253, 0, 4, 240, 3, 12, 32, 11, 32, 0, 253, 0, 4, 128, 4, 12, 31, 11, 32, 0, 253, 0, 4, 144, 4, 12, 30, 11, 32, 0, 253, 0, 4, 160, 4, 12, 29, 11, 32, 0, 253, 0, 4, 176, 4, 12, 28, 11, 32, 0, 253, 0, 4, 192, 4, 12, 27, 11, 32, 0, 253, 0, 4, 208, 4, 12, 26, 11, 32, 0, 253, 0, 4, 224, 4, 12, 25, 11, 32, 0, 253, 0, 4, 240, 4, 12, 24, 11, 32, 0, 253, 0, 4, 128, 5, 12, 23, 11, 32, 0, 253, 0, 4, 144, 5, 12, 22, 11, 32, 0, 253, 0, 4, 160, 5, 12, 21, 11, 32, 0, 253, 0, 4, 176, 5, 12, 20, 11, 32, 0, 253, 0, 4, 192, 5, 12, 19, 11, 32, 0, 253, 0, 4, 208, 5, 12, 18, 11, 32, 0, 253, 0, 4, 224, 5, 12, 17, 11, 32, 0, 253, 0, 4, 240, 5, 12, 16, 11, 32, 0, 253, 0, 4, 128, 6, 12, 15, 11, 32, 0, 253, 0, 4, 144, 6, 12, 14, 11, 32, 0, 253, 0, 4, 160, 6, 12, 13, 11, 32, 0, 253, 0, 4, 176, 6, 12, 12, 11, 32, 0, 253, 0, 4, 192, 6, 12, 11, 11, 32, 0, 253, 0, 4, 208, 6, 12, 10, 11, 32, 0, 253, 0, 4, 224, 6, 12, 9, 11, 32, 0, 253, 0, 4, 240, 6, 12, 8, 11, 32, 0, 253, 0, 4, 128, 7, 12, 7, 11, 32, 0, 253, 0, 4, 144, 7, 12, 6, 11, 32, 0, 253, 0, 4, 160, 7, 12, 5, 11, 32, 0, 253, 0, 4, 176, 7, 12, 4, 11, 32, 0, 253, 0, 4, 192, 7, 12, 3, 11, 32, 0, 253, 0, 4, 208, 7, 12, 2, 11, 32, 0, 253, 0, 4, 224, 7, 12, 1, 11, 32, 0, 253, 0, 4, 240, 7, 11, 5, 2, 123, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 35, 18, 65, 2, 107, 34, 4, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 68, 11, 32, 0, 253, 0, 4, 0, 12, 63, 11, 32, 0, 253, 0, 4, 16, 12, 62, 11, 32, 0, 253, 0, 4, 32, 12, 61, 11, 32, 0, 253, 0, 4, 48, 12, 60, 11, 32, 0, 253, 0, 4, 64, 12, 59, 11, 32, 0, 253, 0, 4, 80, 12, 58, 11, 32, 0, 253, 0, 4, 96, 12, 57, 11, 32, 0, 253, 0, 4, 112, 12, 56, 11, 32, 0, 253, 0, 4, 128, 1, 12, 55, 11, 32, 0, 253, 0, 4, 144, 1, 12, 54, 11, 32, 0, 253, 0, 4, 160, 1, 12, 53, 11, 32, 0, 253, 0, 4, 176, 1, 12, 52, 11, 32, 0, 253, 0, 4, 192, 1, 12, 51, 11, 32, 0, 253, 0, 4, 208, 1, 12, 50, 11, 32, 0, 253, 0, 4, 224, 1, 12, 49, 11, 32, 0, 253, 0, 4, 240, 1, 12, 48, 11, 32, 0, 253, 0, 4, 128, 2, 12, 47, 11, 32, 0, 253, 0, 4, 144, 2, 12, 46, 11, 32, 0, 253, 0, 4, 160, 2, 12, 45, 11, 32, 0, 253, 0, 4, 176, 2, 12, 44, 11, 32, 0, 253, 0, 4, 192, 2, 12, 43, 11, 32, 0, 253, 0, 4, 208, 2, 12, 42, 11, 32, 0, 253, 0, 4, 224, 2, 12, 41, 11, 32, 0, 253, 0, 4, 240, 2, 12, 40, 11, 32, 0, 253, 0, 4, 128, 3, 12, 39, 11, 32, 0, 253, 0, 4, 144, 3, 12, 38, 11, 32, 0, 253, 0, 4, 160, 3, 12, 37, 11, 32, 0, 253, 0, 4, 176, 3, 12, 36, 11, 32, 0, 253, 0, 4, 192, 3, 12, 35, 11, 32, 0, 253, 0, 4, 208, 3, 12, 34, 11, 32, 0, 253, 0, 4, 224, 3, 12, 33, 11, 32, 0, 253, 0, 4, 240, 3, 12, 32, 11, 32, 0, 253, 0, 4, 128, 4, 12, 31, 11, 32, 0, 253, 0, 4, 144, 4, 12, 30, 11, 32, 0, 253, 0, 4, 160, 4, 12, 29, 11, 32, 0, 253, 0, 4, 176, 4, 12, 28, 11, 32, 0, 253, 0, 4, 192, 4, 12, 27, 11, 32, 0, 253, 0, 4, 208, 4, 12, 26, 11, 32, 0, 253, 0, 4, 224, 4, 12, 25, 11, 32, 0, 253, 0, 4, 240, 4, 12, 24, 11, 32, 0, 253, 0, 4, 128, 5, 12, 23, 11, 32, 0, 253, 0, 4, 144, 5, 12, 22, 11, 32, 0, 253, 0, 4, 160, 5, 12, 21, 11, 32, 0, 253, 0, 4, 176, 5, 12, 20, 11, 32, 0, 253, 0, 4, 192, 5, 12, 19, 11, 32, 0, 253, 0, 4, 208, 5, 12, 18, 11, 32, 0, 253, 0, 4, 224, 5, 12, 17, 11, 32, 0, 253, 0, 4, 240, 5, 12, 16, 11, 32, 0, 253, 0, 4, 128, 6, 12, 15, 11, 32, 0, 253, 0, 4, 144, 6, 12, 14, 11, 32, 0, 253, 0, 4, 160, 6, 12, 13, 11, 32, 0, 253, 0, 4, 176, 6, 12, 12, 11, 32, 0, 253, 0, 4, 192, 6, 12, 11, 11, 32, 0, 253, 0, 4, 208, 6, 12, 10, 11, 32, 0, 253, 0, 4, 224, 6, 12, 9, 11, 32, 0, 253, 0, 4, 240, 6, 12, 8, 11, 32, 0, 253, 0, 4, 128, 7, 12, 7, 11, 32, 0, 253, 0, 4, 144, 7, 12, 6, 11, 32, 0, 253, 0, 4, 160, 7, 12, 5, 11, 32, 0, 253, 0, 4, 176, 7, 12, 4, 11, 32, 0, 253, 0, 4, 192, 7, 12, 3, 11, 32, 0, 253, 0, 4, 208, 7, 12, 2, 11, 32, 0, 253, 0, 4, 224, 7, 12, 1, 11, 32, 0, 253, 0, 4, 240, 7, 11, 34, 2, 65, 17, 253, 173, 1, 32, 2, 65, 15, 253, 171, 1, 253, 80, 32, 2, 65, 19, 253, 173, 1, 32, 2, 65, 13, 253, 171, 1, 253, 80, 253, 81, 32, 2, 65, 10, 253, 173, 1, 253, 81, 2, 123, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 35, 18, 65, 7, 107, 34, 4, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 68, 11, 32, 0, 253, 0, 4, 0, 12, 63, 11, 32, 0, 253, 0, 4, 16, 12, 62, 11, 32, 0, 253, 0, 4, 32, 12, 61, 11, 32, 0, 253, 0, 4, 48, 12, 60, 11, 32, 0, 253, 0, 4, 64, 12, 59, 11, 32, 0, 253, 0, 4, 80, 12, 58, 11, 32, 0, 253, 0, 4, 96, 12, 57, 11, 32, 0, 253, 0, 4, 112, 12, 56, 11, 32, 0, 253, 0, 4, 128, 1, 12, 55, 11, 32, 0, 253, 0, 4, 144, 1, 12, 54, 11, 32, 0, 253, 0, 4, 160, 1, 12, 53, 11, 32, 0, 253, 0, 4, 176, 1, 12, 52, 11, 32, 0, 253, 0, 4, 192, 1, 12, 51, 11, 32, 0, 253, 0, 4, 208, 1, 12, 50, 11, 32, 0, 253, 0, 4, 224, 1, 12, 49, 11, 32, 0, 253, 0, 4, 240, 1, 12, 48, 11, 32, 0, 253, 0, 4, 128, 2, 12, 47, 11, 32, 0, 253, 0, 4, 144, 2, 12, 46, 11, 32, 0, 253, 0, 4, 160, 2, 12, 45, 11, 32, 0, 253, 0, 4, 176, 2, 12, 44, 11, 32, 0, 253, 0, 4, 192, 2, 12, 43, 11, 32, 0, 253, 0, 4, 208, 2, 12, 42, 11, 32, 0, 253, 0, 4, 224, 2, 12, 41, 11, 32, 0, 253, 0, 4, 240, 2, 12, 40, 11, 32, 0, 253, 0, 4, 128, 3, 12, 39, 11, 32, 0, 253, 0, 4, 144, 3, 12, 38, 11, 32, 0, 253, 0, 4, 160, 3, 12, 37, 11, 32, 0, 253, 0, 4, 176, 3, 12, 36, 11, 32, 0, 253, 0, 4, 192, 3, 12, 35, 11, 32, 0, 253, 0, 4, 208, 3, 12, 34, 11, 32, 0, 253, 0, 4, 224, 3, 12, 33, 11, 32, 0, 253, 0, 4, 240, 3, 12, 32, 11, 32, 0, 253, 0, 4, 128, 4, 12, 31, 11, 32, 0, 253, 0, 4, 144, 4, 12, 30, 11, 32, 0, 253, 0, 4, 160, 4, 12, 29, 11, 32, 0, 253, 0, 4, 176, 4, 12, 28, 11, 32, 0, 253, 0, 4, 192, 4, 12, 27, 11, 32, 0, 253, 0, 4, 208, 4, 12, 26, 11, 32, 0, 253, 0, 4, 224, 4, 12, 25, 11, 32, 0, 253, 0, 4, 240, 4, 12, 24, 11, 32, 0, 253, 0, 4, 128, 5, 12, 23, 11, 32, 0, 253, 0, 4, 144, 5, 12, 22, 11, 32, 0, 253, 0, 4, 160, 5, 12, 21, 11, 32, 0, 253, 0, 4, 176, 5, 12, 20, 11, 32, 0, 253, 0, 4, 192, 5, 12, 19, 11, 32, 0, 253, 0, 4, 208, 5, 12, 18, 11, 32, 0, 253, 0, 4, 224, 5, 12, 17, 11, 32, 0, 253, 0, 4, 240, 5, 12, 16, 11, 32, 0, 253, 0, 4, 128, 6, 12, 15, 11, 32, 0, 253, 0, 4, 144, 6, 12, 14, 11, 32, 0, 253, 0, 4, 160, 6, 12, 13, 11, 32, 0, 253, 0, 4, 176, 6, 12, 12, 11, 32, 0, 253, 0, 4, 192, 6, 12, 11, 11, 32, 0, 253, 0, 4, 208, 6, 12, 10, 11, 32, 0, 253, 0, 4, 224, 6, 12, 9, 11, 32, 0, 253, 0, 4, 240, 6, 12, 8, 11, 32, 0, 253, 0, 4, 128, 7, 12, 7, 11, 32, 0, 253, 0, 4, 144, 7, 12, 6, 11, 32, 0, 253, 0, 4, 160, 7, 12, 5, 11, 32, 0, 253, 0, 4, 176, 7, 12, 4, 11, 32, 0, 253, 0, 4, 192, 7, 12, 3, 11, 32, 0, 253, 0, 4, 208, 7, 12, 2, 11, 32, 0, 253, 0, 4, 224, 7, 12, 1, 11, 32, 0, 253, 0, 4, 240, 7, 11, 253, 174, 1, 2, 123, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 35, 18, 65, 15, 107, 34, 4, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 68, 11, 32, 0, 253, 0, 4, 0, 12, 63, 11, 32, 0, 253, 0, 4, 16, 12, 62, 11, 32, 0, 253, 0, 4, 32, 12, 61, 11, 32, 0, 253, 0, 4, 48, 12, 60, 11, 32, 0, 253, 0, 4, 64, 12, 59, 11, 32, 0, 253, 0, 4, 80, 12, 58, 11, 32, 0, 253, 0, 4, 96, 12, 57, 11, 32, 0, 253, 0, 4, 112, 12, 56, 11, 32, 0, 253, 0, 4, 128, 1, 12, 55, 11, 32, 0, 253, 0, 4, 144, 1, 12, 54, 11, 32, 0, 253, 0, 4, 160, 1, 12, 53, 11, 32, 0, 253, 0, 4, 176, 1, 12, 52, 11, 32, 0, 253, 0, 4, 192, 1, 12, 51, 11, 32, 0, 253, 0, 4, 208, 1, 12, 50, 11, 32, 0, 253, 0, 4, 224, 1, 12, 49, 11, 32, 0, 253, 0, 4, 240, 1, 12, 48, 11, 32, 0, 253, 0, 4, 128, 2, 12, 47, 11, 32, 0, 253, 0, 4, 144, 2, 12, 46, 11, 32, 0, 253, 0, 4, 160, 2, 12, 45, 11, 32, 0, 253, 0, 4, 176, 2, 12, 44, 11, 32, 0, 253, 0, 4, 192, 2, 12, 43, 11, 32, 0, 253, 0, 4, 208, 2, 12, 42, 11, 32, 0, 253, 0, 4, 224, 2, 12, 41, 11, 32, 0, 253, 0, 4, 240, 2, 12, 40, 11, 32, 0, 253, 0, 4, 128, 3, 12, 39, 11, 32, 0, 253, 0, 4, 144, 3, 12, 38, 11, 32, 0, 253, 0, 4, 160, 3, 12, 37, 11, 32, 0, 253, 0, 4, 176, 3, 12, 36, 11, 32, 0, 253, 0, 4, 192, 3, 12, 35, 11, 32, 0, 253, 0, 4, 208, 3, 12, 34, 11, 32, 0, 253, 0, 4, 224, 3, 12, 33, 11, 32, 0, 253, 0, 4, 240, 3, 12, 32, 11, 32, 0, 253, 0, 4, 128, 4, 12, 31, 11, 32, 0, 253, 0, 4, 144, 4, 12, 30, 11, 32, 0, 253, 0, 4, 160, 4, 12, 29, 11, 32, 0, 253, 0, 4, 176, 4, 12, 28, 11, 32, 0, 253, 0, 4, 192, 4, 12, 27, 11, 32, 0, 253, 0, 4, 208, 4, 12, 26, 11, 32, 0, 253, 0, 4, 224, 4, 12, 25, 11, 32, 0, 253, 0, 4, 240, 4, 12, 24, 11, 32, 0, 253, 0, 4, 128, 5, 12, 23, 11, 32, 0, 253, 0, 4, 144, 5, 12, 22, 11, 32, 0, 253, 0, 4, 160, 5, 12, 21, 11, 32, 0, 253, 0, 4, 176, 5, 12, 20, 11, 32, 0, 253, 0, 4, 192, 5, 12, 19, 11, 32, 0, 253, 0, 4, 208, 5, 12, 18, 11, 32, 0, 253, 0, 4, 224, 5, 12, 17, 11, 32, 0, 253, 0, 4, 240, 5, 12, 16, 11, 32, 0, 253, 0, 4, 128, 6, 12, 15, 11, 32, 0, 253, 0, 4, 144, 6, 12, 14, 11, 32, 0, 253, 0, 4, 160, 6, 12, 13, 11, 32, 0, 253, 0, 4, 176, 6, 12, 12, 11, 32, 0, 253, 0, 4, 192, 6, 12, 11, 11, 32, 0, 253, 0, 4, 208, 6, 12, 10, 11, 32, 0, 253, 0, 4, 224, 6, 12, 9, 11, 32, 0, 253, 0, 4, 240, 6, 12, 8, 11, 32, 0, 253, 0, 4, 128, 7, 12, 7, 11, 32, 0, 253, 0, 4, 144, 7, 12, 6, 11, 32, 0, 253, 0, 4, 160, 7, 12, 5, 11, 32, 0, 253, 0, 4, 176, 7, 12, 4, 11, 32, 0, 253, 0, 4, 192, 7, 12, 3, 11, 32, 0, 253, 0, 4, 208, 7, 12, 2, 11, 32, 0, 253, 0, 4, 224, 7, 12, 1, 11, 32, 0, 253, 0, 4, 240, 7, 11, 34, 2, 65, 7, 253, 173, 1, 32, 2, 65, 25, 253, 171, 1, 253, 80, 32, 2, 65, 18, 253, 173, 1, 32, 2, 65, 14, 253, 171, 1, 253, 80, 253, 81, 32, 2, 65, 3, 253, 173, 1, 253, 81, 253, 174, 1, 2, 123, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 35, 18, 65, 16, 107, 34, 4, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 68, 11, 32, 0, 253, 0, 4, 0, 12, 63, 11, 32, 0, 253, 0, 4, 16, 12, 62, 11, 32, 0, 253, 0, 4, 32, 12, 61, 11, 32, 0, 253, 0, 4, 48, 12, 60, 11, 32, 0, 253, 0, 4, 64, 12, 59, 11, 32, 0, 253, 0, 4, 80, 12, 58, 11, 32, 0, 253, 0, 4, 96, 12, 57, 11, 32, 0, 253, 0, 4, 112, 12, 56, 11, 32, 0, 253, 0, 4, 128, 1, 12, 55, 11, 32, 0, 253, 0, 4, 144, 1, 12, 54, 11, 32, 0, 253, 0, 4, 160, 1, 12, 53, 11, 32, 0, 253, 0, 4, 176, 1, 12, 52, 11, 32, 0, 253, 0, 4, 192, 1, 12, 51, 11, 32, 0, 253, 0, 4, 208, 1, 12, 50, 11, 32, 0, 253, 0, 4, 224, 1, 12, 49, 11, 32, 0, 253, 0, 4, 240, 1, 12, 48, 11, 32, 0, 253, 0, 4, 128, 2, 12, 47, 11, 32, 0, 253, 0, 4, 144, 2, 12, 46, 11, 32, 0, 253, 0, 4, 160, 2, 12, 45, 11, 32, 0, 253, 0, 4, 176, 2, 12, 44, 11, 32, 0, 253, 0, 4, 192, 2, 12, 43, 11, 32, 0, 253, 0, 4, 208, 2, 12, 42, 11, 32, 0, 253, 0, 4, 224, 2, 12, 41, 11, 32, 0, 253, 0, 4, 240, 2, 12, 40, 11, 32, 0, 253, 0, 4, 128, 3, 12, 39, 11, 32, 0, 253, 0, 4, 144, 3, 12, 38, 11, 32, 0, 253, 0, 4, 160, 3, 12, 37, 11, 32, 0, 253, 0, 4, 176, 3, 12, 36, 11, 32, 0, 253, 0, 4, 192, 3, 12, 35, 11, 32, 0, 253, 0, 4, 208, 3, 12, 34, 11, 32, 0, 253, 0, 4, 224, 3, 12, 33, 11, 32, 0, 253, 0, 4, 240, 3, 12, 32, 11, 32, 0, 253, 0, 4, 128, 4, 12, 31, 11, 32, 0, 253, 0, 4, 144, 4, 12, 30, 11, 32, 0, 253, 0, 4, 160, 4, 12, 29, 11, 32, 0, 253, 0, 4, 176, 4, 12, 28, 11, 32, 0, 253, 0, 4, 192, 4, 12, 27, 11, 32, 0, 253, 0, 4, 208, 4, 12, 26, 11, 32, 0, 253, 0, 4, 224, 4, 12, 25, 11, 32, 0, 253, 0, 4, 240, 4, 12, 24, 11, 32, 0, 253, 0, 4, 128, 5, 12, 23, 11, 32, 0, 253, 0, 4, 144, 5, 12, 22, 11, 32, 0, 253, 0, 4, 160, 5, 12, 21, 11, 32, 0, 253, 0, 4, 176, 5, 12, 20, 11, 32, 0, 253, 0, 4, 192, 5, 12, 19, 11, 32, 0, 253, 0, 4, 208, 5, 12, 18, 11, 32, 0, 253, 0, 4, 224, 5, 12, 17, 11, 32, 0, 253, 0, 4, 240, 5, 12, 16, 11, 32, 0, 253, 0, 4, 128, 6, 12, 15, 11, 32, 0, 253, 0, 4, 144, 6, 12, 14, 11, 32, 0, 253, 0, 4, 160, 6, 12, 13, 11, 32, 0, 253, 0, 4, 176, 6, 12, 12, 11, 32, 0, 253, 0, 4, 192, 6, 12, 11, 11, 32, 0, 253, 0, 4, 208, 6, 12, 10, 11, 32, 0, 253, 0, 4, 224, 6, 12, 9, 11, 32, 0, 253, 0, 4, 240, 6, 12, 8, 11, 32, 0, 253, 0, 4, 128, 7, 12, 7, 11, 32, 0, 253, 0, 4, 144, 7, 12, 6, 11, 32, 0, 253, 0, 4, 160, 7, 12, 5, 11, 32, 0, 253, 0, 4, 176, 7, 12, 4, 11, 32, 0, 253, 0, 4, 192, 7, 12, 3, 11, 32, 0, 253, 0, 4, 208, 7, 12, 2, 11, 32, 0, 253, 0, 4, 224, 7, 12, 1, 11, 32, 0, 253, 0, 4, 240, 7, 11, 253, 174, 1, 11, 36, 19, 35, 18, 65, 16, 78, 4, 64, 35, 19, 33, 2, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 35, 18, 34, 4, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 11, 32, 0, 32, 2, 253, 11, 4, 0, 12, 64, 11, 32, 0, 32, 2, 253, 11, 4, 16, 12, 63, 11, 32, 0, 32, 2, 253, 11, 4, 32, 12, 62, 11, 32, 0, 32, 2, 253, 11, 4, 48, 12, 61, 11, 32, 0, 32, 2, 253, 11, 4, 64, 12, 60, 11, 32, 0, 32, 2, 253, 11, 4, 80, 12, 59, 11, 32, 0, 32, 2, 253, 11, 4, 96, 12, 58, 11, 32, 0, 32, 2, 253, 11, 4, 112, 12, 57, 11, 32, 0, 32, 2, 253, 11, 4, 128, 1, 12, 56, 11, 32, 0, 32, 2, 253, 11, 4, 144, 1, 12, 55, 11, 32, 0, 32, 2, 253, 11, 4, 160, 1, 12, 54, 11, 32, 0, 32, 2, 253, 11, 4, 176, 1, 12, 53, 11, 32, 0, 32, 2, 253, 11, 4, 192, 1, 12, 52, 11, 32, 0, 32, 2, 253, 11, 4, 208, 1, 12, 51, 11, 32, 0, 32, 2, 253, 11, 4, 224, 1, 12, 50, 11, 32, 0, 32, 2, 253, 11, 4, 240, 1, 12, 49, 11, 32, 0, 32, 2, 253, 11, 4, 128, 2, 12, 48, 11, 32, 0, 32, 2, 253, 11, 4, 144, 2, 12, 47, 11, 32, 0, 32, 2, 253, 11, 4, 160, 2, 12, 46, 11, 32, 0, 32, 2, 253, 11, 4, 176, 2, 12, 45, 11, 32, 0, 32, 2, 253, 11, 4, 192, 2, 12, 44, 11, 32, 0, 32, 2, 253, 11, 4, 208, 2, 12, 43, 11, 32, 0, 32, 2, 253, 11, 4, 224, 2, 12, 42, 11, 32, 0, 32, 2, 253, 11, 4, 240, 2, 12, 41, 11, 32, 0, 32, 2, 253, 11, 4, 128, 3, 12, 40, 11, 32, 0, 32, 2, 253, 11, 4, 144, 3, 12, 39, 11, 32, 0, 32, 2, 253, 11, 4, 160, 3, 12, 38, 11, 32, 0, 32, 2, 253, 11, 4, 176, 3, 12, 37, 11, 32, 0, 32, 2, 253, 11, 4, 192, 3, 12, 36, 11, 32, 0, 32, 2, 253, 11, 4, 208, 3, 12, 35, 11, 32, 0, 32, 2, 253, 11, 4, 224, 3, 12, 34, 11, 32, 0, 32, 2, 253, 11, 4, 240, 3, 12, 33, 11, 32, 0, 32, 2, 253, 11, 4, 128, 4, 12, 32, 11, 32, 0, 32, 2, 253, 11, 4, 144, 4, 12, 31, 11, 32, 0, 32, 2, 253, 11, 4, 160, 4, 12, 30, 11, 32, 0, 32, 2, 253, 11, 4, 176, 4, 12, 29, 11, 32, 0, 32, 2, 253, 11, 4, 192, 4, 12, 28, 11, 32, 0, 32, 2, 253, 11, 4, 208, 4, 12, 27, 11, 32, 0, 32, 2, 253, 11, 4, 224, 4, 12, 26, 11, 32, 0, 32, 2, 253, 11, 4, 240, 4, 12, 25, 11, 32, 0, 32, 2, 253, 11, 4, 128, 5, 12, 24, 11, 32, 0, 32, 2, 253, 11, 4, 144, 5, 12, 23, 11, 32, 0, 32, 2, 253, 11, 4, 160, 5, 12, 22, 11, 32, 0, 32, 2, 253, 11, 4, 176, 5, 12, 21, 11, 32, 0, 32, 2, 253, 11, 4, 192, 5, 12, 20, 11, 32, 0, 32, 2, 253, 11, 4, 208, 5, 12, 19, 11, 32, 0, 32, 2, 253, 11, 4, 224, 5, 12, 18, 11, 32, 0, 32, 2, 253, 11, 4, 240, 5, 12, 17, 11, 32, 0, 32, 2, 253, 11, 4, 128, 6, 12, 16, 11, 32, 0, 32, 2, 253, 11, 4, 144, 6, 12, 15, 11, 32, 0, 32, 2, 253, 11, 4, 160, 6, 12, 14, 11, 32, 0, 32, 2, 253, 11, 4, 176, 6, 12, 13, 11, 32, 0, 32, 2, 253, 11, 4, 192, 6, 12, 12, 11, 32, 0, 32, 2, 253, 11, 4, 208, 6, 12, 11, 11, 32, 0, 32, 2, 253, 11, 4, 224, 6, 12, 10, 11, 32, 0, 32, 2, 253, 11, 4, 240, 6, 12, 9, 11, 32, 0, 32, 2, 253, 11, 4, 128, 7, 12, 8, 11, 32, 0, 32, 2, 253, 11, 4, 144, 7, 12, 7, 11, 32, 0, 32, 2, 253, 11, 4, 160, 7, 12, 6, 11, 32, 0, 32, 2, 253, 11, 4, 176, 7, 12, 5, 11, 32, 0, 32, 2, 253, 11, 4, 192, 7, 12, 4, 11, 32, 0, 32, 2, 253, 11, 4, 208, 7, 12, 3, 11, 32, 0, 32, 2, 253, 11, 4, 224, 7, 12, 2, 11, 32, 0, 32, 2, 253, 11, 4, 240, 7, 12, 1, 11, 65, 192, 19, 32, 4, 16, 13, 16, 15, 65, 192, 20, 65, 201, 1, 65, 7, 16, 0, 0, 11, 11, 35, 15, 35, 12, 34, 2, 65, 6, 253, 173, 1, 32, 2, 65, 26, 253, 171, 1, 253, 80, 32, 2, 65, 11, 253, 173, 1, 32, 2, 65, 21, 253, 171, 1, 253, 80, 253, 81, 32, 2, 65, 25, 253, 173, 1, 32, 2, 65, 7, 253, 171, 1, 253, 80, 253, 81, 253, 174, 1, 35, 12, 34, 2, 35, 13, 253, 78, 32, 2, 253, 77, 35, 14, 253, 78, 253, 81, 253, 174, 1, 33, 3, 35, 24, 33, 4, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 2, 64, 35, 18, 34, 5, 14, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 11, 32, 4, 253, 0, 4, 0, 33, 2, 12, 64, 11, 32, 4, 253, 0, 4, 16, 33, 2, 12, 63, 11, 32, 4, 253, 0, 4, 32, 33, 2, 12, 62, 11, 32, 4, 253, 0, 4, 48, 33, 2, 12, 61, 11, 32, 4, 253, 0, 4, 64, 33, 2, 12, 60, 11, 32, 4, 253, 0, 4, 80, 33, 2, 12, 59, 11, 32, 4, 253, 0, 4, 96, 33, 2, 12, 58, 11, 32, 4, 253, 0, 4, 112, 33, 2, 12, 57, 11, 32, 4, 253, 0, 4, 128, 1, 33, 2, 12, 56, 11, 32, 4, 253, 0, 4, 144, 1, 33, 2, 12, 55, 11, 32, 4, 253, 0, 4, 160, 1, 33, 2, 12, 54, 11, 32, 4, 253, 0, 4, 176, 1, 33, 2, 12, 53, 11, 32, 4, 253, 0, 4, 192, 1, 33, 2, 12, 52, 11, 32, 4, 253, 0, 4, 208, 1, 33, 2, 12, 51, 11, 32, 4, 253, 0, 4, 224, 1, 33, 2, 12, 50, 11, 32, 4, 253, 0, 4, 240, 1, 33, 2, 12, 49, 11, 32, 4, 253, 0, 4, 128, 2, 33, 2, 12, 48, 11, 32, 4, 253, 0, 4, 144, 2, 33, 2, 12, 47, 11, 32, 4, 253, 0, 4, 160, 2, 33, 2, 12, 46, 11, 32, 4, 253, 0, 4, 176, 2, 33, 2, 12, 45, 11, 32, 4, 253, 0, 4, 192, 2, 33, 2, 12, 44, 11, 32, 4, 253, 0, 4, 208, 2, 33, 2, 12, 43, 11, 32, 4, 253, 0, 4, 224, 2, 33, 2, 12, 42, 11, 32, 4, 253, 0, 4, 240, 2, 33, 2, 12, 41, 11, 32, 4, 253, 0, 4, 128, 3, 33, 2, 12, 40, 11, 32, 4, 253, 0, 4, 144, 3, 33, 2, 12, 39, 11, 32, 4, 253, 0, 4, 160, 3, 33, 2, 12, 38, 11, 32, 4, 253, 0, 4, 176, 3, 33, 2, 12, 37, 11, 32, 4, 253, 0, 4, 192, 3, 33, 2, 12, 36, 11, 32, 4, 253, 0, 4, 208, 3, 33, 2, 12, 35, 11, 32, 4, 253, 0, 4, 224, 3, 33, 2, 12, 34, 11, 32, 4, 253, 0, 4, 240, 3, 33, 2, 12, 33, 11, 32, 4, 253, 0, 4, 128, 4, 33, 2, 12, 32, 11, 32, 4, 253, 0, 4, 144, 4, 33, 2, 12, 31, 11, 32, 4, 253, 0, 4, 160, 4, 33, 2, 12, 30, 11, 32, 4, 253, 0, 4, 176, 4, 33, 2, 12, 29, 11, 32, 4, 253, 0, 4, 192, 4, 33, 2, 12, 28, 11, 32, 4, 253, 0, 4, 208, 4, 33, 2, 12, 27, 11, 32, 4, 253, 0, 4, 224, 4, 33, 2, 12, 26, 11, 32, 4, 253, 0, 4, 240, 4, 33, 2, 12, 25, 11, 32, 4, 253, 0, 4, 128, 5, 33, 2, 12, 24, 11, 32, 4, 253, 0, 4, 144, 5, 33, 2, 12, 23, 11, 32, 4, 253, 0, 4, 160, 5, 33, 2, 12, 22, 11, 32, 4, 253, 0, 4, 176, 5, 33, 2, 12, 21, 11, 32, 4, 253, 0, 4, 192, 5, 33, 2, 12, 20, 11, 32, 4, 253, 0, 4, 208, 5, 33, 2, 12, 19, 11, 32, 4, 253, 0, 4, 224, 5, 33, 2, 12, 18, 11, 32, 4, 253, 0, 4, 240, 5, 33, 2, 12, 17, 11, 32, 4, 253, 0, 4, 128, 6, 33, 2, 12, 16, 11, 32, 4, 253, 0, 4, 144, 6, 33, 2, 12, 15, 11, 32, 4, 253, 0, 4, 160, 6, 33, 2, 12, 14, 11, 32, 4, 253, 0, 4, 176, 6, 33, 2, 12, 13, 11, 32, 4, 253, 0, 4, 192, 6, 33, 2, 12, 12, 11, 32, 4, 253, 0, 4, 208, 6, 33, 2, 12, 11, 11, 32, 4, 253, 0, 4, 224, 6, 33, 2, 12, 10, 11, 32, 4, 253, 0, 4, 240, 6, 33, 2, 12, 9, 11, 32, 4, 253, 0, 4, 128, 7, 33, 2, 12, 8, 11, 32, 4, 253, 0, 4, 144, 7, 33, 2, 12, 7, 11, 32, 4, 253, 0, 4, 160, 7, 33, 2, 12, 6, 11, 32, 4, 253, 0, 4, 176, 7, 33, 2, 12, 5, 11, 32, 4, 253, 0, 4, 192, 7, 33, 2, 12, 4, 11, 32, 4, 253, 0, 4, 208, 7, 33, 2, 12, 3, 11, 32, 4, 253, 0, 4, 224, 7, 33, 2, 12, 2, 11, 32, 4, 253, 0, 4, 240, 7, 33, 2, 12, 1, 11, 65, 128, 21, 32, 5, 16, 13, 16, 15, 65, 192, 20, 65, 213, 2, 65, 7, 16, 0, 0, 11, 32, 3, 32, 2, 253, 174, 1, 35, 19, 253, 174, 1, 36, 16, 35, 8, 34, 2, 65, 2, 253, 173, 1, 32, 2, 65, 30, 253, 171, 1, 253, 80, 32, 2, 65, 13, 253, 173, 1, 32, 2, 65, 19, 253, 171, 1, 253, 80, 253, 81, 32, 2, 65, 22, 253, 173, 1, 32, 2, 65, 10, 253, 171, 1, 253, 80, 253, 81, 35, 8, 34, 2, 35, 9, 34, 3, 253, 78, 32, 2, 35, 10, 34, 2, 253, 78, 253, 81, 32, 3, 32, 2, 253, 78, 253, 81, 253, 174, 1, 36, 17, 35, 14, 36, 15, 35, 13, 36, 14, 35, 12, 36, 13, 35, 11, 35, 16, 253, 174, 1, 36, 12, 35, 10, 36, 11, 35, 9, 36, 10, 35, 8, 36, 9, 35, 16, 35, 17, 253, 174, 1, 36, 8, 35, 18, 65, 1, 106, 36, 18, 12, 1, 11, 11, 35, 0, 35, 8, 253, 174, 1, 36, 0, 35, 1, 35, 9, 253, 174, 1, 36, 1, 35, 2, 35, 10, 253, 174, 1, 36, 2, 35, 3, 35, 11, 253, 174, 1, 36, 3, 35, 4, 35, 12, 253, 174, 1, 36, 4, 35, 5, 35, 13, 253, 174, 1, 36, 5, 35, 6, 35, 14, 253, 174, 1, 36, 6, 35, 7, 35, 15, 253, 174, 1, 36, 7, 16, 17, 32, 1, 35, 0, 253, 27, 0, 16, 18, 54, 2, 0, 32, 1, 35, 1, 253, 27, 0, 16, 18, 54, 2, 4, 32, 1, 35, 2, 253, 27, 0, 16, 18, 54, 2, 8, 32, 1, 35, 3, 253, 27, 0, 16, 18, 54, 2, 12, 32, 1, 35, 4, 253, 27, 0, 16, 18, 54, 2, 16, 32, 1, 35, 5, 253, 27, 0, 16, 18, 54, 2, 20, 32, 1, 35, 6, 253, 27, 0, 16, 18, 54, 2, 24, 32, 1, 35, 7, 253, 27, 0, 16, 18, 54, 2, 28, 32, 1, 35, 0, 253, 27, 1, 16, 18, 54, 2, 32, 32, 1, 35, 1, 253, 27, 1, 16, 18, 54, 2, 36, 32, 1, 35, 2, 253, 27, 1, 16, 18, 54, 2, 40, 32, 1, 35, 3, 253, 27, 1, 16, 18, 54, 2, 44, 32, 1, 35, 4, 253, 27, 1, 16, 18, 54, 2, 48, 32, 1, 35, 5, 253, 27, 1, 16, 18, 54, 2, 52, 32, 1, 35, 6, 253, 27, 1, 16, 18, 54, 2, 56, 32, 1, 35, 7, 253, 27, 1, 16, 18, 54, 2, 60, 32, 1, 65, 64, 107, 35, 0, 253, 27, 2, 16, 18, 54, 2, 0, 32, 1, 35, 1, 253, 27, 2, 16, 18, 54, 2, 68, 32, 1, 35, 2, 253, 27, 2, 16, 18, 54, 2, 72, 32, 1, 35, 3, 253, 27, 2, 16, 18, 54, 2, 76, 32, 1, 35, 4, 253, 27, 2, 16, 18, 54, 2, 80, 32, 1, 35, 5, 253, 27, 2, 16, 18, 54, 2, 84, 32, 1, 35, 6, 253, 27, 2, 16, 18, 54, 2, 88, 32, 1, 35, 7, 253, 27, 2, 16, 18, 54, 2, 92, 32, 1, 35, 0, 253, 27, 3, 16, 18, 54, 2, 96, 32, 1, 35, 1, 253, 27, 3, 16, 18, 54, 2, 100, 32, 1, 35, 2, 253, 27, 3, 16, 18, 54, 2, 104, 32, 1, 35, 3, 253, 27, 3, 16, 18, 54, 2, 108, 32, 1, 35, 4, 253, 27, 3, 16, 18, 54, 2, 112, 32, 1, 35, 5, 253, 27, 3, 16, 18, 54, 2, 116, 32, 1, 35, 6, 253, 27, 3, 16, 18, 54, 2, 120, 32, 1, 35, 7, 253, 27, 3, 16, 18, 54, 2, 124, 15, 11, 65, 128, 21, 32, 4, 16, 13, 16, 15, 65, 192, 20, 65, 213, 2, 65, 7, 16, 0, 0, 11, 203, 2, 1, 5, 127, 3, 64, 32, 1, 65, 16, 72, 4, 64, 32, 1, 65, 2, 116, 34, 2, 65, 1, 106, 33, 3, 35, 53, 32, 2, 65, 2, 116, 106, 32, 2, 65, 3, 106, 34, 4, 35, 55, 34, 5, 106, 45, 0, 0, 32, 2, 32, 5, 106, 45, 0, 0, 65, 24, 116, 32, 3, 32, 5, 106, 45, 0, 0, 65, 16, 116, 114, 32, 2, 65, 2, 106, 34, 2, 32, 5, 106, 45, 0, 0, 65, 8, 116, 114, 114, 54, 2, 0, 35, 53, 32, 3, 65, 2, 116, 106, 35, 55, 34, 3, 32, 1, 65, 16, 106, 65, 2, 116, 34, 5, 65, 3, 106, 106, 45, 0, 0, 32, 3, 32, 5, 106, 45, 0, 0, 65, 24, 116, 32, 5, 65, 1, 106, 32, 3, 106, 45, 0, 0, 65, 16, 116, 114, 32, 5, 65, 2, 106, 32, 3, 106, 45, 0, 0, 65, 8, 116, 114, 114, 54, 2, 0, 35, 53, 32, 2, 65, 2, 116, 106, 35, 55, 34, 2, 32, 1, 65, 32, 106, 65, 2, 116, 34, 3, 65, 3, 106, 106, 45, 0, 0, 32, 2, 32, 3, 106, 45, 0, 0, 65, 24, 116, 32, 3, 65, 1, 106, 32, 2, 106, 45, 0, 0, 65, 16, 116, 114, 32, 3, 65, 2, 106, 32, 2, 106, 45, 0, 0, 65, 8, 116, 114, 114, 54, 2, 0, 35, 53, 32, 4, 65, 2, 116, 106, 35, 55, 34, 2, 32, 1, 65, 48, 106, 65, 2, 116, 34, 3, 65, 3, 106, 106, 45, 0, 0, 32, 2, 32, 3, 106, 45, 0, 0, 65, 24, 116, 32, 3, 65, 1, 106, 32, 2, 106, 45, 0, 0, 65, 16, 116, 114, 32, 3, 65, 2, 106, 32, 2, 106, 45, 0, 0, 65, 8, 116, 114, 114, 54, 2, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 35, 53, 32, 0, 16, 19, 11, 99, 1, 3, 127, 3, 64, 32, 2, 65, 192, 0, 72, 4, 64, 32, 2, 65, 2, 116, 34, 1, 35, 53, 106, 35, 55, 34, 3, 32, 1, 65, 3, 106, 106, 45, 0, 0, 32, 1, 32, 3, 106, 45, 0, 0, 65, 24, 116, 32, 1, 65, 1, 106, 32, 3, 106, 45, 0, 0, 65, 16, 116, 114, 32, 1, 65, 2, 106, 32, 3, 106, 45, 0, 0, 65, 8, 116, 114, 114, 54, 2, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 35, 53, 32, 0, 16, 19, 11, 74, 0, 65, 231, 204, 167, 208, 6, 36, 31, 65, 133, 221, 158, 219, 123, 36, 32, 65, 242, 230, 187, 227, 3, 36, 33, 65, 186, 234, 191, 170, 122, 36, 34, 65, 255, 164, 185, 136, 5, 36, 35, 65, 140, 209, 149, 216, 121, 36, 36, 65, 171, 179, 143, 252, 1, 36, 37, 65, 153, 154, 131, 223, 5, 36, 38, 65, 0, 36, 58, 65, 0, 36, 59, 11, 227, 3, 1, 2, 127, 35, 31, 36, 39, 35, 32, 36, 40, 35, 33, 36, 41, 35, 34, 36, 42, 35, 35, 36, 43, 35, 36, 36, 44, 35, 37, 36, 45, 35, 38, 36, 46, 65, 0, 36, 47, 3, 64, 35, 47, 65, 16, 73, 4, 64, 35, 47, 65, 2, 116, 34, 2, 32, 0, 106, 32, 1, 32, 2, 65, 3, 106, 106, 45, 0, 0, 32, 1, 32, 2, 106, 45, 0, 0, 65, 24, 116, 32, 1, 32, 2, 65, 1, 106, 106, 45, 0, 0, 65, 16, 116, 114, 32, 1, 32, 2, 65, 2, 106, 106, 45, 0, 0, 65, 8, 116, 114, 114, 54, 2, 0, 35, 47, 65, 1, 106, 36, 47, 12, 1, 11, 11, 65, 16, 36, 47, 3, 64, 35, 47, 65, 192, 0, 73, 4, 64, 32, 0, 35, 47, 65, 2, 116, 106, 32, 0, 35, 47, 65, 16, 107, 65, 2, 116, 106, 40, 2, 0, 32, 0, 35, 47, 65, 7, 107, 65, 2, 116, 106, 40, 2, 0, 32, 0, 35, 47, 65, 2, 107, 65, 2, 116, 106, 40, 2, 0, 34, 1, 65, 17, 120, 32, 1, 65, 19, 120, 115, 32, 1, 65, 10, 118, 115, 106, 32, 0, 35, 47, 65, 15, 107, 65, 2, 116, 106, 40, 2, 0, 34, 1, 65, 7, 120, 32, 1, 65, 18, 120, 115, 32, 1, 65, 3, 118, 115, 106, 106, 54, 2, 0, 35, 47, 65, 1, 106, 36, 47, 12, 1, 11, 11, 65, 0, 36, 47, 3, 64, 35, 47, 65, 192, 0, 73, 4, 64, 35, 47, 65, 2, 116, 34, 1, 32, 0, 106, 40, 2, 0, 32, 1, 35, 29, 106, 40, 2, 0, 35, 46, 35, 43, 34, 1, 65, 6, 120, 32, 1, 65, 11, 120, 115, 32, 1, 65, 25, 120, 115, 106, 35, 43, 34, 1, 35, 44, 113, 35, 45, 32, 1, 65, 127, 115, 113, 115, 106, 106, 106, 36, 48, 35, 39, 34, 1, 65, 2, 120, 32, 1, 65, 13, 120, 115, 32, 1, 65, 22, 120, 115, 35, 40, 34, 2, 35, 41, 34, 3, 113, 35, 39, 34, 1, 32, 2, 113, 32, 1, 32, 3, 113, 115, 115, 106, 36, 49, 35, 45, 36, 46, 35, 44, 36, 45, 35, 43, 36, 44, 35, 42, 35, 48, 106, 36, 43, 35, 41, 36, 42, 35, 40, 36, 41, 35, 39, 36, 40, 35, 48, 35, 49, 106, 36, 39, 35, 47, 65, 1, 106, 36, 47, 12, 1, 11, 11, 35, 31, 35, 39, 106, 36, 31, 35, 32, 35, 40, 106, 36, 32, 35, 33, 35, 41, 106, 36, 33, 35, 34, 35, 42, 106, 36, 34, 35, 35, 35, 43, 106, 36, 35, 35, 36, 35, 44, 106, 36, 36, 35, 37, 35, 45, 106, 36, 37, 35, 38, 35, 46, 106, 36, 38, 11, 174, 1, 1, 2, 127, 35, 59, 32, 1, 106, 36, 59, 35, 58, 4, 64, 65, 192, 0, 35, 58, 107, 34, 2, 32, 1, 76, 4, 64, 35, 51, 35, 58, 106, 32, 0, 32, 2, 252, 10, 0, 0, 35, 58, 32, 2, 106, 36, 58, 65, 192, 0, 35, 58, 107, 33, 2, 32, 1, 65, 192, 0, 35, 58, 107, 107, 33, 1, 35, 53, 35, 51, 16, 23, 65, 0, 36, 58, 5, 35, 51, 35, 58, 106, 32, 0, 32, 1, 252, 10, 0, 0, 35, 58, 32, 1, 106, 36, 58, 15, 11, 11, 3, 64, 32, 3, 32, 1, 65, 192, 0, 109, 72, 4, 64, 35, 53, 32, 0, 32, 2, 106, 16, 23, 32, 3, 65, 1, 106, 33, 3, 32, 2, 65, 64, 107, 33, 2, 12, 1, 11, 11, 32, 1, 65, 63, 113, 34, 1, 4, 64, 35, 51, 35, 58, 106, 32, 0, 32, 2, 106, 32, 1, 252, 10, 0, 0, 35, 58, 32, 1, 106, 36, 58, 11, 11, 146, 2, 1, 2, 127, 35, 59, 65, 63, 113, 65, 63, 73, 4, 64, 35, 51, 35, 58, 106, 65, 128, 1, 58, 0, 0, 35, 58, 65, 1, 106, 36, 58, 11, 35, 59, 65, 63, 113, 65, 56, 79, 4, 64, 35, 51, 35, 58, 106, 34, 1, 65, 192, 0, 35, 58, 107, 106, 33, 2, 3, 64, 32, 1, 32, 2, 73, 4, 64, 32, 1, 65, 0, 58, 0, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 35, 53, 35, 51, 16, 23, 65, 0, 36, 58, 11, 35, 59, 65, 63, 113, 65, 63, 79, 4, 64, 35, 51, 35, 58, 106, 65, 128, 1, 58, 0, 0, 35, 58, 65, 1, 106, 36, 58, 11, 35, 51, 35, 58, 106, 34, 1, 65, 56, 35, 58, 107, 106, 33, 2, 3, 64, 32, 1, 32, 2, 73, 4, 64, 32, 1, 65, 0, 58, 0, 0, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 35, 51, 35, 59, 65, 128, 128, 128, 128, 2, 109, 16, 18, 54, 2, 56, 35, 51, 35, 59, 65, 3, 116, 16, 18, 54, 2, 60, 35, 53, 35, 51, 16, 23, 32, 0, 35, 31, 16, 18, 54, 2, 0, 32, 0, 35, 32, 16, 18, 54, 2, 4, 32, 0, 35, 33, 16, 18, 54, 2, 8, 32, 0, 35, 34, 16, 18, 54, 2, 12, 32, 0, 35, 35, 16, 18, 54, 2, 16, 32, 0, 35, 36, 16, 18, 54, 2, 20, 32, 0, 35, 37, 16, 18, 54, 2, 24, 32, 0, 35, 38, 16, 18, 54, 2, 28, 11, 14, 0, 16, 22, 35, 55, 32, 0, 16, 24, 35, 57, 16, 25, 11, 253, 1, 1, 2, 127, 35, 31, 36, 39, 35, 32, 36, 40, 35, 33, 36, 41, 35, 34, 36, 42, 35, 35, 36, 43, 35, 36, 36, 44, 35, 37, 36, 45, 35, 38, 36, 46, 65, 0, 36, 47, 3, 64, 35, 47, 65, 192, 0, 73, 4, 64, 32, 0, 35, 47, 65, 2, 116, 106, 40, 2, 0, 35, 46, 35, 43, 34, 1, 65, 6, 120, 32, 1, 65, 11, 120, 115, 32, 1, 65, 25, 120, 115, 106, 35, 43, 34, 1, 35, 44, 113, 35, 45, 32, 1, 65, 127, 115, 113, 115, 106, 106, 36, 48, 35, 39, 34, 1, 65, 2, 120, 32, 1, 65, 13, 120, 115, 32, 1, 65, 22, 120, 115, 35, 40, 34, 2, 35, 41, 34, 1, 113, 32, 2, 35, 39, 34, 2, 113, 32, 1, 32, 2, 113, 115, 115, 106, 36, 49, 35, 45, 36, 46, 35, 44, 36, 45, 35, 43, 36, 44, 35, 42, 35, 48, 106, 36, 43, 35, 41, 36, 42, 35, 40, 36, 41, 35, 39, 36, 40, 35, 48, 35, 49, 106, 36, 39, 35, 47, 65, 1, 106, 36, 47, 12, 1, 11, 11, 35, 31, 35, 39, 106, 36, 31, 35, 32, 35, 40, 106, 36, 32, 35, 33, 35, 41, 106, 36, 33, 35, 34, 35, 42, 106, 36, 34, 35, 35, 35, 43, 106, 36, 35, 35, 36, 35, 44, 106, 36, 36, 35, 37, 35, 45, 106, 36, 37, 35, 38, 35, 46, 106, 36, 38, 11, 86, 0, 16, 22, 35, 53, 32, 0, 16, 23, 35, 30, 16, 27, 32, 1, 35, 31, 16, 18, 54, 2, 0, 32, 1, 35, 32, 16, 18, 54, 2, 4, 32, 1, 35, 33, 16, 18, 54, 2, 8, 32, 1, 35, 34, 16, 18, 54, 2, 12, 32, 1, 35, 35, 16, 18, 54, 2, 16, 32, 1, 35, 36, 16, 18, 54, 2, 20, 32, 1, 35, 37, 16, 18, 54, 2, 24, 32, 1, 35, 38, 16, 18, 54, 2, 28, 11, 63, 0, 16, 16, 65, 196, 10, 40, 2, 0, 36, 29, 65, 148, 13, 40, 2, 0, 36, 30, 65, 192, 0, 16, 11, 36, 50, 35, 50, 36, 51, 65, 128, 8, 16, 11, 36, 52, 35, 52, 36, 53, 65, 128, 4, 16, 11, 36, 54, 35, 54, 36, 55, 65, 32, 16, 11, 36, 56, 35, 56, 36, 57, 11, 11, 141, 12, 38, 0, 65, 140, 8, 11, 2, 28, 1, 0, 65, 152, 8, 11, 136, 2, 1, 0, 0, 0, 0, 1, 0, 0, 152, 47, 138, 66, 145, 68, 55, 113, 207, 251, 192, 181, 165, 219, 181, 233, 91, 194, 86, 57, 241, 17, 241, 89, 164, 130, 63, 146, 213, 94, 28, 171, 152, 170, 7, 216, 1, 91, 131, 18, 190, 133, 49, 36, 195, 125, 12, 85, 116, 93, 190, 114, 254, 177, 222, 128, 167, 6, 220, 155, 116, 241, 155, 193, 193, 105, 155, 228, 134, 71, 190, 239, 198, 157, 193, 15, 204, 161, 12, 36, 111, 44, 233, 45, 170, 132, 116, 74, 220, 169, 176, 92, 218, 136, 249, 118, 82, 81, 62, 152, 109, 198, 49, 168, 200, 39, 3, 176, 199, 127, 89, 191, 243, 11, 224, 198, 71, 145, 167, 213, 81, 99, 202, 6, 103, 41, 41, 20, 133, 10, 183, 39, 56, 33, 27, 46, 252, 109, 44, 77, 19, 13, 56, 83, 84, 115, 10, 101, 187, 10, 106, 118, 46, 201, 194, 129, 133, 44, 114, 146, 161, 232, 191, 162, 75, 102, 26, 168, 112, 139, 75, 194, 163, 81, 108, 199, 25, 232, 146, 209, 36, 6, 153, 214, 133, 53, 14, 244, 112, 160, 106, 16, 22, 193, 164, 25, 8, 108, 55, 30, 76, 119, 72, 39, 181, 188, 176, 52, 179, 12, 28, 57, 74, 170, 216, 78, 79, 202, 156, 91, 243, 111, 46, 104, 238, 130, 143, 116, 111, 99, 165, 120, 20, 120, 200, 132, 8, 2, 199, 140, 250, 255, 190, 144, 235, 108, 80, 164, 247, 163, 249, 190, 242, 120, 113, 198, 0, 65, 172, 10, 11, 1, 44, 0, 65, 184, 10, 11, 21, 4, 0, 0, 0, 16, 0, 0, 0, 32, 4, 0, 0, 32, 4, 0, 0, 0, 1, 0, 0, 64, 0, 65, 220, 10, 11, 2, 28, 1, 0, 65, 232, 10, 11, 136, 2, 1, 0, 0, 0, 0, 1, 0, 0, 152, 47, 138, 194, 145, 68, 55, 113, 207, 251, 192, 181, 165, 219, 181, 233, 91, 194, 86, 57, 241, 17, 241, 89, 164, 130, 63, 146, 213, 94, 28, 171, 152, 170, 7, 216, 1, 91, 131, 18, 190, 133, 49, 36, 195, 125, 12, 85, 116, 93, 190, 114, 254, 177, 222, 128, 167, 6, 220, 155, 116, 243, 155, 193, 193, 105, 155, 100, 134, 71, 254, 240, 198, 237, 225, 15, 84, 242, 12, 36, 111, 52, 233, 79, 190, 132, 201, 108, 30, 65, 185, 97, 250, 136, 249, 22, 82, 81, 198, 242, 109, 90, 142, 168, 101, 252, 25, 176, 199, 158, 217, 185, 195, 49, 18, 154, 160, 234, 14, 231, 43, 35, 177, 253, 176, 62, 53, 199, 213, 186, 105, 48, 95, 109, 151, 203, 143, 17, 15, 90, 253, 238, 30, 220, 137, 182, 53, 10, 4, 122, 11, 222, 157, 202, 244, 88, 22, 91, 93, 225, 134, 62, 127, 0, 128, 137, 8, 55, 50, 234, 7, 165, 55, 149, 171, 111, 16, 97, 64, 23, 241, 214, 140, 13, 109, 59, 170, 205, 55, 190, 187, 192, 218, 59, 97, 131, 99, 163, 72, 219, 49, 233, 2, 11, 167, 92, 209, 111, 202, 250, 26, 82, 49, 132, 51, 49, 149, 26, 212, 110, 144, 120, 67, 109, 242, 145, 156, 195, 189, 171, 204, 158, 230, 160, 201, 181, 60, 182, 47, 83, 198, 65, 199, 210, 163, 126, 35, 7, 104, 75, 149, 164, 118, 29, 25, 76, 0, 65, 252, 12, 11, 1, 44, 0, 65, 136, 13, 11, 21, 4, 0, 0, 0, 16, 0, 0, 0, 112, 5, 0, 0, 112, 5, 0, 0, 0, 1, 0, 0, 64, 0, 65, 172, 13, 11, 1, 44, 0, 65, 184, 13, 11, 35, 2, 0, 0, 0, 28, 0, 0, 0, 73, 0, 110, 0, 118, 0, 97, 0, 108, 0, 105, 0, 100, 0, 32, 0, 108, 0, 101, 0, 110, 0, 103, 0, 116, 0, 104, 0, 65, 220, 13, 11, 1, 60, 0, 65, 232, 13, 11, 45, 2, 0, 0, 0, 38, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 97, 0, 114, 0, 114, 0, 97, 0, 121, 0, 98, 0, 117, 0, 102, 0, 102, 0, 101, 0, 114, 0, 46, 0, 116, 0, 115, 0, 65, 156, 14, 11, 1, 60, 0, 65, 168, 14, 11, 47, 2, 0, 0, 0, 40, 0, 0, 0, 65, 0, 108, 0, 108, 0, 111, 0, 99, 0, 97, 0, 116, 0, 105, 0, 111, 0, 110, 0, 32, 0, 116, 0, 111, 0, 111, 0, 32, 0, 108, 0, 97, 0, 114, 0, 103, 0, 101, 0, 65, 220, 14, 11, 1, 60, 0, 65, 232, 14, 11, 37, 2, 0, 0, 0, 30, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 114, 0, 116, 0, 47, 0, 116, 0, 99, 0, 109, 0, 115, 0, 46, 0, 116, 0, 115, 0, 65, 156, 15, 11, 1, 60, 0, 65, 168, 15, 11, 37, 2, 0, 0, 0, 30, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 114, 0, 116, 0, 47, 0, 116, 0, 108, 0, 115, 0, 102, 0, 46, 0, 116, 0, 115, 0, 65, 252, 15, 11, 1, 60, 0, 65, 136, 16, 11, 43, 2, 0, 0, 0, 36, 0, 0, 0, 73, 0, 110, 0, 100, 0, 101, 0, 120, 0, 32, 0, 111, 0, 117, 0, 116, 0, 32, 0, 111, 0, 102, 0, 32, 0, 114, 0, 97, 0, 110, 0, 103, 0, 101, 0, 65, 188, 16, 11, 1, 44, 0, 65, 200, 16, 11, 33, 2, 0, 0, 0, 26, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 97, 0, 114, 0, 114, 0, 97, 0, 121, 0, 46, 0, 116, 0, 115, 0, 65, 236, 16, 11, 1, 124, 0, 65, 248, 16, 11, 107, 2, 0, 0, 0, 100, 0, 0, 0, 116, 0, 111, 0, 83, 0, 116, 0, 114, 0, 105, 0, 110, 0, 103, 0, 40, 0, 41, 0, 32, 0, 114, 0, 97, 0, 100, 0, 105, 0, 120, 0, 32, 0, 97, 0, 114, 0, 103, 0, 117, 0, 109, 0, 101, 0, 110, 0, 116, 0, 32, 0, 109, 0, 117, 0, 115, 0, 116, 0, 32, 0, 98, 0, 101, 0, 32, 0, 98, 0, 101, 0, 116, 0, 119, 0, 101, 0, 101, 0, 110, 0, 32, 0, 50, 0, 32, 0, 97, 0, 110, 0, 100, 0, 32, 0, 51, 0, 54, 0, 65, 236, 17, 11, 1, 60, 0, 65, 248, 17, 11, 45, 2, 0, 0, 0, 38, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 117, 0, 116, 0, 105, 0, 108, 0, 47, 0, 110, 0, 117, 0, 109, 0, 98, 0, 101, 0, 114, 0, 46, 0, 116, 0, 115, 0, 65, 172, 18, 11, 1, 28, 0, 65, 184, 18, 11, 9, 2, 0, 0, 0, 2, 0, 0, 0, 48, 0, 65, 204, 18, 11, 1, 92, 0, 65, 216, 18, 11, 79, 2, 0, 0, 0, 72, 0, 0, 0, 48, 0, 49, 0, 50, 0, 51, 0, 52, 0, 53, 0, 54, 0, 55, 0, 56, 0, 57, 0, 97, 0, 98, 0, 99, 0, 100, 0, 101, 0, 102, 0, 103, 0, 104, 0, 105, 0, 106, 0, 107, 0, 108, 0, 109, 0, 110, 0, 111, 0, 112, 0, 113, 0, 114, 0, 115, 0, 116, 0, 117, 0, 118, 0, 119, 0, 120, 0, 121, 0, 122, 0, 65, 172, 19, 11, 1, 92, 0, 65, 184, 19, 11, 79, 2, 0, 0, 0, 72, 0, 0, 0, 115, 0, 101, 0, 116, 0, 86, 0, 49, 0, 50, 0, 56, 0, 58, 0, 32, 0, 101, 0, 120, 0, 112, 0, 101, 0, 99, 0, 116, 0, 32, 0, 105, 0, 32, 0, 102, 0, 114, 0, 111, 0, 109, 0, 32, 0, 48, 0, 32, 0, 116, 0, 111, 0, 32, 0, 54, 0, 51, 0, 44, 0, 32, 0, 103, 0, 111, 0, 116, 0, 32, 0, 65, 140, 20, 11, 1, 28, 0, 65, 152, 20, 11, 1, 2, 0, 65, 172, 20, 11, 1, 60, 0, 65, 184, 20, 11, 51, 2, 0, 0, 0, 44, 0, 0, 0, 97, 0, 115, 0, 115, 0, 101, 0, 109, 0, 98, 0, 108, 0, 121, 0, 47, 0, 117, 0, 116, 0, 105, 0, 108, 0, 115, 0, 47, 0, 118, 0, 49, 0, 50, 0, 56, 0, 46, 0, 116, 0, 115, 0, 65, 236, 20, 11, 1, 92, 0, 65, 248, 20, 11, 79, 2, 0, 0, 0, 72, 0, 0, 0, 103, 0, 101, 0, 116, 0, 86, 0, 49, 0, 50, 0, 56, 0, 58, 0, 32, 0, 101, 0, 120, 0, 112, 0, 101, 0, 99, 0, 116, 0, 32, 0, 105, 0, 32, 0, 102, 0, 114, 0, 111, 0, 109, 0, 32, 0, 48, 0, 32, 0, 116, 0, 111, 0, 32, 0, 54, 0, 51, 0, 44, 0, 32, 0, 103, 0, 111, 0, 116, 0, 32]);

// ../../node_modules/@chainsafe/as-sha256/lib/wasm.js
var importObj = {
  env: {
    // modified from https://github.com/AssemblyScript/assemblyscript/blob/v0.9.2/lib/loader/index.js#L70
    abort: function(msg, file, line, col) {
      throw Error(`abort: ${msg}:${file}:${line}:${col}`);
    }
  }
};
function newInstance(useSimd) {
  const enableSimd = useSimd !== void 0 ? useSimd : WebAssembly.validate(wasmSimdCode);
  return enableSimd ? new WebAssembly.Instance(new WebAssembly.Module(wasmSimdCode), importObj).exports : new WebAssembly.Instance(new WebAssembly.Module(wasmCode), importObj).exports;
}

// ../../node_modules/@chainsafe/as-sha256/lib/index.js
var ctx;
var simdEnabled;
var wasmInputValue;
var wasmOutputValue;
var inputUint8Array;
var outputUint8Array;
var outputUint8Array32;
var inputUint32Array;
function reinitializeInstance(useSimd) {
  ctx = newInstance(useSimd);
  simdEnabled = Boolean(ctx.HAS_SIMD.valueOf());
  wasmInputValue = ctx.input.value;
  wasmOutputValue = ctx.output.value;
  inputUint8Array = new Uint8Array(ctx.memory.buffer, wasmInputValue, ctx.INPUT_LENGTH);
  outputUint8Array = new Uint8Array(ctx.memory.buffer, wasmOutputValue, ctx.PARALLEL_FACTOR * 32);
  outputUint8Array32 = new Uint8Array(ctx.memory.buffer, wasmOutputValue, 32);
  inputUint32Array = new Uint32Array(ctx.memory.buffer, wasmInputValue, ctx.INPUT_LENGTH);
}
reinitializeInstance();
function digest2(data) {
  if (data.length === 64) {
    return digest64(data);
  }
  if (data.length <= ctx.INPUT_LENGTH) {
    inputUint8Array.set(data);
    ctx.digest(data.length);
    return allocDigest();
  }
  ctx.init();
  update(data);
  return final();
}
function digest64(data) {
  if (data.length === 64) {
    inputUint8Array.set(data);
    ctx.digest64(wasmInputValue, wasmOutputValue);
    return allocDigest();
  }
  throw new Error("InvalidLengthForDigest64");
}
function update(data) {
  const INPUT_LENGTH = ctx.INPUT_LENGTH;
  if (data.length > INPUT_LENGTH) {
    for (let i = 0; i < data.length; i += INPUT_LENGTH) {
      const sliced = data.subarray(i, i + INPUT_LENGTH);
      inputUint8Array.set(sliced);
      ctx.update(wasmInputValue, sliced.length);
    }
  } else {
    inputUint8Array.set(data);
    ctx.update(wasmInputValue, data.length);
  }
}
function final() {
  ctx.final(wasmOutputValue);
  return allocDigest();
}
function allocDigest() {
  const out = allocUnsafe2(32);
  out.set(outputUint8Array32);
  return out;
}

// ../../node_modules/wherearewe/src/index.js
var import_is_electron = __toESM(require_is_electron(), 1);
var isEnvWithDom = typeof window === "object" && typeof document === "object" && document.nodeType === 9;
var isElectron = (0, import_is_electron.default)();
var isElectronMain = isElectron && !isEnvWithDom;
var isNode2 = typeof globalThis.process !== "undefined" && typeof globalThis.process.release !== "undefined" && globalThis.process.release.name === "node" && !isElectron;
var isWebWorker = typeof importScripts === "function" && typeof self !== "undefined" && typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
var isTest = typeof globalThis.process !== "undefined" && typeof globalThis.process.env !== "undefined" && globalThis.process.env["NODE" + /* @__PURE__ */ (() => "_")() + "ENV"] === "test";
var isReactNative = typeof navigator !== "undefined" && navigator.product === "ReactNative";

// ../../node_modules/@noble/ciphers/esm/_assert.js
function number2(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`positive integer expected, not ${n}`);
}
function bool(b) {
  if (typeof b !== "boolean")
    throw new Error(`boolean expected, not ${b}`);
}
function isBytes(a) {
  return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
}
function bytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
}
function exists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function output(out, instance) {
  bytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}

// ../../node_modules/@noble/ciphers/esm/utils.js
var u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!isLE)
  throw new Error("Non little-endian hardware is not supported");
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error(`string expected, got ${typeof str}`);
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes2(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  else if (isBytes(data))
    data = copyBytes(data);
  else
    throw new Error(`Uint8Array expected, got ${typeof data}`);
  return data;
}
function checkOpts(defaults, opts) {
  if (opts == null || typeof opts !== "object")
    throw new Error("options must be defined");
  const merged = Object.assign(defaults, opts);
  return merged;
}
function equalBytes(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
var wrapCipher = /* @__NO_SIDE_EFFECTS__ */ (params, c) => {
  Object.assign(c, params);
  return c;
};
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}
function copyBytes(bytes2) {
  return Uint8Array.from(bytes2);
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}

// ../../node_modules/@noble/ciphers/esm/_arx.js
var _utf8ToBytes = (str) => Uint8Array.from(str.split("").map((c) => c.charCodeAt(0)));
var sigma16 = _utf8ToBytes("expand 16-byte k");
var sigma32 = _utf8ToBytes("expand 32-byte k");
var sigma16_32 = u32(sigma16);
var sigma32_32 = u32(sigma32);
var sigma = sigma32_32.slice();
function rotl(a, b) {
  return a << b | a >>> 32 - b;
}
function isAligned32(b) {
  return b.byteOffset % 4 === 0;
}
var BLOCK_LEN = 64;
var BLOCK_LEN32 = 16;
var MAX_COUNTER = 2 ** 32 - 1;
var U32_EMPTY = new Uint32Array();
function runCipher(core, sigma2, key, nonce, data, output2, counter, rounds) {
  const len = data.length;
  const block = new Uint8Array(BLOCK_LEN);
  const b32 = u32(block);
  const isAligned = isAligned32(data) && isAligned32(output2);
  const d32 = isAligned ? u32(data) : U32_EMPTY;
  const o32 = isAligned ? u32(output2) : U32_EMPTY;
  for (let pos = 0; pos < len; counter++) {
    core(sigma2, key, nonce, b32, counter, rounds);
    if (counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    const take2 = Math.min(BLOCK_LEN, len - pos);
    if (isAligned && take2 === BLOCK_LEN) {
      const pos32 = pos / 4;
      if (pos % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let j = 0, posj; j < BLOCK_LEN32; j++) {
        posj = pos32 + j;
        o32[posj] = d32[posj] ^ b32[j];
      }
      pos += BLOCK_LEN;
      continue;
    }
    for (let j = 0, posj; j < take2; j++) {
      posj = pos + j;
      output2[posj] = data[posj] ^ block[j];
    }
    pos += take2;
  }
}
function createCipher(core, opts) {
  const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, opts);
  if (typeof core !== "function")
    throw new Error("core must be a function");
  number2(counterLength);
  number2(rounds);
  bool(counterRight);
  bool(allowShortKeys);
  return (key, nonce, data, output2, counter = 0) => {
    bytes(key);
    bytes(nonce);
    bytes(data);
    const len = data.length;
    if (output2 === void 0)
      output2 = new Uint8Array(len);
    bytes(output2);
    number2(counter);
    if (counter < 0 || counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    if (output2.length < len)
      throw new Error(`arx: output (${output2.length}) is shorter than data (${len})`);
    const toClean = [];
    let l = key.length, k, sigma2;
    if (l === 32) {
      toClean.push(k = copyBytes(key));
      sigma2 = sigma32_32;
    } else if (l === 16 && allowShortKeys) {
      k = new Uint8Array(32);
      k.set(key);
      k.set(key, 16);
      sigma2 = sigma16_32;
      toClean.push(k);
    } else {
      throw new Error(`arx: invalid 32-byte key, got length=${l}`);
    }
    if (!isAligned32(nonce))
      toClean.push(nonce = copyBytes(nonce));
    const k32 = u32(k);
    if (extendNonceFn) {
      if (nonce.length !== 24)
        throw new Error(`arx: extended nonce must be 24 bytes`);
      extendNonceFn(sigma2, k32, u32(nonce.subarray(0, 16)), k32);
      nonce = nonce.subarray(16);
    }
    const nonceNcLen = 16 - counterLength;
    if (nonceNcLen !== nonce.length)
      throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
    if (nonceNcLen !== 12) {
      const nc2 = new Uint8Array(12);
      nc2.set(nonce, counterRight ? 0 : 12 - nonce.length);
      nonce = nc2;
      toClean.push(nonce);
    }
    const n32 = u32(nonce);
    runCipher(core, sigma2, k32, n32, data, output2, counter, rounds);
    clean(...toClean);
    return output2;
  };
}

// ../../node_modules/@noble/ciphers/esm/_poly1305.js
var u8to16 = (a, i) => a[i++] & 255 | (a[i++] & 255) << 8;
var Poly1305 = class {
  constructor(key) {
    this.blockLen = 16;
    this.outputLen = 16;
    this.buffer = new Uint8Array(16);
    this.r = new Uint16Array(10);
    this.h = new Uint16Array(10);
    this.pad = new Uint16Array(8);
    this.pos = 0;
    this.finished = false;
    key = toBytes2(key);
    bytes(key, 32);
    const t0 = u8to16(key, 0);
    const t1 = u8to16(key, 2);
    const t2 = u8to16(key, 4);
    const t3 = u8to16(key, 6);
    const t4 = u8to16(key, 8);
    const t5 = u8to16(key, 10);
    const t6 = u8to16(key, 12);
    const t7 = u8to16(key, 14);
    this.r[0] = t0 & 8191;
    this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
    this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
    this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
    this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
    this.r[5] = t4 >>> 1 & 8190;
    this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
    this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
    this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
    this.r[9] = t7 >>> 5 & 127;
    for (let i = 0; i < 8; i++)
      this.pad[i] = u8to16(key, 16 + 2 * i);
  }
  process(data, offset, isLast = false) {
    const hibit = isLast ? 0 : 1 << 11;
    const { h, r } = this;
    const r0 = r[0];
    const r1 = r[1];
    const r2 = r[2];
    const r3 = r[3];
    const r4 = r[4];
    const r5 = r[5];
    const r6 = r[6];
    const r7 = r[7];
    const r8 = r[8];
    const r9 = r[9];
    const t0 = u8to16(data, offset + 0);
    const t1 = u8to16(data, offset + 2);
    const t2 = u8to16(data, offset + 4);
    const t3 = u8to16(data, offset + 6);
    const t4 = u8to16(data, offset + 8);
    const t5 = u8to16(data, offset + 10);
    const t6 = u8to16(data, offset + 12);
    const t7 = u8to16(data, offset + 14);
    let h0 = h[0] + (t0 & 8191);
    let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
    let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
    let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
    let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
    let h5 = h[5] + (t4 >>> 1 & 8191);
    let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
    let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
    let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
    let h9 = h[9] + (t7 >>> 5 | hibit);
    let c = 0;
    let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
    c = d0 >>> 13;
    d0 &= 8191;
    d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
    c += d0 >>> 13;
    d0 &= 8191;
    let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
    c = d1 >>> 13;
    d1 &= 8191;
    d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
    c += d1 >>> 13;
    d1 &= 8191;
    let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
    c = d2 >>> 13;
    d2 &= 8191;
    d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
    c += d2 >>> 13;
    d2 &= 8191;
    let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
    c = d3 >>> 13;
    d3 &= 8191;
    d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
    c += d3 >>> 13;
    d3 &= 8191;
    let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
    c = d4 >>> 13;
    d4 &= 8191;
    d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
    c += d4 >>> 13;
    d4 &= 8191;
    let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
    c = d5 >>> 13;
    d5 &= 8191;
    d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
    c += d5 >>> 13;
    d5 &= 8191;
    let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
    c = d6 >>> 13;
    d6 &= 8191;
    d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
    c += d6 >>> 13;
    d6 &= 8191;
    let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
    c = d7 >>> 13;
    d7 &= 8191;
    d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
    c += d7 >>> 13;
    d7 &= 8191;
    let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
    c = d8 >>> 13;
    d8 &= 8191;
    d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
    c += d8 >>> 13;
    d8 &= 8191;
    let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
    c = d9 >>> 13;
    d9 &= 8191;
    d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
    c += d9 >>> 13;
    d9 &= 8191;
    c = (c << 2) + c | 0;
    c = c + d0 | 0;
    d0 = c & 8191;
    c = c >>> 13;
    d1 += c;
    h[0] = d0;
    h[1] = d1;
    h[2] = d2;
    h[3] = d3;
    h[4] = d4;
    h[5] = d5;
    h[6] = d6;
    h[7] = d7;
    h[8] = d8;
    h[9] = d9;
  }
  finalize() {
    const { h, pad } = this;
    const g = new Uint16Array(10);
    let c = h[1] >>> 13;
    h[1] &= 8191;
    for (let i = 2; i < 10; i++) {
      h[i] += c;
      c = h[i] >>> 13;
      h[i] &= 8191;
    }
    h[0] += c * 5;
    c = h[0] >>> 13;
    h[0] &= 8191;
    h[1] += c;
    c = h[1] >>> 13;
    h[1] &= 8191;
    h[2] += c;
    g[0] = h[0] + 5;
    c = g[0] >>> 13;
    g[0] &= 8191;
    for (let i = 1; i < 10; i++) {
      g[i] = h[i] + c;
      c = g[i] >>> 13;
      g[i] &= 8191;
    }
    g[9] -= 1 << 13;
    let mask = (c ^ 1) - 1;
    for (let i = 0; i < 10; i++)
      g[i] &= mask;
    mask = ~mask;
    for (let i = 0; i < 10; i++)
      h[i] = h[i] & mask | g[i];
    h[0] = (h[0] | h[1] << 13) & 65535;
    h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
    h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
    h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
    h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
    h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
    h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
    h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
    let f = h[0] + pad[0];
    h[0] = f & 65535;
    for (let i = 1; i < 8; i++) {
      f = (h[i] + pad[i] | 0) + (f >>> 16) | 0;
      h[i] = f & 65535;
    }
    clean(g);
  }
  update(data) {
    exists(this);
    const { buffer, blockLen } = this;
    data = toBytes2(data);
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take2 = Math.min(blockLen - this.pos, len - pos);
      if (take2 === blockLen) {
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(data, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take2), this.pos);
      this.pos += take2;
      pos += take2;
      if (this.pos === blockLen) {
        this.process(buffer, 0, false);
        this.pos = 0;
      }
    }
    return this;
  }
  destroy() {
    clean(this.h, this.r, this.buffer, this.pad);
  }
  digestInto(out) {
    exists(this);
    output(out, this);
    this.finished = true;
    const { buffer, h } = this;
    let { pos } = this;
    if (pos) {
      buffer[pos++] = 1;
      for (; pos < 16; pos++)
        buffer[pos] = 0;
      this.process(buffer, 0, true);
    }
    this.finalize();
    let opos = 0;
    for (let i = 0; i < 8; i++) {
      out[opos++] = h[i] >>> 0;
      out[opos++] = h[i] >>> 8;
    }
    return out;
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
};
function wrapConstructorWithKey(hashCons) {
  const hashC = (msg, key) => hashCons(key).update(toBytes2(msg)).digest();
  const tmp = hashCons(new Uint8Array(32));
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (key) => hashCons(key);
  return hashC;
}
var poly1305 = wrapConstructorWithKey((key) => new Poly1305(key));

// ../../node_modules/@noble/ciphers/esm/chacha.js
function chachaCore(s, k, n, out, cnt, rounds = 20) {
  let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
  let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
  for (let r = 0; r < rounds; r += 2) {
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 16);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 12);
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 8);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 7);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 16);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 12);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 8);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 7);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 16);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 12);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 8);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 7);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 16);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 12);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 8);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 7);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 16);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 12);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 8);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 7);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 16);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 12);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 8);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 7);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 16);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 12);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 8);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 7);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 16);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 12);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 8);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 7);
  }
  let oi = 0;
  out[oi++] = y00 + x00 | 0;
  out[oi++] = y01 + x01 | 0;
  out[oi++] = y02 + x02 | 0;
  out[oi++] = y03 + x03 | 0;
  out[oi++] = y04 + x04 | 0;
  out[oi++] = y05 + x05 | 0;
  out[oi++] = y06 + x06 | 0;
  out[oi++] = y07 + x07 | 0;
  out[oi++] = y08 + x08 | 0;
  out[oi++] = y09 + x09 | 0;
  out[oi++] = y10 + x10 | 0;
  out[oi++] = y11 + x11 | 0;
  out[oi++] = y12 + x12 | 0;
  out[oi++] = y13 + x13 | 0;
  out[oi++] = y14 + x14 | 0;
  out[oi++] = y15 + x15 | 0;
}
function hchacha(s, k, i, o32) {
  let x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i[0], x13 = i[1], x14 = i[2], x15 = i[3];
  for (let r = 0; r < 20; r += 2) {
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 16);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 12);
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 8);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 7);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 16);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 12);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 8);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 7);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 16);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 12);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 8);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 7);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 16);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 12);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 8);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 7);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 16);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 12);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 8);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 7);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 16);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 12);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 8);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 7);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 16);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 12);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 8);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 7);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 16);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 12);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 8);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 7);
  }
  let oi = 0;
  o32[oi++] = x00;
  o32[oi++] = x01;
  o32[oi++] = x02;
  o32[oi++] = x03;
  o32[oi++] = x12;
  o32[oi++] = x13;
  o32[oi++] = x14;
  o32[oi++] = x15;
}
var chacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 4,
  allowShortKeys: false
});
var xchacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 8,
  extendNonceFn: hchacha,
  allowShortKeys: false
});
var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
var updatePadded = (h, msg) => {
  h.update(msg);
  const left = msg.length % 16;
  if (left)
    h.update(ZEROS16.subarray(left));
};
var ZEROS32 = /* @__PURE__ */ new Uint8Array(32);
function computeTag(fn, key, nonce, data, AAD) {
  const authKey = fn(key, nonce, ZEROS32);
  const h = poly1305.create(authKey);
  if (AAD)
    updatePadded(h, AAD);
  updatePadded(h, data);
  const num = new Uint8Array(16);
  const view = createView(num);
  setBigUint64(view, 0, BigInt(AAD ? AAD.length : 0), true);
  setBigUint64(view, 8, BigInt(data.length), true);
  h.update(num);
  const res = h.digest();
  clean(authKey, num);
  return res;
}
var _poly1305_aead = (xorStream) => (key, nonce, AAD) => {
  const tagLength = 16;
  bytes(key, 32);
  bytes(nonce);
  return {
    encrypt(plaintext, output2) {
      const plength = plaintext.length;
      const clength = plength + tagLength;
      if (output2) {
        bytes(output2, clength);
      } else {
        output2 = new Uint8Array(clength);
      }
      xorStream(key, nonce, plaintext, output2, 1);
      const tag = computeTag(xorStream, key, nonce, output2.subarray(0, -tagLength), AAD);
      output2.set(tag, plength);
      clean(tag);
      return output2;
    },
    decrypt(ciphertext, output2) {
      const clength = ciphertext.length;
      const plength = clength - tagLength;
      if (clength < tagLength)
        throw new Error(`encrypted data must be at least ${tagLength} bytes`);
      if (output2) {
        bytes(output2, plength);
      } else {
        output2 = new Uint8Array(plength);
      }
      const data = ciphertext.subarray(0, -tagLength);
      const passedTag = ciphertext.subarray(-tagLength);
      const tag = computeTag(xorStream, key, nonce, data, AAD);
      if (!equalBytes(passedTag, tag))
        throw new Error("invalid tag");
      xorStream(key, nonce, data, output2, 1);
      clean(tag);
      return output2;
    }
  };
};
var chacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 12, tagLength: 16 }, _poly1305_aead(chacha20));
var xchacha20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 24, tagLength: 16 }, _poly1305_aead(xchacha20));

// ../../node_modules/@noble/hashes/esm/_assert.js
function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes(b, ...lengths) {
  if (!isBytes2(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}

// ../../node_modules/@noble/hashes/esm/cryptoNode.js
import * as nc from "node:crypto";
var crypto3 = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : nc && typeof nc === "object" && "randomBytes" in nc ? nc : void 0;

// ../../node_modules/@noble/hashes/esm/utils.js
var createView2 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
var rotr = (word, shift) => word << 32 - shift | word >>> shift;
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error("utf8ToBytes expected string, got " + typeof str);
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes3(data) {
  if (typeof data === "string")
    data = utf8ToBytes2(data);
  abytes(data);
  return data;
}
var Hash = class {
  // Safe version that clones internal state
  clone() {
    return this._cloneInto();
  }
};
function wrapConstructor(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes3(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes3(bytesLength = 32) {
  if (crypto3 && typeof crypto3.getRandomValues === "function") {
    return crypto3.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto3 && typeof crypto3.randomBytes === "function") {
    return crypto3.randomBytes(bytesLength);
  }
  throw new Error("crypto.getRandomValues must be defined");
}

// ../../node_modules/@noble/hashes/esm/_md.js
function setBigUint642(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}
var Chi = (a, b, c) => a & b ^ ~a & c;
var Maj = (a, b, c) => a & b ^ a & c ^ b & c;
var HashMD = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE2) {
    super();
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE2;
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView2(this.buffer);
  }
  update(data) {
    aexists(this);
    const { view, buffer, blockLen } = this;
    data = toBytes3(data);
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take2 = Math.min(blockLen - this.pos, len - pos);
      if (take2 === blockLen) {
        const dataView = createView2(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take2), this.pos);
      this.pos += take2;
      pos += take2;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE2 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    this.buffer.subarray(pos).fill(0);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint642(view, blockLen - 8, BigInt(this.length * 8), isLE2);
    this.process(view, 0);
    const oview = createView2(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE2);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length: length3, finished, destroyed, pos } = this;
    to.length = length3;
    to.pos = pos;
    to.finished = finished;
    to.destroyed = destroyed;
    if (length3 % blockLen)
      to.buffer.set(buffer);
    return to;
  }
};

// ../../node_modules/@noble/curves/esm/abstract/utils.js
var _0n = /* @__PURE__ */ BigInt(0);
function isBytes3(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(item) {
  if (!isBytes3(item))
    throw new Error("Uint8Array expected");
}
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes2) {
  abytes2(bytes2);
  let hex = "";
  for (let i = 0; i < bytes2.length; i++) {
    hex += hexes[bytes2[i]];
  }
  return hex;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function bytesToNumberLE(bytes2) {
  abytes2(bytes2);
  return hexToNumber(bytesToHex(Uint8Array.from(bytes2).reverse()));
}
function numberToBytesBE(n, len) {
  return hexToBytes(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes3(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
var validatorFns = {
  bigint: (val) => typeof val === "bigint",
  function: (val) => typeof val === "function",
  boolean: (val) => typeof val === "boolean",
  string: (val) => typeof val === "string",
  stringOrUint8Array: (val) => typeof val === "string" || isBytes3(val),
  isSafeInteger: (val) => Number.isSafeInteger(val),
  array: (val) => Array.isArray(val),
  field: (val, object) => object.Fp.isValid(val),
  hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
};
function validateObject(object, validators, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns[type];
    if (typeof checkVal !== "function")
      throw new Error("invalid validator function");
    const val = object[fieldName];
    if (isOptional && val === void 0)
      return;
    if (!checkVal(val, object)) {
      throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
    }
  };
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}

// ../../node_modules/@noble/curves/esm/abstract/modular.js
var _0n2 = BigInt(0);
var _1n = BigInt(1);
function mod(a, b) {
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow(num, power, modulo) {
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (modulo <= _0n2)
    throw new Error("invalid modulus");
  if (modulo === _1n)
    return _0n2;
  let res = _1n;
  while (power > _0n2) {
    if (power & _1n)
      res = res * num % modulo;
    num = num * num % modulo;
    power >>= _1n;
  }
  return res;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}

// ../../node_modules/@noble/curves/esm/abstract/montgomery.js
var _0n3 = BigInt(0);
var _1n2 = BigInt(1);
function validateOpts(curve) {
  validateObject(curve, {
    a: "bigint"
  }, {
    montgomeryBits: "isSafeInteger",
    nByteLength: "isSafeInteger",
    adjustScalarBytes: "function",
    domain: "function",
    powPminus2: "function",
    Gu: "bigint"
  });
  return Object.freeze({ ...curve });
}
function montgomery(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { P } = CURVE;
  const modP = (n) => mod(n, P);
  const montgomeryBits = CURVE.montgomeryBits;
  const montgomeryBytes = Math.ceil(montgomeryBits / 8);
  const fieldLen = CURVE.nByteLength;
  const adjustScalarBytes2 = CURVE.adjustScalarBytes || ((bytes2) => bytes2);
  const powPminus2 = CURVE.powPminus2 || ((x) => pow(x, P - BigInt(2), P));
  function cswap(swap, x_2, x_3) {
    const dummy = modP(swap * (x_2 - x_3));
    x_2 = modP(x_2 - dummy);
    x_3 = modP(x_3 + dummy);
    return [x_2, x_3];
  }
  const a24 = (CURVE.a - BigInt(2)) / BigInt(4);
  function montgomeryLadder(u, scalar) {
    aInRange("u", u, _0n3, P);
    aInRange("scalar", scalar, _0n3, P);
    const k = scalar;
    const x_1 = u;
    let x_2 = _1n2;
    let z_2 = _0n3;
    let x_3 = u;
    let z_3 = _1n2;
    let swap = _0n3;
    let sw;
    for (let t = BigInt(montgomeryBits - 1); t >= _0n3; t--) {
      const k_t = k >> t & _1n2;
      swap ^= k_t;
      sw = cswap(swap, x_2, x_3);
      x_2 = sw[0];
      x_3 = sw[1];
      sw = cswap(swap, z_2, z_3);
      z_2 = sw[0];
      z_3 = sw[1];
      swap = k_t;
      const A = x_2 + z_2;
      const AA = modP(A * A);
      const B = x_2 - z_2;
      const BB = modP(B * B);
      const E = AA - BB;
      const C = x_3 + z_3;
      const D = x_3 - z_3;
      const DA = modP(D * A);
      const CB = modP(C * B);
      const dacb = DA + CB;
      const da_cb = DA - CB;
      x_3 = modP(dacb * dacb);
      z_3 = modP(x_1 * modP(da_cb * da_cb));
      x_2 = modP(AA * BB);
      z_2 = modP(E * (AA + modP(a24 * E)));
    }
    sw = cswap(swap, x_2, x_3);
    x_2 = sw[0];
    x_3 = sw[1];
    sw = cswap(swap, z_2, z_3);
    z_2 = sw[0];
    z_3 = sw[1];
    const z2 = powPminus2(z_2);
    return modP(x_2 * z2);
  }
  function encodeUCoordinate(u) {
    return numberToBytesLE(modP(u), montgomeryBytes);
  }
  function decodeUCoordinate(uEnc) {
    const u = ensureBytes("u coordinate", uEnc, montgomeryBytes);
    if (fieldLen === 32)
      u[31] &= 127;
    return bytesToNumberLE(u);
  }
  function decodeScalar(n) {
    const bytes2 = ensureBytes("scalar", n);
    const len = bytes2.length;
    if (len !== montgomeryBytes && len !== fieldLen) {
      let valid = "" + montgomeryBytes + " or " + fieldLen;
      throw new Error("invalid scalar, expected " + valid + " bytes, got " + len);
    }
    return bytesToNumberLE(adjustScalarBytes2(bytes2));
  }
  function scalarMult(scalar, u) {
    const pointU = decodeUCoordinate(u);
    const _scalar = decodeScalar(scalar);
    const pu = montgomeryLadder(pointU, _scalar);
    if (pu === _0n3)
      throw new Error("invalid private or public key received");
    return encodeUCoordinate(pu);
  }
  const GuBytes = encodeUCoordinate(CURVE.Gu);
  function scalarMultBase(scalar) {
    return scalarMult(scalar, GuBytes);
  }
  return {
    scalarMult,
    scalarMultBase,
    getSharedSecret: (privateKey, publicKey) => scalarMult(privateKey, publicKey),
    getPublicKey: (privateKey) => scalarMultBase(privateKey),
    utils: { randomPrivateKey: () => CURVE.randomBytes(CURVE.nByteLength) },
    GuBytes
  };
}

// ../../node_modules/@noble/curves/esm/ed25519.js
var ED25519_P = BigInt("57896044618658097711785492504343953926634992332820282019728792003956564819949");
var _0n4 = BigInt(0);
var _1n3 = BigInt(1);
var _2n = BigInt(2);
var _3n = BigInt(3);
var _5n = BigInt(5);
var _8n = BigInt(8);
function ed25519_pow_2_252_3(x) {
  const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
  const P = ED25519_P;
  const x2 = x * x % P;
  const b2 = x2 * x % P;
  const b4 = pow2(b2, _2n, P) * b2 % P;
  const b5 = pow2(b4, _1n3, P) * x % P;
  const b10 = pow2(b5, _5n, P) * b5 % P;
  const b20 = pow2(b10, _10n, P) * b10 % P;
  const b40 = pow2(b20, _20n, P) * b20 % P;
  const b80 = pow2(b40, _40n, P) * b40 % P;
  const b160 = pow2(b80, _80n, P) * b80 % P;
  const b240 = pow2(b160, _80n, P) * b80 % P;
  const b250 = pow2(b240, _10n, P) * b10 % P;
  const pow_p_5_8 = pow2(b250, _2n, P) * x % P;
  return { pow_p_5_8, b2 };
}
function adjustScalarBytes(bytes2) {
  bytes2[0] &= 248;
  bytes2[31] &= 127;
  bytes2[31] |= 64;
  return bytes2;
}
var x25519 = /* @__PURE__ */ (() => montgomery({
  P: ED25519_P,
  a: BigInt(486662),
  montgomeryBits: 255,
  // n is 253 bits
  nByteLength: 32,
  Gu: BigInt(9),
  powPminus2: (x) => {
    const P = ED25519_P;
    const { pow_p_5_8, b2 } = ed25519_pow_2_252_3(x);
    return mod(pow2(pow_p_5_8, _3n, P) * b2, P);
  },
  adjustScalarBytes,
  randomBytes: randomBytes3
}))();

// ../../node_modules/@noble/hashes/esm/hmac.js
var HMAC = class extends Hash {
  constructor(hash, _key) {
    super();
    this.finished = false;
    this.destroyed = false;
    ahash(hash);
    const key = toBytes3(_key);
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    pad.fill(0);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    abytes(out, this.outputLen);
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to || (to = Object.create(Object.getPrototypeOf(this), {}));
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac = (hash, key, message2) => new HMAC(hash, key).update(message2).digest();
hmac.create = (hash, key) => new HMAC(hash, key);

// ../../node_modules/@noble/hashes/esm/hkdf.js
function extract(hash, ikm, salt) {
  ahash(hash);
  if (salt === void 0)
    salt = new Uint8Array(hash.outputLen);
  return hmac(hash, toBytes3(salt), toBytes3(ikm));
}
var HKDF_COUNTER = /* @__PURE__ */ new Uint8Array([0]);
var EMPTY_BUFFER = /* @__PURE__ */ new Uint8Array();
function expand(hash, prk, info, length3 = 32) {
  ahash(hash);
  anumber(length3);
  if (length3 > 255 * hash.outputLen)
    throw new Error("Length should be <= 255*HashLen");
  const blocks = Math.ceil(length3 / hash.outputLen);
  if (info === void 0)
    info = EMPTY_BUFFER;
  const okm = new Uint8Array(blocks * hash.outputLen);
  const HMAC2 = hmac.create(hash, prk);
  const HMACTmp = HMAC2._cloneInto();
  const T = new Uint8Array(HMAC2.outputLen);
  for (let counter = 0; counter < blocks; counter++) {
    HKDF_COUNTER[0] = counter + 1;
    HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T).update(info).update(HKDF_COUNTER).digestInto(T);
    okm.set(T, hash.outputLen * counter);
    HMAC2._cloneInto(HMACTmp);
  }
  HMAC2.destroy();
  HMACTmp.destroy();
  T.fill(0);
  HKDF_COUNTER.fill(0);
  return okm.slice(0, length3);
}

// ../../node_modules/@noble/hashes/esm/sha256.js
var SHA256_K = /* @__PURE__ */ new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_IV = /* @__PURE__ */ new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2562 = class extends HashMD {
  constructor() {
    super(64, 32, 8, false);
    this.A = SHA256_IV[0] | 0;
    this.B = SHA256_IV[1] | 0;
    this.C = SHA256_IV[2] | 0;
    this.D = SHA256_IV[3] | 0;
    this.E = SHA256_IV[4] | 0;
    this.F = SHA256_IV[5] | 0;
    this.G = SHA256_IV[6] | 0;
    this.H = SHA256_IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    SHA256_W.fill(0);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    this.buffer.fill(0);
  }
};
var sha2562 = /* @__PURE__ */ wrapConstructor(() => new SHA2562());

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/crypto/js.js
var pureJsCrypto = {
  hashSHA256(data) {
    return sha2562(data.subarray());
  },
  getHKDF(ck, ikm) {
    const prk = extract(sha2562, ikm, ck);
    const okmU8Array = expand(sha2562, prk, void 0, 96);
    const okm = okmU8Array;
    const k1 = okm.subarray(0, 32);
    const k2 = okm.subarray(32, 64);
    const k3 = okm.subarray(64, 96);
    return [k1, k2, k3];
  },
  generateX25519KeyPair() {
    const secretKey = x25519.utils.randomPrivateKey();
    const publicKey = x25519.getPublicKey(secretKey);
    return {
      publicKey,
      privateKey: secretKey
    };
  },
  generateX25519KeyPairFromSeed(seed) {
    const publicKey = x25519.getPublicKey(seed);
    return {
      publicKey,
      privateKey: seed
    };
  },
  generateX25519SharedKey(privateKey, publicKey) {
    return x25519.getSharedSecret(privateKey.subarray(), publicKey.subarray());
  },
  chaCha20Poly1305Encrypt(plaintext, nonce, ad, k) {
    return chacha20poly1305(k, nonce, ad).encrypt(plaintext.subarray());
  },
  chaCha20Poly1305Decrypt(ciphertext, nonce, ad, k, dst) {
    return chacha20poly1305(k, nonce, ad).decrypt(ciphertext.subarray(), dst);
  }
};

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/crypto/index.js
var ctx2 = (0, import_as_chacha20poly1305.newInstance)();
var asImpl = new import_as_chacha20poly1305.ChaCha20Poly1305(ctx2);
var CHACHA_POLY1305 = "chacha20-poly1305";
var PKCS8_PREFIX = Buffer.from([48, 46, 2, 1, 0, 48, 5, 6, 3, 43, 101, 110, 4, 34, 4, 32]);
var X25519_PREFIX = Buffer.from([48, 42, 48, 5, 6, 3, 43, 101, 110, 3, 33, 0]);
var nodeCrypto = {
  hashSHA256(data) {
    const hash = crypto4.createHash("sha256");
    if (data instanceof Uint8Array) {
      return hash.update(data).digest();
    }
    for (const buf of data) {
      hash.update(buf);
    }
    return hash.digest();
  },
  chaCha20Poly1305Encrypt(plaintext, nonce, ad, k) {
    const cipher = crypto4.createCipheriv(CHACHA_POLY1305, k, nonce, {
      authTagLength: 16
    });
    cipher.setAAD(ad, { plaintextLength: plaintext.byteLength });
    if (plaintext instanceof Uint8Array) {
      const updated = cipher.update(plaintext);
      const final3 = cipher.final();
      const tag = cipher.getAuthTag();
      return Buffer.concat([updated, final3, tag], updated.byteLength + final3.byteLength + tag.byteLength);
    }
    const output2 = new Uint8ArrayList();
    for (const buf of plaintext) {
      output2.append(cipher.update(buf));
    }
    const final2 = cipher.final();
    if (final2.byteLength > 0) {
      output2.append(final2);
    }
    output2.append(cipher.getAuthTag());
    return output2;
  },
  chaCha20Poly1305Decrypt(ciphertext, nonce, ad, k, _dst) {
    const authTag = ciphertext.subarray(ciphertext.length - 16);
    const decipher = crypto4.createDecipheriv(CHACHA_POLY1305, k, nonce, {
      authTagLength: 16
    });
    let text;
    if (ciphertext instanceof Uint8Array) {
      text = ciphertext.subarray(0, ciphertext.length - 16);
    } else {
      text = ciphertext.sublist(0, ciphertext.length - 16);
    }
    decipher.setAAD(ad, {
      plaintextLength: text.byteLength
    });
    decipher.setAuthTag(authTag);
    if (text instanceof Uint8Array) {
      const output3 = decipher.update(text);
      const final3 = decipher.final();
      if (final3.byteLength > 0) {
        return Buffer.concat([output3, final3], output3.byteLength + final3.byteLength);
      }
      return output3;
    }
    const output2 = new Uint8ArrayList();
    for (const buf of text) {
      output2.append(decipher.update(buf));
    }
    const final2 = decipher.final();
    if (final2.byteLength > 0) {
      output2.append(final2);
    }
    return output2;
  }
};
var asCrypto = {
  hashSHA256(data) {
    return digest2(data.subarray());
  },
  chaCha20Poly1305Encrypt(plaintext, nonce, ad, k) {
    return asImpl.seal(k, nonce, plaintext.subarray(), ad);
  },
  chaCha20Poly1305Decrypt(ciphertext, nonce, ad, k, dst) {
    const plaintext = asImpl.open(k, nonce, ciphertext.subarray(), ad, dst);
    if (!plaintext) {
      throw new Error("Invalid chacha20poly1305 decryption");
    }
    return plaintext;
  }
};
var defaultCrypto = {
  ...pureJsCrypto,
  hashSHA256(data) {
    return nodeCrypto.hashSHA256(data);
  },
  chaCha20Poly1305Encrypt(plaintext, nonce, ad, k) {
    if (plaintext.byteLength < 1200) {
      return asCrypto.chaCha20Poly1305Encrypt(plaintext, nonce, ad, k);
    }
    return nodeCrypto.chaCha20Poly1305Encrypt(plaintext, nonce, ad, k);
  },
  chaCha20Poly1305Decrypt(ciphertext, nonce, ad, k, dst) {
    if (ciphertext.byteLength < 1200) {
      return asCrypto.chaCha20Poly1305Decrypt(ciphertext, nonce, ad, k, dst);
    }
    return nodeCrypto.chaCha20Poly1305Decrypt(ciphertext, nonce, ad, k, dst);
  },
  generateX25519KeyPair() {
    const { publicKey, privateKey } = crypto4.generateKeyPairSync("x25519", {
      publicKeyEncoding: {
        type: "spki",
        format: "der"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "der"
      }
    });
    return {
      publicKey: publicKey.subarray(X25519_PREFIX.length),
      privateKey: privateKey.subarray(PKCS8_PREFIX.length)
    };
  },
  generateX25519KeyPairFromSeed(seed) {
    const privateKey = crypto4.createPrivateKey({
      key: Buffer.concat([
        PKCS8_PREFIX,
        seed
      ], PKCS8_PREFIX.byteLength + seed.byteLength),
      type: "pkcs8",
      format: "der"
    });
    const publicKey = crypto4.createPublicKey(privateKey).export({
      type: "spki",
      format: "der"
    }).subarray(X25519_PREFIX.length);
    return {
      publicKey,
      privateKey: seed
    };
  },
  generateX25519SharedKey(privateKey, publicKey) {
    if (publicKey instanceof Uint8Array) {
      publicKey = Buffer.concat([
        X25519_PREFIX,
        publicKey
      ], X25519_PREFIX.byteLength + publicKey.byteLength);
    } else {
      publicKey = new Uint8ArrayList(X25519_PREFIX, publicKey).subarray();
    }
    if (privateKey instanceof Uint8Array) {
      privateKey = Buffer.concat([
        PKCS8_PREFIX,
        privateKey
      ], PKCS8_PREFIX.byteLength + privateKey.byteLength);
    } else {
      privateKey = new Uint8ArrayList(PKCS8_PREFIX, privateKey).subarray();
    }
    return crypto4.diffieHellman({
      publicKey: crypto4.createPublicKey({
        key: Buffer.from(publicKey, publicKey.byteOffset, publicKey.byteLength),
        type: "spki",
        format: "der"
      }),
      privateKey: crypto4.createPrivateKey({
        key: Buffer.from(privateKey, privateKey.byteOffset, privateKey.byteLength),
        type: "pkcs8",
        format: "der"
      })
    });
  }
};
if (isElectronMain) {
  defaultCrypto.chaCha20Poly1305Encrypt = asCrypto.chaCha20Poly1305Encrypt;
  defaultCrypto.chaCha20Poly1305Decrypt = asCrypto.chaCha20Poly1305Decrypt;
}

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/crypto.js
function wrapCrypto(crypto5) {
  return {
    generateKeypair: crypto5.generateX25519KeyPair,
    dh: (keypair, publicKey) => crypto5.generateX25519SharedKey(keypair.privateKey, publicKey).subarray(0, 32),
    encrypt: crypto5.chaCha20Poly1305Encrypt,
    decrypt: crypto5.chaCha20Poly1305Decrypt,
    hash: crypto5.hashSHA256,
    hkdf: crypto5.getHKDF
  };
}

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/encoder.js
var uint16BEEncode = (value) => {
  const target = allocUnsafe(2);
  target[0] = value >> 8;
  target[1] = value;
  return target;
};
uint16BEEncode.bytes = 2;
var uint16BEDecode = (data) => {
  if (data.length < 2)
    throw RangeError("Could not decode int16BE");
  if (data instanceof Uint8Array) {
    let value = 0;
    value += data[0] << 8;
    value += data[1];
    return value;
  }
  return data.getUint16(0);
};
uint16BEDecode.bytes = 2;

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/metrics.js
function registerMetrics(metrics) {
  return {
    xxHandshakeSuccesses: metrics.registerCounter("libp2p_noise_xxhandshake_successes_total", {
      help: "Total count of noise xxHandshakes successes_"
    }),
    xxHandshakeErrors: metrics.registerCounter("libp2p_noise_xxhandshake_error_total", {
      help: "Total count of noise xxHandshakes errors"
    }),
    encryptedPackets: metrics.registerCounter("libp2p_noise_encrypted_packets_total", {
      help: "Total count of noise encrypted packets successfully"
    }),
    decryptedPackets: metrics.registerCounter("libp2p_noise_decrypted_packets_total", {
      help: "Total count of noise decrypted packets"
    }),
    decryptErrors: metrics.registerCounter("libp2p_noise_decrypt_errors_total", {
      help: "Total count of noise decrypt errors"
    })
  };
}

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/logger.js
function logLocalStaticKeys(s, keyLogger) {
  if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
    return;
  }
  if (s) {
    keyLogger(`LOCAL_STATIC_PUBLIC_KEY ${toString2(s.publicKey, "hex")}`);
    keyLogger(`LOCAL_STATIC_PRIVATE_KEY ${toString2(s.privateKey, "hex")}`);
  } else {
    keyLogger("Missing local static keys.");
  }
}
function logLocalEphemeralKeys(e, keyLogger) {
  if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
    return;
  }
  if (e) {
    keyLogger(`LOCAL_PUBLIC_EPHEMERAL_KEY ${toString2(e.publicKey, "hex")}`);
    keyLogger(`LOCAL_PRIVATE_EPHEMERAL_KEY ${toString2(e.privateKey, "hex")}`);
  } else {
    keyLogger("Missing local ephemeral keys.");
  }
}
function logRemoteStaticKey(rs, keyLogger) {
  if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
    return;
  }
  if (rs) {
    keyLogger(`REMOTE_STATIC_PUBLIC_KEY ${toString2(rs.subarray(), "hex")}`);
  } else {
    keyLogger("Missing remote static public key.");
  }
}
function logRemoteEphemeralKey(re, keyLogger) {
  if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
    return;
  }
  if (re) {
    keyLogger(`REMOTE_EPHEMERAL_PUBLIC_KEY ${toString2(re.subarray(), "hex")}`);
  } else {
    keyLogger("Missing remote ephemeral keys.");
  }
}
function logCipherState(cs1, cs2, keyLogger) {
  if (!keyLogger.enabled || !DUMP_SESSION_KEYS) {
    return;
  }
  keyLogger(`CIPHER_STATE_1 ${cs1.n.getUint64()} ${cs1.k && toString2(cs1.k, "hex")}`);
  keyLogger(`CIPHER_STATE_2 ${cs2.n.getUint64()} ${cs2.k && toString2(cs2.k, "hex")}`);
}

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/errors.js
var InvalidCryptoExchangeError = class _InvalidCryptoExchangeError extends Error {
  code;
  constructor(message2 = "Invalid crypto exchange") {
    super(message2);
    this.code = _InvalidCryptoExchangeError.code;
  }
  static code = "ERR_INVALID_CRYPTO_EXCHANGE";
};

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/nonce.js
var MIN_NONCE = 0;
var MAX_NONCE = 4294967295;
var ERR_MAX_NONCE = "Cipherstate has reached maximum n, a new handshake must be performed";
var Nonce = class {
  n;
  bytes;
  view;
  constructor(n = MIN_NONCE) {
    this.n = n;
    this.bytes = alloc(12);
    this.view = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength);
    this.view.setUint32(4, n, true);
  }
  increment() {
    this.n++;
    this.view.setUint32(4, this.n, true);
  }
  getBytes() {
    return this.bytes;
  }
  getUint64() {
    return this.n;
  }
  assertValue() {
    if (this.n > MAX_NONCE) {
      throw new Error(ERR_MAX_NONCE);
    }
  }
};

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/protocol.js
var ZEROLEN = alloc(0);
var CipherState = class {
  k;
  n;
  crypto;
  constructor(crypto5, k = void 0, n = 0) {
    this.crypto = crypto5;
    this.k = k;
    this.n = new Nonce(n);
  }
  hasKey() {
    return Boolean(this.k);
  }
  encryptWithAd(ad, plaintext) {
    if (!this.hasKey()) {
      return plaintext;
    }
    this.n.assertValue();
    const e = this.crypto.encrypt(plaintext, this.n.getBytes(), ad, this.k);
    this.n.increment();
    return e;
  }
  decryptWithAd(ad, ciphertext, dst) {
    if (!this.hasKey()) {
      return ciphertext;
    }
    this.n.assertValue();
    const plaintext = this.crypto.decrypt(ciphertext, this.n.getBytes(), ad, this.k, dst);
    this.n.increment();
    return plaintext;
  }
};
var SymmetricState = class {
  cs;
  ck;
  h;
  crypto;
  constructor(crypto5, protocolName) {
    this.crypto = crypto5;
    const protocolNameBytes = fromString2(protocolName, "utf-8");
    this.h = hashProtocolName(crypto5, protocolNameBytes);
    this.ck = this.h;
    this.cs = new CipherState(crypto5);
  }
  mixKey(ikm) {
    const [ck, tempK] = this.crypto.hkdf(this.ck, ikm);
    this.ck = ck;
    this.cs = new CipherState(this.crypto, tempK);
  }
  mixHash(data) {
    this.h = this.crypto.hash(new Uint8ArrayList(this.h, data));
  }
  encryptAndHash(plaintext) {
    const ciphertext = this.cs.encryptWithAd(this.h, plaintext);
    this.mixHash(ciphertext);
    return ciphertext;
  }
  decryptAndHash(ciphertext) {
    const plaintext = this.cs.decryptWithAd(this.h, ciphertext);
    this.mixHash(ciphertext);
    return plaintext;
  }
  split() {
    const [tempK1, tempK2] = this.crypto.hkdf(this.ck, ZEROLEN);
    return [new CipherState(this.crypto, tempK1), new CipherState(this.crypto, tempK2)];
  }
};
var AbstractHandshakeState = class {
  ss;
  s;
  e;
  rs;
  re;
  initiator;
  crypto;
  constructor(init) {
    const { crypto: crypto5, protocolName, prologue, initiator, s, e, rs, re } = init;
    this.crypto = crypto5;
    this.ss = new SymmetricState(crypto5, protocolName);
    this.ss.mixHash(prologue);
    this.initiator = initiator;
    this.s = s;
    this.e = e;
    this.rs = rs;
    this.re = re;
  }
  writeE() {
    if (this.e) {
      throw new Error("ephemeral keypair is already set");
    }
    const e = this.crypto.generateKeypair();
    this.ss.mixHash(e.publicKey);
    this.e = e;
    return e.publicKey;
  }
  writeS() {
    if (!this.s) {
      throw new Error("static keypair is not set");
    }
    return this.ss.encryptAndHash(this.s.publicKey);
  }
  writeEE() {
    if (!this.e) {
      throw new Error("ephemeral keypair is not set");
    }
    if (!this.re) {
      throw new Error("remote ephemeral public key is not set");
    }
    this.ss.mixKey(this.crypto.dh(this.e, this.re));
  }
  writeES() {
    if (this.initiator) {
      if (!this.e) {
        throw new Error("ephemeral keypair is not set");
      }
      if (!this.rs) {
        throw new Error("remote static public key is not set");
      }
      this.ss.mixKey(this.crypto.dh(this.e, this.rs));
    } else {
      if (!this.s) {
        throw new Error("static keypair is not set");
      }
      if (!this.re) {
        throw new Error("remote ephemeral public key is not set");
      }
      this.ss.mixKey(this.crypto.dh(this.s, this.re));
    }
  }
  writeSE() {
    if (this.initiator) {
      if (!this.s) {
        throw new Error("static keypair is not set");
      }
      if (!this.re) {
        throw new Error("remote ephemeral public key is not set");
      }
      this.ss.mixKey(this.crypto.dh(this.s, this.re));
    } else {
      if (!this.e) {
        throw new Error("ephemeral keypair is not set");
      }
      if (!this.rs) {
        throw new Error("remote static public key is not set");
      }
      this.ss.mixKey(this.crypto.dh(this.e, this.rs));
    }
  }
  readE(message2, offset = 0) {
    if (this.re) {
      throw new Error("remote ephemeral public key is already set");
    }
    if (message2.byteLength < offset + 32) {
      throw new Error("message is not long enough");
    }
    this.re = message2.sublist(offset, offset + 32);
    this.ss.mixHash(this.re);
  }
  readS(message2, offset = 0) {
    if (this.rs) {
      throw new Error("remote static public key is already set");
    }
    const cipherLength = 32 + (this.ss.cs.hasKey() ? 16 : 0);
    if (message2.byteLength < offset + cipherLength) {
      throw new Error("message is not long enough");
    }
    const temp = message2.sublist(offset, offset + cipherLength);
    this.rs = this.ss.decryptAndHash(temp);
    return cipherLength;
  }
  readEE() {
    this.writeEE();
  }
  readES() {
    this.writeES();
  }
  readSE() {
    this.writeSE();
  }
};
var XXHandshakeState = class extends AbstractHandshakeState {
  // e
  writeMessageA(payload) {
    return new Uint8ArrayList(this.writeE(), this.ss.encryptAndHash(payload));
  }
  // e, ee, s, es
  writeMessageB(payload) {
    const e = this.writeE();
    this.writeEE();
    const encS = this.writeS();
    this.writeES();
    return new Uint8ArrayList(e, encS, this.ss.encryptAndHash(payload));
  }
  // s, se
  writeMessageC(payload) {
    const encS = this.writeS();
    this.writeSE();
    return new Uint8ArrayList(encS, this.ss.encryptAndHash(payload));
  }
  // e
  readMessageA(message2) {
    try {
      this.readE(message2);
      return this.ss.decryptAndHash(message2.sublist(32));
    } catch (e) {
      throw new InvalidCryptoExchangeError(`handshake stage 0 validation fail: ${e.message}`);
    }
  }
  // e, ee, s, es
  readMessageB(message2) {
    try {
      this.readE(message2);
      this.readEE();
      const consumed = this.readS(message2, 32);
      this.readES();
      return this.ss.decryptAndHash(message2.sublist(32 + consumed));
    } catch (e) {
      throw new InvalidCryptoExchangeError(`handshake stage 1 validation fail: ${e.message}`);
    }
  }
  // s, se
  readMessageC(message2) {
    try {
      const consumed = this.readS(message2);
      this.readSE();
      return this.ss.decryptAndHash(message2.sublist(consumed));
    } catch (e) {
      throw new InvalidCryptoExchangeError(`handshake stage 2 validation fail: ${e.message}`);
    }
  }
};
function hashProtocolName(crypto5, protocolName) {
  if (protocolName.length <= 32) {
    const h = alloc(32);
    h.set(protocolName);
    return h;
  } else {
    return crypto5.hash(protocolName);
  }
}

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/utils.js
import { publicKeyFromProtobuf as publicKeyFromProtobuf2, publicKeyToProtobuf } from "@libp2p/crypto/keys";
import { UnexpectedPeerError } from "@libp2p/interface";

// ../../node_modules/protons-runtime/dist/src/utils/float.js
var f32 = new Float32Array([-0]);
var f8b = new Uint8Array(f32.buffer);
function writeFloatLE(val, buf, pos) {
  f32[0] = val;
  buf[pos] = f8b[0];
  buf[pos + 1] = f8b[1];
  buf[pos + 2] = f8b[2];
  buf[pos + 3] = f8b[3];
}
function readFloatLE(buf, pos) {
  f8b[0] = buf[pos];
  f8b[1] = buf[pos + 1];
  f8b[2] = buf[pos + 2];
  f8b[3] = buf[pos + 3];
  return f32[0];
}
var f64 = new Float64Array([-0]);
var d8b = new Uint8Array(f64.buffer);
function writeDoubleLE(val, buf, pos) {
  f64[0] = val;
  buf[pos] = d8b[0];
  buf[pos + 1] = d8b[1];
  buf[pos + 2] = d8b[2];
  buf[pos + 3] = d8b[3];
  buf[pos + 4] = d8b[4];
  buf[pos + 5] = d8b[5];
  buf[pos + 6] = d8b[6];
  buf[pos + 7] = d8b[7];
}
function readDoubleLE(buf, pos) {
  d8b[0] = buf[pos];
  d8b[1] = buf[pos + 1];
  d8b[2] = buf[pos + 2];
  d8b[3] = buf[pos + 3];
  d8b[4] = buf[pos + 4];
  d8b[5] = buf[pos + 5];
  d8b[6] = buf[pos + 6];
  d8b[7] = buf[pos + 7];
  return f64[0];
}

// ../../node_modules/protons-runtime/dist/src/utils/longbits.js
var MAX_SAFE_NUMBER_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
var MIN_SAFE_NUMBER_INTEGER = BigInt(Number.MIN_SAFE_INTEGER);
var LongBits = class _LongBits {
  lo;
  hi;
  constructor(lo, hi) {
    this.lo = lo | 0;
    this.hi = hi | 0;
  }
  /**
   * Converts this long bits to a possibly unsafe JavaScript number
   */
  toNumber(unsigned = false) {
    if (!unsigned && this.hi >>> 31 > 0) {
      const lo = ~this.lo + 1 >>> 0;
      let hi = ~this.hi >>> 0;
      if (lo === 0) {
        hi = hi + 1 >>> 0;
      }
      return -(lo + hi * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }
  /**
   * Converts this long bits to a bigint
   */
  toBigInt(unsigned = false) {
    if (unsigned) {
      return BigInt(this.lo >>> 0) + (BigInt(this.hi >>> 0) << 32n);
    }
    if (this.hi >>> 31 !== 0) {
      const lo = ~this.lo + 1 >>> 0;
      let hi = ~this.hi >>> 0;
      if (lo === 0) {
        hi = hi + 1 >>> 0;
      }
      return -(BigInt(lo) + (BigInt(hi) << 32n));
    }
    return BigInt(this.lo >>> 0) + (BigInt(this.hi >>> 0) << 32n);
  }
  /**
   * Converts this long bits to a string
   */
  toString(unsigned = false) {
    return this.toBigInt(unsigned).toString();
  }
  /**
   * Zig-zag encodes this long bits
   */
  zzEncode() {
    const mask = this.hi >> 31;
    this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
    this.lo = (this.lo << 1 ^ mask) >>> 0;
    return this;
  }
  /**
   * Zig-zag decodes this long bits
   */
  zzDecode() {
    const mask = -(this.lo & 1);
    this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
    this.hi = (this.hi >>> 1 ^ mask) >>> 0;
    return this;
  }
  /**
   * Calculates the length of this longbits when encoded as a varint.
   */
  length() {
    const part0 = this.lo;
    const part1 = (this.lo >>> 28 | this.hi << 4) >>> 0;
    const part2 = this.hi >>> 24;
    return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
  }
  /**
   * Constructs new long bits from the specified number
   */
  static fromBigInt(value) {
    if (value === 0n) {
      return zero;
    }
    if (value < MAX_SAFE_NUMBER_INTEGER && value > MIN_SAFE_NUMBER_INTEGER) {
      return this.fromNumber(Number(value));
    }
    const negative = value < 0n;
    if (negative) {
      value = -value;
    }
    let hi = value >> 32n;
    let lo = value - (hi << 32n);
    if (negative) {
      hi = ~hi | 0n;
      lo = ~lo | 0n;
      if (++lo > TWO_32) {
        lo = 0n;
        if (++hi > TWO_32) {
          hi = 0n;
        }
      }
    }
    return new _LongBits(Number(lo), Number(hi));
  }
  /**
   * Constructs new long bits from the specified number
   */
  static fromNumber(value) {
    if (value === 0) {
      return zero;
    }
    const sign = value < 0;
    if (sign) {
      value = -value;
    }
    let lo = value >>> 0;
    let hi = (value - lo) / 4294967296 >>> 0;
    if (sign) {
      hi = ~hi >>> 0;
      lo = ~lo >>> 0;
      if (++lo > 4294967295) {
        lo = 0;
        if (++hi > 4294967295) {
          hi = 0;
        }
      }
    }
    return new _LongBits(lo, hi);
  }
  /**
   * Constructs new long bits from a number, long or string
   */
  static from(value) {
    if (typeof value === "number") {
      return _LongBits.fromNumber(value);
    }
    if (typeof value === "bigint") {
      return _LongBits.fromBigInt(value);
    }
    if (typeof value === "string") {
      return _LongBits.fromBigInt(BigInt(value));
    }
    return value.low != null || value.high != null ? new _LongBits(value.low >>> 0, value.high >>> 0) : zero;
  }
};
var zero = new LongBits(0, 0);
zero.toBigInt = function() {
  return 0n;
};
zero.zzEncode = zero.zzDecode = function() {
  return this;
};
zero.length = function() {
  return 1;
};
var TWO_32 = 4294967296n;

// ../../node_modules/protons-runtime/dist/src/utils/utf8.js
function length2(string3) {
  let len = 0;
  let c = 0;
  for (let i = 0; i < string3.length; ++i) {
    c = string3.charCodeAt(i);
    if (c < 128) {
      len += 1;
    } else if (c < 2048) {
      len += 2;
    } else if ((c & 64512) === 55296 && (string3.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else {
      len += 3;
    }
  }
  return len;
}
function read2(buffer, start2, end) {
  const len = end - start2;
  if (len < 1) {
    return "";
  }
  let parts;
  const chunk = [];
  let i = 0;
  let t;
  while (start2 < end) {
    t = buffer[start2++];
    if (t < 128) {
      chunk[i++] = t;
    } else if (t > 191 && t < 224) {
      chunk[i++] = (t & 31) << 6 | buffer[start2++] & 63;
    } else if (t > 239 && t < 365) {
      t = ((t & 7) << 18 | (buffer[start2++] & 63) << 12 | (buffer[start2++] & 63) << 6 | buffer[start2++] & 63) - 65536;
      chunk[i++] = 55296 + (t >> 10);
      chunk[i++] = 56320 + (t & 1023);
    } else {
      chunk[i++] = (t & 15) << 12 | (buffer[start2++] & 63) << 6 | buffer[start2++] & 63;
    }
    if (i > 8191) {
      (parts ?? (parts = [])).push(String.fromCharCode.apply(String, chunk));
      i = 0;
    }
  }
  if (parts != null) {
    if (i > 0) {
      parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
    }
    return parts.join("");
  }
  return String.fromCharCode.apply(String, chunk.slice(0, i));
}
function write(string3, buffer, offset) {
  const start2 = offset;
  let c1;
  let c2;
  for (let i = 0; i < string3.length; ++i) {
    c1 = string3.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string3.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return offset - start2;
}

// ../../node_modules/protons-runtime/dist/src/utils/reader.js
function indexOutOfRange(reader, writeLength) {
  return RangeError(`index out of range: ${reader.pos} + ${writeLength ?? 1} > ${reader.len}`);
}
function readFixed32End(buf, end) {
  return (buf[end - 4] | buf[end - 3] << 8 | buf[end - 2] << 16 | buf[end - 1] << 24) >>> 0;
}
var Uint8ArrayReader = class {
  buf;
  pos;
  len;
  _slice = Uint8Array.prototype.subarray;
  constructor(buffer) {
    this.buf = buffer;
    this.pos = 0;
    this.len = buffer.length;
  }
  /**
   * Reads a varint as an unsigned 32 bit value
   */
  uint32() {
    let value = 4294967295;
    value = (this.buf[this.pos] & 127) >>> 0;
    if (this.buf[this.pos++] < 128)
      return value;
    value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
    if (this.buf[this.pos++] < 128)
      return value;
    value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
    if (this.buf[this.pos++] < 128)
      return value;
    value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
    if (this.buf[this.pos++] < 128)
      return value;
    value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
    if (this.buf[this.pos++] < 128)
      return value;
    if ((this.pos += 5) > this.len) {
      this.pos = this.len;
      throw indexOutOfRange(this, 10);
    }
    return value;
  }
  /**
   * Reads a varint as a signed 32 bit value
   */
  int32() {
    return this.uint32() | 0;
  }
  /**
   * Reads a zig-zag encoded varint as a signed 32 bit value
   */
  sint32() {
    const value = this.uint32();
    return value >>> 1 ^ -(value & 1) | 0;
  }
  /**
   * Reads a varint as a boolean
   */
  bool() {
    return this.uint32() !== 0;
  }
  /**
   * Reads fixed 32 bits as an unsigned 32 bit integer
   */
  fixed32() {
    if (this.pos + 4 > this.len) {
      throw indexOutOfRange(this, 4);
    }
    const res = readFixed32End(this.buf, this.pos += 4);
    return res;
  }
  /**
   * Reads fixed 32 bits as a signed 32 bit integer
   */
  sfixed32() {
    if (this.pos + 4 > this.len) {
      throw indexOutOfRange(this, 4);
    }
    const res = readFixed32End(this.buf, this.pos += 4) | 0;
    return res;
  }
  /**
   * Reads a float (32 bit) as a number
   */
  float() {
    if (this.pos + 4 > this.len) {
      throw indexOutOfRange(this, 4);
    }
    const value = readFloatLE(this.buf, this.pos);
    this.pos += 4;
    return value;
  }
  /**
   * Reads a double (64 bit float) as a number
   */
  double() {
    if (this.pos + 8 > this.len) {
      throw indexOutOfRange(this, 4);
    }
    const value = readDoubleLE(this.buf, this.pos);
    this.pos += 8;
    return value;
  }
  /**
   * Reads a sequence of bytes preceded by its length as a varint
   */
  bytes() {
    const length3 = this.uint32();
    const start2 = this.pos;
    const end = this.pos + length3;
    if (end > this.len) {
      throw indexOutOfRange(this, length3);
    }
    this.pos += length3;
    return start2 === end ? new Uint8Array(0) : this.buf.subarray(start2, end);
  }
  /**
   * Reads a string preceded by its byte length as a varint
   */
  string() {
    const bytes2 = this.bytes();
    return read2(bytes2, 0, bytes2.length);
  }
  /**
   * Skips the specified number of bytes if specified, otherwise skips a varint
   */
  skip(length3) {
    if (typeof length3 === "number") {
      if (this.pos + length3 > this.len) {
        throw indexOutOfRange(this, length3);
      }
      this.pos += length3;
    } else {
      do {
        if (this.pos >= this.len) {
          throw indexOutOfRange(this);
        }
      } while ((this.buf[this.pos++] & 128) !== 0);
    }
    return this;
  }
  /**
   * Skips the next element of the specified wire type
   */
  skipType(wireType) {
    switch (wireType) {
      case 0:
        this.skip();
        break;
      case 1:
        this.skip(8);
        break;
      case 2:
        this.skip(this.uint32());
        break;
      case 3:
        while ((wireType = this.uint32() & 7) !== 4) {
          this.skipType(wireType);
        }
        break;
      case 5:
        this.skip(4);
        break;
      /* istanbul ignore next */
      default:
        throw Error(`invalid wire type ${wireType} at offset ${this.pos}`);
    }
    return this;
  }
  readLongVarint() {
    const bits = new LongBits(0, 0);
    let i = 0;
    if (this.len - this.pos > 4) {
      for (; i < 4; ++i) {
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
        if (this.buf[this.pos++] < 128) {
          return bits;
        }
      }
      bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
      bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
      if (this.buf[this.pos++] < 128) {
        return bits;
      }
      i = 0;
    } else {
      for (; i < 3; ++i) {
        if (this.pos >= this.len) {
          throw indexOutOfRange(this);
        }
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
        if (this.buf[this.pos++] < 128) {
          return bits;
        }
      }
      bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
      return bits;
    }
    if (this.len - this.pos > 4) {
      for (; i < 5; ++i) {
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
        if (this.buf[this.pos++] < 128) {
          return bits;
        }
      }
    } else {
      for (; i < 5; ++i) {
        if (this.pos >= this.len) {
          throw indexOutOfRange(this);
        }
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
        if (this.buf[this.pos++] < 128) {
          return bits;
        }
      }
    }
    throw Error("invalid varint encoding");
  }
  readFixed64() {
    if (this.pos + 8 > this.len) {
      throw indexOutOfRange(this, 8);
    }
    const lo = readFixed32End(this.buf, this.pos += 4);
    const hi = readFixed32End(this.buf, this.pos += 4);
    return new LongBits(lo, hi);
  }
  /**
   * Reads a varint as a signed 64 bit value
   */
  int64() {
    return this.readLongVarint().toBigInt();
  }
  /**
   * Reads a varint as a signed 64 bit value returned as a possibly unsafe
   * JavaScript number
   */
  int64Number() {
    return this.readLongVarint().toNumber();
  }
  /**
   * Reads a varint as a signed 64 bit value returned as a string
   */
  int64String() {
    return this.readLongVarint().toString();
  }
  /**
   * Reads a varint as an unsigned 64 bit value
   */
  uint64() {
    return this.readLongVarint().toBigInt(true);
  }
  /**
   * Reads a varint as an unsigned 64 bit value returned as a possibly unsafe
   * JavaScript number
   */
  uint64Number() {
    const value = decodeUint8Array(this.buf, this.pos);
    this.pos += encodingLength2(value);
    return value;
  }
  /**
   * Reads a varint as an unsigned 64 bit value returned as a string
   */
  uint64String() {
    return this.readLongVarint().toString(true);
  }
  /**
   * Reads a zig-zag encoded varint as a signed 64 bit value
   */
  sint64() {
    return this.readLongVarint().zzDecode().toBigInt();
  }
  /**
   * Reads a zig-zag encoded varint as a signed 64 bit value returned as a
   * possibly unsafe JavaScript number
   */
  sint64Number() {
    return this.readLongVarint().zzDecode().toNumber();
  }
  /**
   * Reads a zig-zag encoded varint as a signed 64 bit value returned as a
   * string
   */
  sint64String() {
    return this.readLongVarint().zzDecode().toString();
  }
  /**
   * Reads fixed 64 bits
   */
  fixed64() {
    return this.readFixed64().toBigInt();
  }
  /**
   * Reads fixed 64 bits returned as a possibly unsafe JavaScript number
   */
  fixed64Number() {
    return this.readFixed64().toNumber();
  }
  /**
   * Reads fixed 64 bits returned as a string
   */
  fixed64String() {
    return this.readFixed64().toString();
  }
  /**
   * Reads zig-zag encoded fixed 64 bits
   */
  sfixed64() {
    return this.readFixed64().toBigInt();
  }
  /**
   * Reads zig-zag encoded fixed 64 bits returned as a possibly unsafe
   * JavaScript number
   */
  sfixed64Number() {
    return this.readFixed64().toNumber();
  }
  /**
   * Reads zig-zag encoded fixed 64 bits returned as a string
   */
  sfixed64String() {
    return this.readFixed64().toString();
  }
};
function createReader(buf) {
  return new Uint8ArrayReader(buf instanceof Uint8Array ? buf : buf.subarray());
}

// ../../node_modules/protons-runtime/dist/src/decode.js
function decodeMessage(buf, codec, opts) {
  const reader = createReader(buf);
  return codec.decode(reader, void 0, opts);
}

// ../../node_modules/protons-runtime/dist/src/utils/pool.js
function pool(size) {
  const SIZE = size ?? 8192;
  const MAX = SIZE >>> 1;
  let slab;
  let offset = SIZE;
  return function poolAlloc(size2) {
    if (size2 < 1 || size2 > MAX) {
      return allocUnsafe(size2);
    }
    if (offset + size2 > SIZE) {
      slab = allocUnsafe(SIZE);
      offset = 0;
    }
    const buf = slab.subarray(offset, offset += size2);
    if ((offset & 7) !== 0) {
      offset = (offset | 7) + 1;
    }
    return buf;
  };
}

// ../../node_modules/protons-runtime/dist/src/utils/writer.js
var Op = class {
  /**
   * Function to call
   */
  fn;
  /**
   * Value byte length
   */
  len;
  /**
   * Next operation
   */
  next;
  /**
   * Value to write
   */
  val;
  constructor(fn, len, val) {
    this.fn = fn;
    this.len = len;
    this.next = void 0;
    this.val = val;
  }
};
function noop() {
}
var State = class {
  /**
   * Current head
   */
  head;
  /**
   * Current tail
   */
  tail;
  /**
   * Current buffer length
   */
  len;
  /**
   * Next state
   */
  next;
  constructor(writer) {
    this.head = writer.head;
    this.tail = writer.tail;
    this.len = writer.len;
    this.next = writer.states;
  }
};
var bufferPool = pool();
function alloc2(size) {
  if (globalThis.Buffer != null) {
    return allocUnsafe(size);
  }
  return bufferPool(size);
}
var Uint8ArrayWriter = class {
  /**
   * Current length
   */
  len;
  /**
   * Operations head
   */
  head;
  /**
   * Operations tail
   */
  tail;
  /**
   * Linked forked states
   */
  states;
  constructor() {
    this.len = 0;
    this.head = new Op(noop, 0, 0);
    this.tail = this.head;
    this.states = null;
  }
  /**
   * Pushes a new operation to the queue
   */
  _push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
  }
  /**
   * Writes an unsigned 32 bit value as a varint
   */
  uint32(value) {
    this.len += (this.tail = this.tail.next = new VarintOp((value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5, value)).len;
    return this;
  }
  /**
   * Writes a signed 32 bit value as a varint`
   */
  int32(value) {
    return value < 0 ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) : this.uint32(value);
  }
  /**
   * Writes a 32 bit value as a varint, zig-zag encoded
   */
  sint32(value) {
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
  }
  /**
   * Writes an unsigned 64 bit value as a varint
   */
  uint64(value) {
    const bits = LongBits.fromBigInt(value);
    return this._push(writeVarint64, bits.length(), bits);
  }
  /**
   * Writes an unsigned 64 bit value as a varint
   */
  uint64Number(value) {
    return this._push(encodeUint8Array, encodingLength2(value), value);
  }
  /**
   * Writes an unsigned 64 bit value as a varint
   */
  uint64String(value) {
    return this.uint64(BigInt(value));
  }
  /**
   * Writes a signed 64 bit value as a varint
   */
  int64(value) {
    return this.uint64(value);
  }
  /**
   * Writes a signed 64 bit value as a varint
   */
  int64Number(value) {
    return this.uint64Number(value);
  }
  /**
   * Writes a signed 64 bit value as a varint
   */
  int64String(value) {
    return this.uint64String(value);
  }
  /**
   * Writes a signed 64 bit value as a varint, zig-zag encoded
   */
  sint64(value) {
    const bits = LongBits.fromBigInt(value).zzEncode();
    return this._push(writeVarint64, bits.length(), bits);
  }
  /**
   * Writes a signed 64 bit value as a varint, zig-zag encoded
   */
  sint64Number(value) {
    const bits = LongBits.fromNumber(value).zzEncode();
    return this._push(writeVarint64, bits.length(), bits);
  }
  /**
   * Writes a signed 64 bit value as a varint, zig-zag encoded
   */
  sint64String(value) {
    return this.sint64(BigInt(value));
  }
  /**
   * Writes a boolish value as a varint
   */
  bool(value) {
    return this._push(writeByte, 1, value ? 1 : 0);
  }
  /**
   * Writes an unsigned 32 bit value as fixed 32 bits
   */
  fixed32(value) {
    return this._push(writeFixed32, 4, value >>> 0);
  }
  /**
   * Writes a signed 32 bit value as fixed 32 bits
   */
  sfixed32(value) {
    return this.fixed32(value);
  }
  /**
   * Writes an unsigned 64 bit value as fixed 64 bits
   */
  fixed64(value) {
    const bits = LongBits.fromBigInt(value);
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
  }
  /**
   * Writes an unsigned 64 bit value as fixed 64 bits
   */
  fixed64Number(value) {
    const bits = LongBits.fromNumber(value);
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
  }
  /**
   * Writes an unsigned 64 bit value as fixed 64 bits
   */
  fixed64String(value) {
    return this.fixed64(BigInt(value));
  }
  /**
   * Writes a signed 64 bit value as fixed 64 bits
   */
  sfixed64(value) {
    return this.fixed64(value);
  }
  /**
   * Writes a signed 64 bit value as fixed 64 bits
   */
  sfixed64Number(value) {
    return this.fixed64Number(value);
  }
  /**
   * Writes a signed 64 bit value as fixed 64 bits
   */
  sfixed64String(value) {
    return this.fixed64String(value);
  }
  /**
   * Writes a float (32 bit)
   */
  float(value) {
    return this._push(writeFloatLE, 4, value);
  }
  /**
   * Writes a double (64 bit float).
   *
   * @function
   * @param {number} value - Value to write
   * @returns {Writer} `this`
   */
  double(value) {
    return this._push(writeDoubleLE, 8, value);
  }
  /**
   * Writes a sequence of bytes
   */
  bytes(value) {
    const len = value.length >>> 0;
    if (len === 0) {
      return this._push(writeByte, 1, 0);
    }
    return this.uint32(len)._push(writeBytes, len, value);
  }
  /**
   * Writes a string
   */
  string(value) {
    const len = length2(value);
    return len !== 0 ? this.uint32(len)._push(write, len, value) : this._push(writeByte, 1, 0);
  }
  /**
   * Forks this writer's state by pushing it to a stack.
   * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
   */
  fork() {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
    return this;
  }
  /**
   * Resets this instance to the last state
   */
  reset() {
    if (this.states != null) {
      this.head = this.states.head;
      this.tail = this.states.tail;
      this.len = this.states.len;
      this.states = this.states.next;
    } else {
      this.head = this.tail = new Op(noop, 0, 0);
      this.len = 0;
    }
    return this;
  }
  /**
   * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
   */
  ldelim() {
    const head = this.head;
    const tail = this.tail;
    const len = this.len;
    this.reset().uint32(len);
    if (len !== 0) {
      this.tail.next = head.next;
      this.tail = tail;
      this.len += len;
    }
    return this;
  }
  /**
   * Finishes the write operation
   */
  finish() {
    let head = this.head.next;
    const buf = alloc2(this.len);
    let pos = 0;
    while (head != null) {
      head.fn(head.val, buf, pos);
      pos += head.len;
      head = head.next;
    }
    return buf;
  }
};
function writeByte(val, buf, pos) {
  buf[pos] = val & 255;
}
function writeVarint32(val, buf, pos) {
  while (val > 127) {
    buf[pos++] = val & 127 | 128;
    val >>>= 7;
  }
  buf[pos] = val;
}
var VarintOp = class extends Op {
  next;
  constructor(len, val) {
    super(writeVarint32, len, val);
    this.next = void 0;
  }
};
function writeVarint64(val, buf, pos) {
  while (val.hi !== 0) {
    buf[pos++] = val.lo & 127 | 128;
    val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
    val.hi >>>= 7;
  }
  while (val.lo > 127) {
    buf[pos++] = val.lo & 127 | 128;
    val.lo = val.lo >>> 7;
  }
  buf[pos++] = val.lo;
}
function writeFixed32(val, buf, pos) {
  buf[pos] = val & 255;
  buf[pos + 1] = val >>> 8 & 255;
  buf[pos + 2] = val >>> 16 & 255;
  buf[pos + 3] = val >>> 24;
}
function writeBytes(val, buf, pos) {
  buf.set(val, pos);
}
if (globalThis.Buffer != null) {
  Uint8ArrayWriter.prototype.bytes = function(value) {
    const len = value.length >>> 0;
    this.uint32(len);
    if (len > 0) {
      this._push(writeBytesBuffer, len, value);
    }
    return this;
  };
  Uint8ArrayWriter.prototype.string = function(value) {
    const len = globalThis.Buffer.byteLength(value);
    this.uint32(len);
    if (len > 0) {
      this._push(writeStringBuffer, len, value);
    }
    return this;
  };
}
function writeBytesBuffer(val, buf, pos) {
  buf.set(val, pos);
}
function writeStringBuffer(val, buf, pos) {
  if (val.length < 40) {
    write(val, buf, pos);
  } else if (buf.utf8Write != null) {
    buf.utf8Write(val, pos);
  } else {
    buf.set(fromString2(val), pos);
  }
}
function createWriter() {
  return new Uint8ArrayWriter();
}

// ../../node_modules/protons-runtime/dist/src/encode.js
function encodeMessage(message2, codec) {
  const w = createWriter();
  codec.encode(message2, w, {
    lengthDelimited: false
  });
  return w.finish();
}

// ../../node_modules/protons-runtime/dist/src/codec.js
var CODEC_TYPES;
(function(CODEC_TYPES2) {
  CODEC_TYPES2[CODEC_TYPES2["VARINT"] = 0] = "VARINT";
  CODEC_TYPES2[CODEC_TYPES2["BIT64"] = 1] = "BIT64";
  CODEC_TYPES2[CODEC_TYPES2["LENGTH_DELIMITED"] = 2] = "LENGTH_DELIMITED";
  CODEC_TYPES2[CODEC_TYPES2["START_GROUP"] = 3] = "START_GROUP";
  CODEC_TYPES2[CODEC_TYPES2["END_GROUP"] = 4] = "END_GROUP";
  CODEC_TYPES2[CODEC_TYPES2["BIT32"] = 5] = "BIT32";
})(CODEC_TYPES || (CODEC_TYPES = {}));
function createCodec2(name3, type, encode7, decode8) {
  return {
    name: name3,
    type,
    encode: encode7,
    decode: decode8
  };
}

// ../../node_modules/protons-runtime/dist/src/codecs/message.js
function message(encode7, decode8) {
  return createCodec2("message", CODEC_TYPES.LENGTH_DELIMITED, encode7, decode8);
}

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/proto/payload.js
var NoiseExtensions;
(function(NoiseExtensions2) {
  let _codec;
  NoiseExtensions2.codec = () => {
    if (_codec == null) {
      _codec = message((obj, w, opts = {}) => {
        if (opts.lengthDelimited !== false) {
          w.fork();
        }
        if (obj.webtransportCerthashes != null) {
          for (const value of obj.webtransportCerthashes) {
            w.uint32(10);
            w.bytes(value);
          }
        }
        if (opts.lengthDelimited !== false) {
          w.ldelim();
        }
      }, (reader, length3) => {
        const obj = {
          webtransportCerthashes: []
        };
        const end = length3 == null ? reader.len : reader.pos + length3;
        while (reader.pos < end) {
          const tag = reader.uint32();
          switch (tag >>> 3) {
            case 1: {
              obj.webtransportCerthashes.push(reader.bytes());
              break;
            }
            default: {
              reader.skipType(tag & 7);
              break;
            }
          }
        }
        return obj;
      });
    }
    return _codec;
  };
  NoiseExtensions2.encode = (obj) => {
    return encodeMessage(obj, NoiseExtensions2.codec());
  };
  NoiseExtensions2.decode = (buf) => {
    return decodeMessage(buf, NoiseExtensions2.codec());
  };
})(NoiseExtensions || (NoiseExtensions = {}));
var NoiseHandshakePayload;
(function(NoiseHandshakePayload2) {
  let _codec;
  NoiseHandshakePayload2.codec = () => {
    if (_codec == null) {
      _codec = message((obj, w, opts = {}) => {
        if (opts.lengthDelimited !== false) {
          w.fork();
        }
        if (obj.identityKey != null && obj.identityKey.byteLength > 0) {
          w.uint32(10);
          w.bytes(obj.identityKey);
        }
        if (obj.identitySig != null && obj.identitySig.byteLength > 0) {
          w.uint32(18);
          w.bytes(obj.identitySig);
        }
        if (obj.extensions != null) {
          w.uint32(34);
          NoiseExtensions.codec().encode(obj.extensions, w);
        }
        if (opts.lengthDelimited !== false) {
          w.ldelim();
        }
      }, (reader, length3) => {
        const obj = {
          identityKey: alloc(0),
          identitySig: alloc(0)
        };
        const end = length3 == null ? reader.len : reader.pos + length3;
        while (reader.pos < end) {
          const tag = reader.uint32();
          switch (tag >>> 3) {
            case 1: {
              obj.identityKey = reader.bytes();
              break;
            }
            case 2: {
              obj.identitySig = reader.bytes();
              break;
            }
            case 4: {
              obj.extensions = NoiseExtensions.codec().decode(reader, reader.uint32());
              break;
            }
            default: {
              reader.skipType(tag & 7);
              break;
            }
          }
        }
        return obj;
      });
    }
    return _codec;
  };
  NoiseHandshakePayload2.encode = (obj) => {
    return encodeMessage(obj, NoiseHandshakePayload2.codec());
  };
  NoiseHandshakePayload2.decode = (buf) => {
    return decodeMessage(buf, NoiseHandshakePayload2.codec());
  };
})(NoiseHandshakePayload || (NoiseHandshakePayload = {}));

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/utils.js
async function createHandshakePayload(privateKey, staticPublicKey, extensions) {
  const identitySig = await privateKey.sign(getSignaturePayload(staticPublicKey));
  return NoiseHandshakePayload.encode({
    identityKey: publicKeyToProtobuf(privateKey.publicKey),
    identitySig,
    extensions
  });
}
async function decodeHandshakePayload(payloadBytes, remoteStaticKey, remoteIdentityKey) {
  try {
    const payload = NoiseHandshakePayload.decode(payloadBytes);
    const publicKey = publicKeyFromProtobuf2(payload.identityKey);
    if (remoteIdentityKey?.equals(publicKey) === false) {
      throw new Error(`Payload identity key ${publicKey} does not match expected remote identity key ${remoteIdentityKey}`);
    }
    if (!remoteStaticKey) {
      throw new Error("Remote static does not exist");
    }
    const signaturePayload = getSignaturePayload(remoteStaticKey);
    if (!await publicKey.verify(signaturePayload, payload.identitySig)) {
      throw new Error("Invalid payload signature");
    }
    return payload;
  } catch (e) {
    throw new UnexpectedPeerError(e.message);
  }
}
function getSignaturePayload(publicKey) {
  const prefix = fromString2("noise-libp2p-static-key:");
  if (publicKey instanceof Uint8Array) {
    return concat([prefix, publicKey], prefix.length + publicKey.length);
  }
  publicKey.prepend(prefix);
  return publicKey;
}

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/performHandshake.js
async function performHandshakeInitiator(init, options) {
  const { log, connection, crypto: crypto5, privateKey, prologue, s, remoteIdentityKey, extensions } = init;
  const payload = await createHandshakePayload(privateKey, s.publicKey, extensions);
  const xx = new XXHandshakeState({
    crypto: crypto5,
    protocolName: "Noise_XX_25519_ChaChaPoly_SHA256",
    initiator: true,
    prologue,
    s
  });
  logLocalStaticKeys(xx.s, log);
  log.trace("Stage 0 - Initiator starting to send first message.");
  await connection.write(xx.writeMessageA(ZEROLEN), options);
  log.trace("Stage 0 - Initiator finished sending first message.");
  logLocalEphemeralKeys(xx.e, log);
  log.trace("Stage 1 - Initiator waiting to receive first message from responder...");
  const plaintext = xx.readMessageB(await connection.read(options));
  log.trace("Stage 1 - Initiator received the message.");
  logRemoteEphemeralKey(xx.re, log);
  logRemoteStaticKey(xx.rs, log);
  log.trace("Initiator going to check remote's signature...");
  const receivedPayload = await decodeHandshakePayload(plaintext, xx.rs, remoteIdentityKey);
  log.trace("All good with the signature!");
  log.trace("Stage 2 - Initiator sending third handshake message.");
  await connection.write(xx.writeMessageC(payload), options);
  log.trace("Stage 2 - Initiator sent message with signed payload.");
  const [cs1, cs2] = xx.ss.split();
  logCipherState(cs1, cs2, log);
  return {
    payload: receivedPayload,
    encrypt: (plaintext2) => cs1.encryptWithAd(ZEROLEN, plaintext2),
    decrypt: (ciphertext, dst) => cs2.decryptWithAd(ZEROLEN, ciphertext, dst)
  };
}
async function performHandshakeResponder(init, options) {
  const { log, connection, crypto: crypto5, privateKey, prologue, s, remoteIdentityKey, extensions } = init;
  const payload = await createHandshakePayload(privateKey, s.publicKey, extensions);
  const xx = new XXHandshakeState({
    crypto: crypto5,
    protocolName: "Noise_XX_25519_ChaChaPoly_SHA256",
    initiator: false,
    prologue,
    s
  });
  logLocalStaticKeys(xx.s, log);
  log.trace("Stage 0 - Responder waiting to receive first message.");
  xx.readMessageA(await connection.read(options));
  log.trace("Stage 0 - Responder received first message.");
  logRemoteEphemeralKey(xx.re, log);
  log.trace("Stage 1 - Responder sending out first message with signed payload and static key.");
  await connection.write(xx.writeMessageB(payload), options);
  log.trace("Stage 1 - Responder sent the second handshake message with signed payload.");
  logLocalEphemeralKeys(xx.e, log);
  log.trace("Stage 2 - Responder waiting for third handshake message...");
  const plaintext = xx.readMessageC(await connection.read(options));
  log.trace("Stage 2 - Responder received the message, finished handshake.");
  const receivedPayload = await decodeHandshakePayload(plaintext, xx.rs, remoteIdentityKey);
  const [cs1, cs2] = xx.ss.split();
  logCipherState(cs1, cs2, log);
  return {
    payload: receivedPayload,
    encrypt: (plaintext2) => cs2.encryptWithAd(ZEROLEN, plaintext2),
    decrypt: (ciphertext, dst) => cs1.decryptWithAd(ZEROLEN, ciphertext, dst)
  };
}

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/streaming.js
var CHACHA_TAG_LENGTH = 16;
function encryptStream(handshake, metrics) {
  return async function* (source) {
    for await (const chunk of source) {
      for (let i = 0; i < chunk.length; i += NOISE_MSG_MAX_LENGTH_BYTES_WITHOUT_TAG) {
        let end = i + NOISE_MSG_MAX_LENGTH_BYTES_WITHOUT_TAG;
        if (end > chunk.length) {
          end = chunk.length;
        }
        let data;
        if (chunk instanceof Uint8Array) {
          data = handshake.encrypt(chunk.subarray(i, end));
        } else {
          data = handshake.encrypt(chunk.sublist(i, end));
        }
        metrics?.encryptedPackets.increment();
        yield new Uint8ArrayList(uint16BEEncode(data.byteLength), data);
      }
    }
  };
}
function decryptStream(handshake, metrics) {
  return async function* (source) {
    for await (const chunk of source) {
      for (let i = 0; i < chunk.length; i += NOISE_MSG_MAX_LENGTH_BYTES) {
        let end = i + NOISE_MSG_MAX_LENGTH_BYTES;
        if (end > chunk.length) {
          end = chunk.length;
        }
        if (end - CHACHA_TAG_LENGTH < i) {
          throw new Error("Invalid chunk");
        }
        const encrypted = chunk.sublist(i, end);
        const dst = chunk.subarray(i, end - CHACHA_TAG_LENGTH);
        try {
          const plaintext = handshake.decrypt(encrypted, dst);
          metrics?.decryptedPackets.increment();
          yield plaintext;
        } catch (e) {
          metrics?.decryptErrors.increment();
          throw e;
        }
      }
    }
  };
}

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/noise.js
var Noise = class {
  protocol = "/noise";
  crypto;
  prologue;
  staticKey;
  extensions;
  metrics;
  components;
  constructor(components, init = {}) {
    const { staticNoiseKey, extensions, crypto: crypto5, prologueBytes } = init;
    const { metrics } = components;
    this.components = components;
    const _crypto = crypto5 ?? defaultCrypto;
    this.crypto = wrapCrypto(_crypto);
    this.extensions = extensions;
    this.metrics = metrics ? registerMetrics(metrics) : void 0;
    if (staticNoiseKey) {
      this.staticKey = _crypto.generateX25519KeyPairFromSeed(staticNoiseKey);
    } else {
      this.staticKey = _crypto.generateX25519KeyPair();
    }
    this.prologue = prologueBytes ?? alloc(0);
  }
  [Symbol.toStringTag] = "@chainsafe/libp2p-noise";
  [serviceCapabilities3] = [
    "@libp2p/connection-encryption",
    "@chainsafe/libp2p-noise"
  ];
  /**
   * Encrypt outgoing data to the remote party (handshake as initiator)
   *
   * @param connection - streaming iterable duplex that will be encrypted
   * @param options
   * @param options.remotePeer - PeerId of the remote peer. Used to validate the integrity of the remote peer
   * @param options.signal - Used to abort the operation
   */
  async secureOutbound(connection, options) {
    const wrappedConnection = lpStream(connection, {
      lengthEncoder: uint16BEEncode,
      lengthDecoder: uint16BEDecode,
      maxDataLength: NOISE_MSG_MAX_LENGTH_BYTES
    });
    const handshake = await this.performHandshakeInitiator(wrappedConnection, this.components.privateKey, options?.remotePeer?.publicKey, options);
    const conn = await this.createSecureConnection(wrappedConnection, handshake);
    connection.source = conn.source;
    connection.sink = conn.sink;
    const publicKey = publicKeyFromProtobuf3(handshake.payload.identityKey);
    return {
      conn: connection,
      remoteExtensions: handshake.payload.extensions,
      remotePeer: peerIdFromPublicKey(publicKey)
    };
  }
  /**
   * Decrypt incoming data (handshake as responder).
   *
   * @param connection - streaming iterable duplex that will be encrypted
   * @param options
   * @param options.remotePeer - PeerId of the remote peer. Used to validate the integrity of the remote peer
   * @param options.signal - Used to abort the operation
   */
  async secureInbound(connection, options) {
    const wrappedConnection = lpStream(connection, {
      lengthEncoder: uint16BEEncode,
      lengthDecoder: uint16BEDecode,
      maxDataLength: NOISE_MSG_MAX_LENGTH_BYTES
    });
    const handshake = await this.performHandshakeResponder(wrappedConnection, this.components.privateKey, options?.remotePeer?.publicKey, options);
    const conn = await this.createSecureConnection(wrappedConnection, handshake);
    connection.source = conn.source;
    connection.sink = conn.sink;
    const publicKey = publicKeyFromProtobuf3(handshake.payload.identityKey);
    return {
      conn: connection,
      remoteExtensions: handshake.payload.extensions,
      remotePeer: peerIdFromPublicKey(publicKey)
    };
  }
  /**
   * Perform XX handshake as initiator.
   */
  async performHandshakeInitiator(connection, privateKey, remoteIdentityKey, options) {
    let result;
    try {
      result = await performHandshakeInitiator({
        connection,
        privateKey,
        remoteIdentityKey,
        log: this.components.logger.forComponent("libp2p:noise:xxhandshake"),
        crypto: this.crypto,
        prologue: this.prologue,
        s: this.staticKey,
        extensions: this.extensions
      }, options);
      this.metrics?.xxHandshakeSuccesses.increment();
    } catch (e) {
      this.metrics?.xxHandshakeErrors.increment();
      throw e;
    }
    return result;
  }
  /**
   * Perform XX handshake as responder.
   */
  async performHandshakeResponder(connection, privateKey, remoteIdentityKey, options) {
    let result;
    try {
      result = await performHandshakeResponder({
        connection,
        privateKey,
        remoteIdentityKey,
        log: this.components.logger.forComponent("libp2p:noise:xxhandshake"),
        crypto: this.crypto,
        prologue: this.prologue,
        s: this.staticKey,
        extensions: this.extensions
      }, options);
      this.metrics?.xxHandshakeSuccesses.increment();
    } catch (e) {
      this.metrics?.xxHandshakeErrors.increment();
      throw e;
    }
    return result;
  }
  async createSecureConnection(connection, handshake) {
    const [secure, user] = duplexPair();
    const network = connection.unwrap();
    await pipe(
      secure,
      // write to wrapper
      encryptStream(handshake, this.metrics),
      // encrypt data + prefix with message length
      network,
      // send to the remote peer
      (source) => decode7(source, { lengthDecoder: uint16BEDecode }),
      // read message length prefix
      decryptStream(handshake, this.metrics),
      // decrypt the incoming data
      secure
      // pipe to the wrapper
    );
    return user;
  }
};

// ../../node_modules/@chainsafe/libp2p-noise/dist/src/index.js
function noise(init = {}) {
  return (components) => new Noise(components, init);
}

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/muxer.js
import { InvalidParametersError as InvalidParametersError8, MuxerClosedError, TooManyOutboundProtocolStreamsError as TooManyOutboundProtocolStreamsError2, serviceCapabilities as serviceCapabilities4, setMaxListeners as setMaxListeners7 } from "@libp2p/interface";

// ../../node_modules/get-iterator/dist/src/index.js
function getIterator(obj) {
  if (obj != null) {
    if (typeof obj[Symbol.iterator] === "function") {
      return obj[Symbol.iterator]();
    }
    if (typeof obj[Symbol.asyncIterator] === "function") {
      return obj[Symbol.asyncIterator]();
    }
    if (typeof obj.next === "function") {
      return obj;
    }
  }
  throw new Error("argument is not an iterator or iterable");
}

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/config.js
import { InvalidParametersError as InvalidParametersError7 } from "@libp2p/interface";

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/errors.js
var InvalidFrameError = class extends Error {
  static name = "InvalidFrameError";
  constructor(message2 = "The frame was invalid") {
    super(message2);
    this.name = "InvalidFrameError";
  }
};
var UnrequestedPingError = class extends Error {
  static name = "UnrequestedPingError";
  constructor(message2 = "Unrequested ping error") {
    super(message2);
    this.name = "UnrequestedPingError";
  }
};
var NotMatchingPingError = class extends Error {
  static name = "NotMatchingPingError";
  constructor(message2 = "Unrequested ping error") {
    super(message2);
    this.name = "NotMatchingPingError";
  }
};
var InvalidStateError = class extends Error {
  static name = "InvalidStateError";
  constructor(message2 = "Invalid state") {
    super(message2);
    this.name = "InvalidStateError";
  }
};
var StreamAlreadyExistsError = class extends Error {
  static name = "StreamAlreadyExistsError";
  constructor(message2 = "Strean already exists") {
    super(message2);
    this.name = "StreamAlreadyExistsError";
  }
};
var DecodeInvalidVersionError = class extends Error {
  static name = "DecodeInvalidVersionError";
  constructor(message2 = "Decode invalid version") {
    super(message2);
    this.name = "DecodeInvalidVersionError";
  }
};
var BothClientsError = class extends Error {
  static name = "BothClientsError";
  constructor(message2 = "Both clients") {
    super(message2);
    this.name = "BothClientsError";
  }
};
var ReceiveWindowExceededError = class extends Error {
  static name = "ReceiveWindowExceededError";
  constructor(message2 = "Receive window exceeded") {
    super(message2);
    this.name = "ReceiveWindowExceededError";
  }
};

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/constants.js
var PROTOCOL_ERRORS = /* @__PURE__ */ new Set([
  InvalidFrameError.name,
  UnrequestedPingError.name,
  NotMatchingPingError.name,
  StreamAlreadyExistsError.name,
  DecodeInvalidVersionError.name,
  BothClientsError.name,
  ReceiveWindowExceededError.name
]);
var INITIAL_STREAM_WINDOW = 256 * 1024;
var MAX_STREAM_WINDOW = 16 * 1024 * 1024;

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/config.js
var defaultConfig = {
  enableKeepAlive: true,
  keepAliveInterval: 3e4,
  maxInboundStreams: 1e3,
  maxOutboundStreams: 1e3,
  initialStreamWindowSize: INITIAL_STREAM_WINDOW,
  maxStreamWindowSize: MAX_STREAM_WINDOW,
  maxMessageSize: 64 * 1024
};
function verifyConfig(config) {
  if (config.keepAliveInterval <= 0) {
    throw new InvalidParametersError7("keep-alive interval must be positive");
  }
  if (config.maxInboundStreams < 0) {
    throw new InvalidParametersError7("max inbound streams must be larger or equal 0");
  }
  if (config.maxOutboundStreams < 0) {
    throw new InvalidParametersError7("max outbound streams must be larger or equal 0");
  }
  if (config.initialStreamWindowSize < INITIAL_STREAM_WINDOW) {
    throw new InvalidParametersError7("InitialStreamWindowSize must be larger or equal 256 kB");
  }
  if (config.maxStreamWindowSize < config.initialStreamWindowSize) {
    throw new InvalidParametersError7("MaxStreamWindowSize must be larger than the InitialStreamWindowSize");
  }
  if (config.maxStreamWindowSize > 2 ** 32 - 1) {
    throw new InvalidParametersError7("MaxStreamWindowSize must be less than equal MAX_UINT32");
  }
  if (config.maxMessageSize < 1024) {
    throw new InvalidParametersError7("MaxMessageSize must be greater than a kilobyte");
  }
}

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/frame.js
var FrameType;
(function(FrameType2) {
  FrameType2[FrameType2["Data"] = 0] = "Data";
  FrameType2[FrameType2["WindowUpdate"] = 1] = "WindowUpdate";
  FrameType2[FrameType2["Ping"] = 2] = "Ping";
  FrameType2[FrameType2["GoAway"] = 3] = "GoAway";
})(FrameType || (FrameType = {}));
var Flag;
(function(Flag2) {
  Flag2[Flag2["SYN"] = 1] = "SYN";
  Flag2[Flag2["ACK"] = 2] = "ACK";
  Flag2[Flag2["FIN"] = 4] = "FIN";
  Flag2[Flag2["RST"] = 8] = "RST";
})(Flag || (Flag = {}));
var flagCodes = Object.values(Flag).filter((x) => typeof x !== "string");
var YAMUX_VERSION = 0;
var GoAwayCode;
(function(GoAwayCode2) {
  GoAwayCode2[GoAwayCode2["NormalTermination"] = 0] = "NormalTermination";
  GoAwayCode2[GoAwayCode2["ProtocolError"] = 1] = "ProtocolError";
  GoAwayCode2[GoAwayCode2["InternalError"] = 2] = "InternalError";
})(GoAwayCode || (GoAwayCode = {}));
var HEADER_LENGTH = 12;

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/decode.js
var twoPow24 = 2 ** 24;
function decodeHeader(data) {
  if (data[0] !== YAMUX_VERSION) {
    throw new InvalidFrameError("Invalid frame version");
  }
  return {
    type: data[1],
    flag: (data[2] << 8) + data[3],
    streamID: data[4] * twoPow24 + (data[5] << 16) + (data[6] << 8) + data[7],
    length: data[8] * twoPow24 + (data[9] << 16) + (data[10] << 8) + data[11]
  };
}
var Decoder2 = class {
  source;
  /** Buffer for in-progress frames */
  buffer;
  /** Used to sanity check against decoding while in an inconsistent state */
  frameInProgress;
  constructor(source) {
    this.source = returnlessSource(source);
    this.buffer = new Uint8ArrayList();
    this.frameInProgress = false;
  }
  /**
   * Emits frames from the decoder source.
   *
   * Note: If `readData` is emitted, it _must_ be called before the next iteration
   * Otherwise an error is thrown
   */
  async *emitFrames() {
    for await (const chunk of this.source) {
      this.buffer.append(chunk);
      while (true) {
        const header = this.readHeader();
        if (header === void 0) {
          break;
        }
        const { type, length: length3 } = header;
        if (type === FrameType.Data) {
          this.frameInProgress = true;
          yield {
            header,
            readData: this.readBytes.bind(this, length3)
          };
        } else {
          yield { header };
        }
      }
    }
  }
  readHeader() {
    if (this.frameInProgress) {
      throw new InvalidStateError("decoding frame already in progress");
    }
    if (this.buffer.length < HEADER_LENGTH) {
      return;
    }
    const header = decodeHeader(this.buffer.subarray(0, HEADER_LENGTH));
    this.buffer.consume(HEADER_LENGTH);
    return header;
  }
  async readBytes(length3) {
    if (this.buffer.length < length3) {
      for await (const chunk of this.source) {
        this.buffer.append(chunk);
        if (this.buffer.length >= length3) {
          break;
        }
      }
    }
    const out = this.buffer.sublist(0, length3);
    this.buffer.consume(length3);
    this.frameInProgress = false;
    return out;
  }
};
function returnlessSource(source) {
  if (source[Symbol.iterator] !== void 0) {
    const iterator = source[Symbol.iterator]();
    iterator.return = void 0;
    return {
      [Symbol.iterator]() {
        return iterator;
      }
    };
  } else if (source[Symbol.asyncIterator] !== void 0) {
    const iterator = source[Symbol.asyncIterator]();
    iterator.return = void 0;
    return {
      [Symbol.asyncIterator]() {
        return iterator;
      }
    };
  } else {
    throw new Error("a source must be either an iterable or an async iterable");
  }
}

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/encode.js
function encodeHeader(header) {
  const frame = new Uint8Array(HEADER_LENGTH);
  frame[1] = header.type;
  frame[2] = header.flag >>> 8;
  frame[3] = header.flag;
  frame[4] = header.streamID >>> 24;
  frame[5] = header.streamID >>> 16;
  frame[6] = header.streamID >>> 8;
  frame[7] = header.streamID;
  frame[8] = header.length >>> 24;
  frame[9] = header.length >>> 16;
  frame[10] = header.length >>> 8;
  frame[11] = header.length;
  return frame;
}

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/stream.js
import { AbortError as AbortError7 } from "@libp2p/interface";
import { AbstractStream } from "@libp2p/utils/abstract-stream";

// ../../node_modules/it-foreach/dist/src/index.js
function isAsyncIterable9(thing) {
  return thing[Symbol.asyncIterator] != null;
}
function isPromise(thing) {
  return thing?.then != null;
}
function forEach(source, fn) {
  let index = 0;
  if (isAsyncIterable9(source)) {
    return async function* () {
      for await (const val of source) {
        const res2 = fn(val, index++);
        if (isPromise(res2)) {
          await res2;
        }
        yield val;
      }
    }();
  }
  const peekable2 = src_default2(source);
  const { value, done } = peekable2.next();
  if (done === true) {
    return function* () {
    }();
  }
  const res = fn(value, index++);
  if (typeof res?.then === "function") {
    return async function* () {
      yield value;
      for await (const val of peekable2) {
        const res2 = fn(val, index++);
        if (isPromise(res2)) {
          await res2;
        }
        yield val;
      }
    }();
  }
  const func2 = fn;
  return function* () {
    yield value;
    for (const val of peekable2) {
      func2(val, index++);
      yield val;
    }
  }();
}
var src_default8 = forEach;

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/stream.js
var StreamState;
(function(StreamState2) {
  StreamState2[StreamState2["Init"] = 0] = "Init";
  StreamState2[StreamState2["SYNSent"] = 1] = "SYNSent";
  StreamState2[StreamState2["SYNReceived"] = 2] = "SYNReceived";
  StreamState2[StreamState2["Established"] = 3] = "Established";
  StreamState2[StreamState2["Finished"] = 4] = "Finished";
})(StreamState || (StreamState = {}));
var YamuxStream = class extends AbstractStream {
  name;
  state;
  config;
  _id;
  /** The number of available bytes to send */
  sendWindowCapacity;
  /** Callback to notify that the sendWindowCapacity has been updated */
  sendWindowCapacityUpdate;
  /** The number of bytes available to receive in a full window */
  recvWindow;
  /** The number of available bytes to receive */
  recvWindowCapacity;
  /**
   * An 'epoch' is the time it takes to process and read data
   *
   * Used in conjunction with RTT to determine whether to increase the recvWindow
   */
  epochStart;
  getRTT;
  sendFrame;
  constructor(init) {
    super({
      ...init,
      onEnd: (err) => {
        this.state = StreamState.Finished;
        init.onEnd?.(err);
      }
    });
    this.config = init.config;
    this._id = parseInt(init.id, 10);
    this.name = init.name;
    this.state = init.state;
    this.sendWindowCapacity = INITIAL_STREAM_WINDOW;
    this.recvWindow = this.config.initialStreamWindowSize;
    this.recvWindowCapacity = this.recvWindow;
    this.epochStart = Date.now();
    this.getRTT = init.getRTT;
    this.sendFrame = init.sendFrame;
    this.source = src_default8(this.source, () => {
      this.sendWindowUpdate();
    });
  }
  /**
   * Send a message to the remote muxer informing them a new stream is being
   * opened.
   *
   * This is a noop for Yamux because the first window update is sent when
   * .newStream is called on the muxer which opens the stream on the remote.
   */
  async sendNewStream() {
  }
  /**
   * Send a data message to the remote muxer
   */
  async sendData(buf, options = {}) {
    buf = buf.sublist();
    while (buf.byteLength !== 0) {
      if (this.sendWindowCapacity === 0) {
        this.log?.trace("wait for send window capacity, status %s", this.status);
        await this.waitForSendWindowCapacity(options);
        if (this.status === "closed" || this.status === "aborted" || this.status === "reset") {
          this.log?.trace("%s while waiting for send window capacity", this.status);
          return;
        }
      }
      const toSend = Math.min(this.sendWindowCapacity, this.config.maxMessageSize - HEADER_LENGTH, buf.length);
      const flags = this.getSendFlags();
      this.sendFrame({
        type: FrameType.Data,
        flag: flags,
        streamID: this._id,
        length: toSend
      }, buf.sublist(0, toSend));
      this.sendWindowCapacity -= toSend;
      buf.consume(toSend);
    }
  }
  /**
   * Send a reset message to the remote muxer
   */
  async sendReset() {
    this.sendFrame({
      type: FrameType.WindowUpdate,
      flag: Flag.RST,
      streamID: this._id,
      length: 0
    });
  }
  /**
   * Send a message to the remote muxer, informing them no more data messages
   * will be sent by this end of the stream
   */
  async sendCloseWrite() {
    const flags = this.getSendFlags() | Flag.FIN;
    this.sendFrame({
      type: FrameType.WindowUpdate,
      flag: flags,
      streamID: this._id,
      length: 0
    });
  }
  /**
   * Send a message to the remote muxer, informing them no more data messages
   * will be read by this end of the stream
   */
  async sendCloseRead() {
  }
  /**
   * Wait for the send window to be non-zero
   *
   * Will throw with ERR_STREAM_ABORT if the stream gets aborted
   */
  async waitForSendWindowCapacity(options = {}) {
    if (this.sendWindowCapacity > 0) {
      return;
    }
    let resolve;
    let reject;
    const abort = () => {
      if (this.status === "open" || this.status === "closing") {
        reject(new AbortError7("Stream aborted"));
      } else {
        resolve();
      }
    };
    options.signal?.addEventListener("abort", abort);
    try {
      await new Promise((_resolve, _reject) => {
        this.sendWindowCapacityUpdate = () => {
          _resolve();
        };
        reject = _reject;
        resolve = _resolve;
      });
    } finally {
      options.signal?.removeEventListener("abort", abort);
    }
  }
  /**
   * handleWindowUpdate is called when the stream receives a window update frame
   */
  handleWindowUpdate(header) {
    this.log?.trace("stream received window update id=%s", this._id);
    this.processFlags(header.flag);
    const available = this.sendWindowCapacity;
    this.sendWindowCapacity += header.length;
    if (available === 0 && header.length > 0) {
      this.sendWindowCapacityUpdate?.();
    }
  }
  /**
   * handleData is called when the stream receives a data frame
   */
  async handleData(header, readData) {
    this.log?.trace("stream received data id=%s", this._id);
    this.processFlags(header.flag);
    if (this.recvWindowCapacity < header.length) {
      throw new ReceiveWindowExceededError("Receive window exceeded");
    }
    const data = await readData();
    this.recvWindowCapacity -= header.length;
    this.sourcePush(data);
  }
  /**
   * processFlags is used to update the state of the stream based on set flags, if any.
   */
  processFlags(flags) {
    if ((flags & Flag.ACK) === Flag.ACK) {
      if (this.state === StreamState.SYNSent) {
        this.state = StreamState.Established;
      }
    }
    if ((flags & Flag.FIN) === Flag.FIN) {
      this.remoteCloseWrite();
    }
    if ((flags & Flag.RST) === Flag.RST) {
      this.reset();
    }
  }
  /**
   * getSendFlags determines any flags that are appropriate
   * based on the current stream state.
   *
   * The state is updated as a side-effect.
   */
  getSendFlags() {
    switch (this.state) {
      case StreamState.Init:
        this.state = StreamState.SYNSent;
        return Flag.SYN;
      case StreamState.SYNReceived:
        this.state = StreamState.Established;
        return Flag.ACK;
      default:
        return 0;
    }
  }
  /**
   * potentially sends a window update enabling further writes to take place.
   */
  sendWindowUpdate() {
    const flags = this.getSendFlags();
    const now = Date.now();
    const rtt = this.getRTT();
    if (flags === 0 && rtt > -1 && now - this.epochStart < rtt * 4) {
      this.recvWindow = Math.min(this.recvWindow * 2, this.config.maxStreamWindowSize);
    }
    if (this.recvWindowCapacity >= this.recvWindow && flags === 0) {
      return;
    }
    const delta = this.recvWindow - this.recvWindowCapacity;
    this.recvWindowCapacity = this.recvWindow;
    this.epochStart = now;
    this.sendFrame({
      type: FrameType.WindowUpdate,
      flag: flags,
      streamID: this._id,
      length: delta
    });
  }
};

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/muxer.js
var YAMUX_PROTOCOL_ID = "/yamux/1.0.0";
var CLOSE_TIMEOUT2 = 500;
var Yamux = class {
  protocol = YAMUX_PROTOCOL_ID;
  _components;
  _init;
  constructor(components, init = {}) {
    this._components = components;
    this._init = init;
  }
  [Symbol.toStringTag] = "@chainsafe/libp2p-yamux";
  [serviceCapabilities4] = [
    "@libp2p/stream-multiplexing"
  ];
  createStreamMuxer(init) {
    return new YamuxMuxer(this._components, {
      ...this._init,
      ...init
    });
  }
};
var YamuxMuxer = class {
  protocol = YAMUX_PROTOCOL_ID;
  source;
  sink;
  config;
  log;
  logger;
  /** Used to close the muxer from either the sink or source */
  closeController;
  /** The next stream id to be used when initiating a new stream */
  nextStreamID;
  /** Primary stream mapping, streamID => stream */
  _streams;
  /** The next ping id to be used when pinging */
  nextPingID;
  /** Tracking info for the currently active ping */
  activePing;
  /** Round trip time */
  rtt;
  /** True if client, false if server */
  client;
  localGoAway;
  remoteGoAway;
  /** Number of tracked inbound streams */
  numInboundStreams;
  /** Number of tracked outbound streams */
  numOutboundStreams;
  onIncomingStream;
  onStreamEnd;
  constructor(components, init) {
    this.client = init.direction === "outbound";
    this.config = { ...defaultConfig, ...init };
    this.logger = components.logger;
    this.log = this.logger.forComponent("libp2p:yamux");
    verifyConfig(this.config);
    this.closeController = new AbortController();
    setMaxListeners7(Infinity, this.closeController.signal);
    this.onIncomingStream = init.onIncomingStream;
    this.onStreamEnd = init.onStreamEnd;
    this._streams = /* @__PURE__ */ new Map();
    this.source = pushable({
      onEnd: () => {
        this.log?.trace("muxer source ended");
        this._streams.forEach((stream) => {
          stream.destroy();
        });
      }
    });
    this.sink = async (source) => {
      const shutDownListener = () => {
        const iterator = getIterator(source);
        if (iterator.return != null) {
          const res = iterator.return();
          if (isPromise2(res)) {
            res.catch((err) => {
              this.log?.("could not cause sink source to return", err);
            });
          }
        }
      };
      let reason, error;
      try {
        const decoder = new Decoder2(source);
        try {
          this.closeController.signal.addEventListener("abort", shutDownListener);
          for await (const frame of decoder.emitFrames()) {
            await this.handleFrame(frame.header, frame.readData);
          }
        } finally {
          this.closeController.signal.removeEventListener("abort", shutDownListener);
        }
        reason = GoAwayCode.NormalTermination;
      } catch (err) {
        if (PROTOCOL_ERRORS.has(err.name)) {
          this.log?.error("protocol error in sink", err);
          reason = GoAwayCode.ProtocolError;
        } else {
          this.log?.error("internal error in sink", err);
          reason = GoAwayCode.InternalError;
        }
        error = err;
      }
      this.log?.trace("muxer sink ended");
      if (error != null) {
        this.abort(error, reason);
      } else {
        await this.close({ reason });
      }
    };
    this.numInboundStreams = 0;
    this.numOutboundStreams = 0;
    this.nextStreamID = this.client ? 1 : 2;
    this.nextPingID = 0;
    this.rtt = -1;
    this.log?.trace("muxer created");
    if (this.config.enableKeepAlive) {
      this.keepAliveLoop().catch((e) => this.log?.error("keepalive error: %s", e));
    }
    this.ping().catch((e) => this.log?.error("ping error: %s", e));
  }
  get streams() {
    return Array.from(this._streams.values());
  }
  newStream(name3) {
    if (this.remoteGoAway !== void 0) {
      throw new MuxerClosedError("Muxer closed remotely");
    }
    if (this.localGoAway !== void 0) {
      throw new MuxerClosedError("Muxer closed locally");
    }
    const id = this.nextStreamID;
    this.nextStreamID += 2;
    if (this.numOutboundStreams >= this.config.maxOutboundStreams) {
      throw new TooManyOutboundProtocolStreamsError2("max outbound streams exceeded");
    }
    this.log?.trace("new outgoing stream id=%s", id);
    const stream = this._newStream(id, name3, StreamState.Init, "outbound");
    this._streams.set(id, stream);
    this.numOutboundStreams++;
    stream.sendWindowUpdate();
    return stream;
  }
  /**
   * Initiate a ping and wait for a response
   *
   * Note: only a single ping will be initiated at a time.
   * If a ping is already in progress, a new ping will not be initiated.
   *
   * @returns the round-trip-time in milliseconds
   */
  async ping() {
    if (this.remoteGoAway !== void 0) {
      throw new MuxerClosedError("Muxer closed remotely");
    }
    if (this.localGoAway !== void 0) {
      throw new MuxerClosedError("Muxer closed locally");
    }
    if (this.activePing === void 0) {
      let _resolve = () => {
      };
      this.activePing = {
        id: this.nextPingID++,
        // this promise awaits resolution or the close controller aborting
        promise: new Promise((resolve, reject) => {
          const closed = () => {
            reject(new MuxerClosedError("Muxer closed locally"));
          };
          this.closeController.signal.addEventListener("abort", closed, { once: true });
          _resolve = () => {
            this.closeController.signal.removeEventListener("abort", closed);
            resolve();
          };
        }),
        resolve: _resolve
      };
      const start2 = Date.now();
      this.sendPing(this.activePing.id);
      try {
        await this.activePing.promise;
      } finally {
        delete this.activePing;
      }
      const end = Date.now();
      this.rtt = end - start2;
    } else {
      await this.activePing.promise;
    }
    return this.rtt;
  }
  /**
   * Get the ping round trip time
   *
   * Note: Will return 0 if no successful ping has yet been completed
   *
   * @returns the round-trip-time in milliseconds
   */
  getRTT() {
    return this.rtt;
  }
  /**
   * Close the muxer
   */
  async close(options = {}) {
    if (this.closeController.signal.aborted) {
      return;
    }
    const reason = options?.reason ?? GoAwayCode.NormalTermination;
    this.log?.trace("muxer close reason=%s", reason);
    if (options.signal == null) {
      const signal = AbortSignal.timeout(CLOSE_TIMEOUT2);
      setMaxListeners7(Infinity, signal);
      options = {
        ...options,
        signal
      };
    }
    try {
      await Promise.all([...this._streams.values()].map(async (s) => s.close(options)));
      this.sendGoAway(reason);
      this._closeMuxer();
    } catch (err) {
      this.abort(err);
    }
  }
  abort(err, reason) {
    if (this.closeController.signal.aborted) {
      return;
    }
    reason = reason ?? GoAwayCode.InternalError;
    this.log?.error("muxer abort reason=%s error=%s", reason, err);
    for (const stream of this._streams.values()) {
      stream.abort(err);
    }
    this.sendGoAway(reason);
    this._closeMuxer();
  }
  isClosed() {
    return this.closeController.signal.aborted;
  }
  /**
   * Called when either the local or remote shuts down the muxer
   */
  _closeMuxer() {
    this.closeController.abort();
    this.source.end();
  }
  /** Create a new stream */
  _newStream(id, name3, state, direction) {
    if (this._streams.get(id) != null) {
      throw new InvalidParametersError8("Stream already exists with that id");
    }
    const stream = new YamuxStream({
      id: id.toString(),
      name: name3,
      state,
      direction,
      sendFrame: this.sendFrame.bind(this),
      onEnd: () => {
        this.closeStream(id);
        this.onStreamEnd?.(stream);
      },
      log: this.logger.forComponent(`libp2p:yamux:${direction}:${id}`),
      config: this.config,
      getRTT: this.getRTT.bind(this)
    });
    return stream;
  }
  /**
   * closeStream is used to close a stream once both sides have
   * issued a close.
   */
  closeStream(id) {
    if (this.client === (id % 2 === 0)) {
      this.numInboundStreams--;
    } else {
      this.numOutboundStreams--;
    }
    this._streams.delete(id);
  }
  async keepAliveLoop() {
    const abortPromise = new Promise((_resolve, reject) => {
      this.closeController.signal.addEventListener("abort", reject, { once: true });
    });
    this.log?.trace("muxer keepalive enabled interval=%s", this.config.keepAliveInterval);
    while (true) {
      let timeoutId;
      try {
        await Promise.race([
          abortPromise,
          new Promise((resolve) => {
            timeoutId = setTimeout(resolve, this.config.keepAliveInterval);
          })
        ]);
        this.ping().catch((e) => this.log?.error("ping error: %s", e));
      } catch (e) {
        clearInterval(timeoutId);
        return;
      }
    }
  }
  async handleFrame(header, readData) {
    const { streamID, type, length: length3 } = header;
    this.log?.trace("received frame %o", header);
    if (streamID === 0) {
      switch (type) {
        case FrameType.Ping: {
          this.handlePing(header);
          return;
        }
        case FrameType.GoAway: {
          this.handleGoAway(length3);
          return;
        }
        default:
          throw new InvalidFrameError("Invalid frame type");
      }
    } else {
      switch (header.type) {
        case FrameType.Data:
        case FrameType.WindowUpdate: {
          await this.handleStreamMessage(header, readData);
          return;
        }
        default:
          throw new InvalidFrameError("Invalid frame type");
      }
    }
  }
  handlePing(header) {
    if (header.flag === Flag.SYN) {
      this.log?.trace("received ping request pingId=%s", header.length);
      this.sendPing(header.length, Flag.ACK);
    } else if (header.flag === Flag.ACK) {
      this.log?.trace("received ping response pingId=%s", header.length);
      this.handlePingResponse(header.length);
    } else {
      throw new InvalidFrameError("Invalid frame flag");
    }
  }
  handlePingResponse(pingId) {
    if (this.activePing === void 0) {
      throw new UnrequestedPingError("ping not requested");
    }
    if (this.activePing.id !== pingId) {
      throw new NotMatchingPingError("ping doesn't match our id");
    }
    this.activePing.resolve();
  }
  handleGoAway(reason) {
    this.log?.trace("received GoAway reason=%s", GoAwayCode[reason] ?? "unknown");
    this.remoteGoAway = reason;
    for (const stream of this._streams.values()) {
      stream.reset();
    }
    this._closeMuxer();
  }
  async handleStreamMessage(header, readData) {
    const { streamID, flag, type } = header;
    if ((flag & Flag.SYN) === Flag.SYN) {
      this.incomingStream(streamID);
    }
    const stream = this._streams.get(streamID);
    if (stream === void 0) {
      if (type === FrameType.Data) {
        this.log?.("discarding data for stream id=%s", streamID);
        if (readData === void 0) {
          throw new Error("unreachable");
        }
        await readData();
      } else {
        this.log?.trace("frame for missing stream id=%s", streamID);
      }
      return;
    }
    switch (type) {
      case FrameType.WindowUpdate: {
        stream.handleWindowUpdate(header);
        return;
      }
      case FrameType.Data: {
        if (readData === void 0) {
          throw new Error("unreachable");
        }
        await stream.handleData(header, readData);
        return;
      }
      default:
        throw new Error("unreachable");
    }
  }
  incomingStream(id) {
    if (this.client !== (id % 2 === 0)) {
      throw new InvalidParametersError8("Both endpoints are clients");
    }
    if (this._streams.has(id)) {
      return;
    }
    this.log?.trace("new incoming stream id=%s", id);
    if (this.localGoAway !== void 0) {
      this.sendFrame({
        type: FrameType.WindowUpdate,
        flag: Flag.RST,
        streamID: id,
        length: 0
      });
      return;
    }
    if (this.numInboundStreams >= this.config.maxInboundStreams) {
      this.log?.("maxIncomingStreams exceeded, forcing stream reset");
      this.sendFrame({
        type: FrameType.WindowUpdate,
        flag: Flag.RST,
        streamID: id,
        length: 0
      });
      return;
    }
    const stream = this._newStream(id, void 0, StreamState.SYNReceived, "inbound");
    this.numInboundStreams++;
    this._streams.set(id, stream);
    this.onIncomingStream?.(stream);
  }
  sendFrame(header, data) {
    this.log?.trace("sending frame %o", header);
    if (header.type === FrameType.Data) {
      if (data === void 0) {
        throw new InvalidFrameError("Invalid frame");
      }
      this.source.push(new Uint8ArrayList(encodeHeader(header), data));
    } else {
      this.source.push(encodeHeader(header));
    }
  }
  sendPing(pingId, flag = Flag.SYN) {
    if (flag === Flag.SYN) {
      this.log?.trace("sending ping request pingId=%s", pingId);
    } else {
      this.log?.trace("sending ping response pingId=%s", pingId);
    }
    this.sendFrame({
      type: FrameType.Ping,
      flag,
      streamID: 0,
      length: pingId
    });
  }
  sendGoAway(reason = GoAwayCode.NormalTermination) {
    this.log?.("sending GoAway reason=%s", GoAwayCode[reason]);
    this.localGoAway = reason;
    this.sendFrame({
      type: FrameType.GoAway,
      flag: 0,
      streamID: 0,
      length: reason
    });
  }
};
function isPromise2(thing) {
  return thing != null && typeof thing.then === "function";
}

// ../../node_modules/@chainsafe/libp2p-yamux/dist/src/index.js
function yamux(init = {}) {
  return (components) => new Yamux(components, init);
}

// src/config/libp2p.ts
import { gossipsub } from "@chainsafe/libp2p-gossipsub";

// src/config/bootstrap.json
var bootstrap_default = {
  addresses: [
    "/ip4/146.0.79.23/tcp/2368/p2p/12D3KooWRZjd3sRLEuGDW2JR8xsnXedosU3eoe5XhnUAsqFauoTn",
    "/ip4/146.0.79.23/tcp/2369/ws/p2p/12D3KooWRZjd3sRLEuGDW2JR8xsnXedosU3eoe5XhnUAsqFauoTn"
  ],
  databases: {
    updates: "/orbitdb/zdpuB29HS4Pd9vjr4qs9NdfEH5TCmVPqoHm9frf9c77Crq7Z5",
    serviceAds: "/orbitdb/zdpuAyvkTHk4w8wMTVCjvDRrFQpeGyYdrgoK48ufj8B5WgZst",
    buyOffers: "/orbitdb/zdpuAyM5AWffHSqTtxf2KubRARvwYFTycfuQX4ZG4MhhdyUML",
    agreements: "/orbitdb/zdpuAu9t5Avi2BVBEu3wjDTBcMYTyUKnuqPx3saFUKEw6GXhc"
  }
};

// src/config/libp2p.ts
console.log("bootstrapConfig.addresses: ", bootstrap_default.addresses);
var libp2pOptions = {
  peerStore: {
    persistence: true,
    threshold: 5
  },
  peerDiscovery: [
    bootstrap({
      list: bootstrap_default.addresses
    })
  ],
  connectionManager: {
    autoDial: true
    // automatically dial stored peers
  },
  addresses: {
    listen: ["/ip4/0.0.0.0/tcp/0", "/ip4/0.0.0.0/tcp/0/ws"]
  },
  transports: [
    tcp(),
    webSockets()
  ],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    identifyPush: identifyPush(),
    pubsub: gossipsub({ allowPublishToZeroTopicPeers: true })
  }
};

// src/datadir.ts
var cwd = process.cwd();
var dataDir = `${cwd}/data/payai`;

// src/client.ts
import fs from "fs";

// src/utils.ts
import { createHash } from "crypto";
import bs58 from "bs58";
import {
  signBytes,
  createKeyPairFromPrivateKeyBytes,
  verifySignature
} from "@solana/web3.js";
async function getSolanaKeypair(base58PrivateKey) {
  let secretKeyBytes = bs58.decode(base58PrivateKey);
  if (secretKeyBytes.length === 64) {
    secretKeyBytes = secretKeyBytes.slice(0, 32);
  }
  const { privateKey, publicKey } = await createKeyPairFromPrivateKeyBytes(secretKeyBytes);
  return { privateKey, publicKey };
}
async function getCryptoKeyFromBase58PublicKey(base58EncodedPublicKey) {
  const publicKeyBytes = bs58.decode(base58EncodedPublicKey);
  const publicKey = await crypto.subtle.importKey(
    "raw",
    publicKeyBytes,
    { name: "Ed25519", namedCurve: "Ed25519" },
    true,
    ["verify"]
  );
  return publicKey;
}
async function getBase58PublicKeyFromCryptoKey(publicKey) {
  const publicKeyBytes = await crypto.subtle.exportKey("raw", publicKey);
  return bs58.encode(new Uint8Array(publicKeyBytes));
}
function prepareMessageForHashing(message2) {
  const serializedMessage = JSON.stringify(message2);
  return serializedMessage.replace(/\s/g, "");
}
async function hashAndSign(message2, privateKey) {
  const serializedMessage = prepareMessageForHashing(message2);
  const hash = createHash("sha256").update(serializedMessage).digest();
  const signedBytes = await signBytes(privateKey, hash);
  const encodedSignature = bs58.encode(signedBytes);
  return encodedSignature;
}
async function verifyMessage(identity3, signature, message2) {
  const publicKey = await getCryptoKeyFromBase58PublicKey(identity3);
  const serializedMessage = prepareMessageForHashing(message2);
  const hash = createHash("sha256").update(serializedMessage).digest();
  const decodedSignature = bs58.decode(signature);
  return verifySignature(publicKey, decodedSignature, hash);
}
function getCIDFromOrbitDbHash(hash) {
  return hash;
}
async function prepareBuyOffer(offerDetails, runtime) {
  try {
    const userDefinedPrivateKey = runtime.getSetting("SOLANA_PRIVATE_KEY");
    const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
    const signature = await hashAndSign(offerDetails, solanaKeypair.privateKey);
    const buyOffer = {
      message: offerDetails,
      identity: await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey),
      signature,
      _id: signature
      // TODO make this more resilient in the future
    };
    return buyOffer;
  } catch (error) {
    console.error("Error preparing buy offer", error);
    throw error;
  }
}
async function prepareServiceAd(services, runtime) {
  try {
    const userDefinedPrivateKey = runtime.getSetting("SOLANA_PRIVATE_KEY");
    const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
    const base58PublicKey = await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey);
    const message2 = {
      services: services.map((service, index) => {
        return {
          id: index,
          ...service
        };
      }),
      wallet: base58PublicKey
    };
    const signature = await hashAndSign(message2, solanaKeypair.privateKey);
    const formattedServices = {
      message: message2,
      identity: base58PublicKey,
      signature,
      _id: signature
      // TODO make this more resilient in the future
    };
    return formattedServices;
  } catch (error) {
    console.error("Error formatting sellerServices.json", error);
    throw error;
  }
}
async function prepareAgreement(agreementDetails, runtime) {
  try {
    const userDefinedPrivateKey = runtime.getSetting("SOLANA_PRIVATE_KEY");
    const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
    const base58PublicKey = await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey);
    const message2 = {
      ...agreementDetails,
      identity: base58PublicKey
    };
    const signature = await hashAndSign(message2, solanaKeypair.privateKey);
    const formattedAgreement = {
      message: message2,
      signature,
      _id: signature
      // TODO make this more resilient in the future
    };
    return formattedAgreement;
  } catch (error) {
    console.error("Error formatting agreement", error);
    throw error;
  }
}
async function queryOrbitDbReturningCompleteEntries(db, findFunction) {
  const results = [];
  for await (const doc of db.iterator()) {
    if (findFunction(doc.value)) {
      results.push(doc);
    }
  }
  return results;
}

// src/client.ts
var {
  createHash: createHash2
} = await import("node:crypto");
var PayAIClient = class {
  libp2p = null;
  ipfs = null;
  orbitdb = null;
  updatesDB = null;
  serviceAdsDB = null;
  buyOffersDB = null;
  agreementsDB = null;
  servicesConfig = null;
  servicesConfigPath;
  servicesConfigInterval = null;
  sellerServiceAdCID = null;
  constructor() {
    elizaLogger.debug("PayAI Client created");
  }
  /**
   * Initializes the PayAI Client by creating libp2p, Helia, and OrbitDB instances.
   */
  async initialize(runtime) {
    try {
      elizaLogger.info("Initializing PayAI Client");
      const agentDir = dataDir + "/" + runtime.character.name;
      const libp2pDatastore = new LevelDatastore(agentDir + "/libp2p");
      const libp2pConfig = Object.assign({}, libp2pOptions);
      libp2pConfig.datastore = libp2pDatastore;
      this.libp2p = await createLibp2p(libp2pConfig);
      const blockstore = new FsBlockstore(agentDir + "/ipfs");
      this.ipfs = await createHelia({ libp2p: this.libp2p, blockstore });
      this.orbitdb = await createOrbitDB({ ipfs: this.ipfs, directory: agentDir });
      this.updatesDB = await this.orbitdb.open(bootstrap_default.databases.updates, { sync: true });
      this.updatesDB.events.on("update", async (entry) => {
        elizaLogger.debug("payai updates db: ", entry.payload.value);
      });
      this.serviceAdsDB = await this.orbitdb.open(bootstrap_default.databases.serviceAds, { sync: true });
      this.serviceAdsDB.events.on("update", async (entry) => {
        elizaLogger.debug("payai service ads db: ", entry.payload.value);
      });
      this.buyOffersDB = await this.orbitdb.open(bootstrap_default.databases.buyOffers, { sync: true });
      this.buyOffersDB.events.on("update", async (entry) => {
        elizaLogger.debug("payai buy offers db: ", entry.payload.value);
      });
      this.agreementsDB = await this.orbitdb.open(bootstrap_default.databases.agreements, { sync: true });
      this.agreementsDB.events.on("update", async (entry) => {
        elizaLogger.debug("payai agreements db: ", entry.payload.value);
      });
      await this.updatesDB.add(`Agent ${runtime.character.name} joined the payai network`);
      this.servicesConfigPath = `${agentDir}/sellerServices.json`;
      await this.initSellerAgentFunctionality(runtime);
      elizaLogger.info("PayAI Client initialized");
    } catch (error) {
      elizaLogger.error("Failed to initialize PayAI Client", error);
      throw error;
    }
  }
  /**
   * Initializes the seller agent functionality.
   * This includes loading the sellerServices.json file, updating the serviceAds database
   * if necessary, and periodically checking for updates to the sellerServices.json file.
   * @param runtime - The runtime context for the client.
   */
  async initSellerAgentFunctionality(runtime) {
    if (fs.existsSync(this.servicesConfigPath)) {
      const localServices = JSON.parse(fs.readFileSync(this.servicesConfigPath, "utf-8"));
      this.servicesConfig = localServices;
      const localServiceAd = await prepareServiceAd(localServices, runtime);
      const fetchedServiceAds = await queryOrbitDbReturningCompleteEntries(
        this.serviceAdsDB,
        (doc) => {
          return doc.message.toString() === localServiceAd.message.toString() && doc.signature === localServiceAd.signature;
        }
      );
      if (fetchedServiceAds.length === 0) {
        elizaLogger.info("Local services does not match serviceAdsDB, adding to database");
        const result = await this.serviceAdsDB.put(localServiceAd);
        this.sellerServiceAdCID = getCIDFromOrbitDbHash(result);
        elizaLogger.info("Added new service to serviceAdsDB");
        elizaLogger.info("CID: ", CID.parse(result, base58btc).toString());
      } else {
        this.sellerServiceAdCID = getCIDFromOrbitDbHash(fetchedServiceAds[0].hash);
        elizaLogger.info("Local services marches serviceAdsDB, no need to update the database");
      }
    }
    await this.checkServicesConfig(runtime);
    this.servicesConfigInterval = setInterval(() => {
      this.checkServicesConfig(runtime).catch((error) => {
        elizaLogger.error("Error in servicesConfigInterval", error);
      });
    }, 1e4);
  }
  readAndParseServicesConfig() {
    try {
      const fileContents = fs.readFileSync(this.servicesConfigPath, "utf-8");
      return JSON.parse(fileContents);
    } catch (error) {
      elizaLogger.error("Error reading sellerServices.json", error);
      console.error(error);
      throw error;
    }
  }
  /**
   * Checks the sellerServices.json file for updates and updates the serviceAdsDB if necessary.
   */
  async checkServicesConfig(runtime) {
    try {
      if (!fs.existsSync(this.servicesConfigPath)) {
        return;
      }
      const parsedContents = this.readAndParseServicesConfig();
      if (JSON.stringify(this.servicesConfig) !== JSON.stringify(parsedContents)) {
        elizaLogger.info("sellerServices.json has changed");
        this.servicesConfig = parsedContents;
        const serviceAd = await prepareServiceAd(this.servicesConfig, runtime);
        const result = await this.serviceAdsDB.put(serviceAd);
        this.sellerServiceAdCID = getCIDFromOrbitDbHash(result);
        elizaLogger.info("Updated serviceAdsDB with new sellerServices.json contents");
      }
    } catch (error) {
      elizaLogger.error("Error checking sellerServices.json", error);
      console.error(error);
      throw error;
    }
  }
  /*
   * Function to get an OrbitDB entry using its hash.
   */
  async getEntryFromHash(hash, db) {
    try {
      const entry = await db.log.get(hash);
      return entry.payload.value;
    } catch (error) {
      elizaLogger.error("Error getting orbitdb entry from hash", error);
      throw error;
    }
  }
  // TODO this will change once PayAI content is available from publicly accessible IPFS nodes
  /* Function to get an OrbitDB entry using its ipfs CID. */
  async getEntryFromCID(cid, db) {
    return this.getEntryFromHash(cid, db);
  }
  /*
   * Close the OrbitDB databases.
   */
  async closeDatabases() {
    try {
      await this.updatesDB.close();
      await this.serviceAdsDB.close();
      await this.buyOffersDB.close();
      await this.agreementsDB.close();
      if (this.servicesConfigInterval) {
        clearInterval(this.servicesConfigInterval);
        this.servicesConfigInterval = null;
      }
    } catch (error) {
      elizaLogger.error("Failed to close databases", error);
      throw error;
    }
  }
  /**
   * Starts the PayAI Client.
   * @param runtime - The runtime context for the client.
   */
  async start(runtime) {
    try {
      await this.initialize(runtime);
      elizaLogger.info("PayAI Client started");
    } catch (error) {
      elizaLogger.error("Error while starting PayAI Client", error);
      console.error(error);
      throw error;
    }
  }
  /**
   * Stops the PayAI Client.
   * @param runtime - The runtime context for the client.
   */
  async stop(runtime) {
    try {
      await this.closeDatabases();
      await this.orbitdb.stop();
      await this.ipfs.stop();
      elizaLogger.info("PayAI Client stopped");
    } catch (error) {
      elizaLogger.error("Error while stopping PayAI Client", error);
      throw error;
    }
  }
};
var payAIClient = new PayAIClient();

// src/actions/browseAgents.ts
import {
  ModelClass,
  composeContext,
  elizaLogger as elizaLogger2,
  generateText,
  getEmbeddingZeroVector,
  parseJSONObjectFromText
} from "@elizaos/core";
var findMatchingServicesTemplate = `
Analyze the following conversation to extract a list of services that the user is looking for.
There could be multiple services, so make sure you extract all of them.

The Seller is identified by their solana wallet address.
The Service Ad CID is identified by the hash of the entry.

Conversation:

{{recentMessages}}


All possible services:

{{services}}


Return a JSON object containing all of the services that match what the user is looking for.
For example:
{
    "success": true,
    "result": "Here are the services that match your query:

First Service Name
First Service Description
First Service Price
Seller: B2imQsisfrTLoXxzgQfxtVJ3vQR9bGbpmyocVu3nWGJ6
Service Ad CID: zdpuAuhwXA4NGv5Qqc6nFHPjHtFxcqnYRSGyW1FBCkrfm2tgF

Second Service Name
Second Service Description
Second Service Price
Seller: updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM
Service Ad CID: zdpuAn5qVvoT1h2KfwNxZehFnNotCdBeEgVFGYTBuSEyKPtDB"
}

If no matching services were found, then set the "success" field to false and set the result to a string informing the user that no matching services were found, and ask them to try rewording their search. Be natural and polite.
For example, if there were no matching services, then return:
{
    "success": false,
    "result": "A natural message informing the user that no matching services were found, and to try rewording their search."
}

Only return a JSON mardown block.
`;
var browseAgents = {
  name: "BROWSE_PAYAI_AGENTS",
  similes: ["SEARCH_SERVICES", "FIND_SELLER", "HIRE_AGENT", "FIND_SERVICE"],
  description: "Search through the PayAI marketplace to find a seller providing a service that the buyer is looking for.",
  suppressInitialMessage: true,
  validate: async (runtime, message2) => {
    return true;
  },
  handler: async (runtime, message2, state, _options, callback) => {
    try {
      const searchQuery = message2.content.text;
      if (!state) {
        state = await runtime.composeState(message2);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const services = await payAIClient.serviceAdsDB.all();
      const servicesString = JSON.stringify(services, null, 2);
      state.services = servicesString;
      state.searchQuery = searchQuery;
      const findMatchingServicesContext = composeContext({
        state,
        template: findMatchingServicesTemplate
      });
      const findMatchingServicesContent = await generateText({
        runtime,
        context: findMatchingServicesContext,
        modelClass: ModelClass.SMALL
      });
      elizaLogger2.debug("found these matching services from the conversation:", findMatchingServicesContent);
      const matchingServices = parseJSONObjectFromText(findMatchingServicesContent);
      if (matchingServices.success === false) {
        elizaLogger2.info("Couldn't find any services matching the user's request.");
        if (callback) {
          callback({
            text: matchingServices.result,
            action: "BROWSE_PAYAI_AGENTS",
            source: message2.content.source
          });
        }
        return false;
      }
      const responseToUser = matchingServices.result;
      if (callback) {
        const newMemory = {
          userId: message2.agentId,
          agentId: message2.agentId,
          roomId: message2.roomId,
          content: {
            text: responseToUser,
            action: "BROWSE_PAYAI_AGENTS",
            source: message2.content.source,
            services: matchingServices.result
          },
          embedding: getEmbeddingZeroVector()
        };
        await runtime.messageManager.createMemory(newMemory);
        callback(newMemory.content);
      }
      return true;
    } catch (error) {
      console.error("Error in BROWSE_PAYAI_AGENTS handler:", error);
      if (callback) {
        callback({
          text: "Error processing BROWSE_PAYAI_AGENTS request.",
          content: { error: "Error processing BROWSE_PAYAI_AGENTS request." }
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "Find an agent that offers web development." }
      },
      {
        user: "{{user2}}",
        content: { text: "Found the following matching services. Check them out below!", action: "BROWSE_PAYAI_AGENTS" }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Show me all services available." }
      },
      {
        user: "{{user2}}",
        content: { text: "Here are all the available services:", action: "BROWSE_PAYAI_AGENTS" }
      }
    ]
  ]
};
var browseAgents_default = browseAgents;

// src/actions/makeOfferAction.ts
import {
  ModelClass as ModelClass2,
  composeContext as composeContext2,
  elizaLogger as elizaLogger3,
  generateText as generateText2,
  parseJSONObjectFromText as parseJSONObjectFromText2,
  getEmbeddingZeroVector as getEmbeddingZeroVector2
} from "@elizaos/core";
var extractOfferDetailsTemplate = `
Analyze the following conversation to extract Offer Details from a buyer to a seller.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "serviceAdCID": "hash of the seller's services",
        "wallet": "Solana public key of the seller",
        "desiredServiceID": "ID of the service the buyer wants to purchase",
        "desiredUnitAmount": "Amount of units the buyer wants to purchase"
    }
}

If the buyer provided the seller's identity or wallet in the conversation, then set the wallet field to equal the seller's identity or wallet.
If the buyer provided the service ID or amount of units in the conversation, then set the desiredServiceID or desiredUnitAmount fields to equal the service ID or amount of units.
If the buyer provided the seller's service ad CID in the conversation, then set the serviceAdCID field to equal the seller's service ad CID.

If not all information was provided, or the information was unclear, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could only find the seller's wallet or identity, then return:
{
    "success": false,
    "result": "Please provide the service ID, and the amount of units you want to purchase."
}

Make sure you recognize when a user is asking to purchase a new service.
If you see in the message history that you recently created a purchase order for a user, and now they are asking for a new service, then you should forget the previous order that they created and help them create a new purchase order for a new service.

Only return a JSON markdown block.
`;
var makeOfferAction = {
  name: "MAKE_OFFER",
  similes: ["PURCHASE_SERVICE", "BUY_SERVICE", "HIRE_AGENT", "MAKE_PROPOSAL"],
  description: "Make an offer to purchase a service from a seller on the PayAI marketplace.",
  suppressInitialMessage: true,
  validate: async (runtime, message2) => {
    return true;
  },
  handler: async (runtime, message2, state, _options, callback) => {
    try {
      if (!state) {
        state = await runtime.composeState(message2);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const makeOfferContext = composeContext2({
        state,
        template: extractOfferDetailsTemplate
      });
      const extractedDetailsText = await generateText2({
        runtime,
        context: makeOfferContext,
        modelClass: ModelClass2.SMALL
      });
      elizaLogger3.debug("extracted the following Buy Offer details from the conversation:", extractedDetailsText);
      const extractedDetails = parseJSONObjectFromText2(extractedDetailsText);
      if (extractedDetails.success === false) {
        elizaLogger3.info("Need more information from the user to make an offer.");
        if (callback) {
          callback({
            text: extractedDetails.result,
            action: "MAKE_OFFER",
            source: message2.content.source
          });
        }
        return false;
      }
      const offerDetails = {
        serviceAdCID: extractedDetails.result.serviceAdCID,
        desiredServiceID: extractedDetails.result.desiredServiceID,
        desiredUnitAmount: extractedDetails.result.desiredUnitAmount
      };
      const buyOffer = await prepareBuyOffer(offerDetails, runtime);
      elizaLogger3.debug("Publishing buy offer to IPFS:", buyOffer);
      const result = await payAIClient.buyOffersDB.put(buyOffer);
      const CID2 = getCIDFromOrbitDbHash(result);
      elizaLogger3.info("Published Buy Offer to IPFS: ", CID2);
      let responseToUser = `Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${extractedDetails.result.wallet}.`;
      responseToUser += `
Your Buy Offer's IPFS CID is ${CID2}`;
      if (callback) {
        const newMemory = {
          userId: message2.agentId,
          agentId: message2.agentId,
          roomId: message2.roomId,
          content: {
            text: responseToUser,
            action: "MAKE_OFFER",
            source: message2.content.source,
            buyOffer: offerDetails
          },
          embedding: getEmbeddingZeroVector2()
        };
        await runtime.messageManager.createMemory(newMemory);
        callback(newMemory.content);
      }
      return true;
    } catch (error) {
      elizaLogger3.error("Error in MAKE_OFFER handler:", error);
      console.error(error);
      if (callback) {
        callback({
          text: "Error processing MAKE_OFFER request.",
          action: "MAKE_OFFER",
          source: message2.content.source
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase 5 units of service ID 1 from seller 9ovkK7WoiSXyEJDM5cZG3or3W95bdzZLDDHhuMgSJT9U"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${extractedDetails.result.wallet}. Your Buy Offer's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          action: "MAKE_OFFER"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase 3 units of service ID 2."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase.",
          action: "MAKE_OFFER"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase service ID 1."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase.",
          action: "MAKE_OFFER"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase seller 9ovkK7WoiSXyEJDM5cZG3or3W95bdzZLDDHhuMgSJT9U"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase.",
          action: "MAKE_OFFER"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to purchase 5 units of service ID 1 from seller 9ovkK7WoiSXyEJDM5cZG3or3W95bdzZLDDHhuMgSJT9U"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the serviceAdCID of the seller's services.",
          action: "MAKE_OFFER"
        }
      }
    ]
  ]
};
var makeOfferAction_default = makeOfferAction;

// src/actions/acceptOfferAction.ts
import {
  ModelClass as ModelClass3,
  composeContext as composeContext3,
  elizaLogger as elizaLogger4,
  generateText as generateText3,
  parseJSONObjectFromText as parseJSONObjectFromText3,
  getEmbeddingZeroVector as getEmbeddingZeroVector3
} from "@elizaos/core";
var extractOfferCIDTemplate = `
Analyze the following conversation to extract the CID of the Buy Offer from the buyer.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "buyOfferCID": "CID of the Buy Offer"
    }
}

If the buyer did not provide the CID of the Buy Offer, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the CID of the Buy Offer, then return:
{
    "success": false,
    "result": "Please provide the CID of the Buy Offer."
}

Only return a JSON markdown block.
`;
var acceptOfferAction = {
  name: "ACCEPT_OFFER",
  similes: ["AGREE_TO_OFFER", "ACCEPT_PROPOSAL", "ACCEPT_TERMS", "ACCEPT_BUY_OFFER"],
  description: "This action allows a seller to accept an offer from a buyer on the PayAI marketplace.",
  suppressInitialMessage: true,
  validate: async (runtime, message2) => {
    return true;
  },
  handler: async (runtime, message2, state, _options, callback) => {
    try {
      if (!state) {
        state = await runtime.composeState(message2);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const acceptOfferContext = composeContext3({
        state,
        template: extractOfferCIDTemplate
      });
      const extractedDetailsText = await generateText3({
        runtime,
        context: acceptOfferContext,
        modelClass: ModelClass3.SMALL
      });
      elizaLogger4.debug("extracted the following Buy Offer CID from the conversation:", extractedDetailsText);
      const extractedDetails = parseJSONObjectFromText3(extractedDetailsText);
      if (extractedDetails.success === false) {
        elizaLogger4.info("Need more information from the user to accept the offer.");
        if (callback) {
          callback({
            text: extractedDetails.result,
            action: "ACCEPT_OFFER",
            source: message2.content.source
          });
        }
        return false;
      }
      const { isValid, reason } = await isValidBuyOffer(extractedDetails.result.buyOfferCID, runtime);
      if (!isValid) {
        elizaLogger4.info(reason);
        if (callback) {
          callback({
            text: reason,
            action: "ACCEPT_OFFER",
            source: message2.content.source
          });
        }
        return false;
      }
      const agreementDetails = {
        buyOfferCID: extractedDetails.result.buyOfferCID,
        accept: true
      };
      const agreement = await prepareAgreement(agreementDetails, runtime);
      elizaLogger4.debug("Publishing agreement to IPFS:", agreement);
      const result = await payAIClient.agreementsDB.put(agreement);
      const CID2 = getCIDFromOrbitDbHash(result);
      elizaLogger4.info("Published Agreement to IPFS: ", CID2);
      let responseToUser = `I accepted the offer and signed an agreement. The Agreement's IPFS CID is ${CID2}`;
      if (callback) {
        const newMemory = {
          userId: message2.agentId,
          agentId: message2.agentId,
          roomId: message2.roomId,
          content: {
            text: responseToUser,
            action: "ACCEPT_OFFER",
            source: message2.content.source,
            agreement: agreementDetails
          },
          embedding: getEmbeddingZeroVector3()
        };
        await runtime.messageManager.createMemory(newMemory);
        callback(newMemory.content);
      }
      return true;
    } catch (error) {
      elizaLogger4.error("Error in ACCEPT_OFFER handler:", error);
      console.error(error);
      if (callback) {
        callback({
          text: "Error processing ACCEPT_OFFER request.",
          action: "ACCEPT_OFFER",
          source: message2.content.source
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "I accept the offer. The Agreement's IPFS CID is bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
          action: "ACCEPT_OFFER"
        }
      }
    ],
    // Example where the user provides a Buy Offer with an invalid signature
    [
      {
        user: "{{user1}}",
        content: {
          text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Buy Offer signature is invalid.",
          action: "ACCEPT_OFFER"
        }
      }
    ],
    // Example where the user provides a Buy Offer that references a non-existent Service Ad
    [
      {
        user: "{{user1}}",
        content: {
          text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "ServiceAd referenced by Buy Offer does not exist",
          action: "ACCEPT_OFFER"
        }
      }
    ],
    // Example where the user provides a Buy Offer that references a Service Ad that does not match the seller's most recent Service Ad
    [
      {
        user: "{{user1}}",
        content: {
          text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "ServiceAd does not match the seller's most recent service Ad. Seller's most recent service ad can be found at bafybeibml5uieyxa5tufngvg7fgwbkwvlsuntwbxgtskoqynbt7wlchmfm",
          action: "ACCEPT_OFFER"
        }
      }
    ]
  ]
};
async function isValidBuyOffer(buyOfferCID, runtime) {
  try {
    const buyOffer = await payAIClient.getEntryFromCID(buyOfferCID, payAIClient.buyOffersDB);
    const identity3 = buyOffer.identity;
    const signature = buyOffer.signature;
    const message2 = buyOffer.message;
    const isValidSignature = await verifyMessage(identity3, signature, message2);
    if (!isValidSignature) {
      return { isValid: false, reason: "Buy Offer signature is invalid." };
    }
    const serviceAd = await payAIClient.getEntryFromHash(message2.serviceAdCID, payAIClient.serviceAdsDB);
    if (!serviceAd) {
      return { isValid: false, reason: "ServiceAd referenced by Buy Offer does not exist" };
    }
    const isCurrent = message2.serviceAdCID === payAIClient.sellerServiceAdCID;
    if (!isCurrent) {
      return {
        isValid: false,
        reason: `ServiceAd does not match the seller's most recent service Ad. Seller's most recent service ad can be found at ${payAIClient.sellerServiceAdCID}`
      };
    }
    return { isValid: true, reason: "" };
  } catch (error) {
    console.error("Error validating Buy Offer:", error);
    throw error;
  }
}
var acceptOfferAction_default = acceptOfferAction;

// src/actions/advertiseServicesAction.ts
import {
  ModelClass as ModelClass4,
  composeContext as composeContext4,
  elizaLogger as elizaLogger5,
  generateText as generateText4,
  getEmbeddingZeroVector as getEmbeddingZeroVector4,
  parseJSONObjectFromText as parseJSONObjectFromText4
} from "@elizaos/core";
import fs2 from "fs";
var extractServicesTemplate = `
Analyze the following conversation to extract the services that the user wants to sell.
There could be multiple services, so make sure you extract all of them.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": [
        {
            "name": "First Service Name",
            "description": "First Service Description",
            "price": "First Service Price"
        },
        {
            "name": "Second Service Name",
            "description": "Second Service Description",
            "price": "Second Service Price"
        }
    ]
}

If the user did not provide enough information, then set the "success" field to false and set the result to a string asking the user to provide the missing information. If asking for missing information, be natural and polite.
For example, if you could not find the services, then return:
{
    "success": false,
    "result": "A natural message asking the user to provide information on the services they want to sell."
}

Only return a JSON mardown block.
`;
var confirmServicesTemplate = `
Look for confirmation from the user that the following services are the only ones they are selling at the moment.

{{services}}

User's recent messages are below.

{{recentMessages}}


Return a JSON object containing only the fields where information was clearly found.
If the user confirmed, then set the "success" field to true and set the result to "yes".
For example:
{
    "success": true,
    "result": "yes"
}

If the user did not confirm, then set the "success" field to false and set the result to a string asking the user to confirm.
For example, if you could not find the confirmation, then return:
{
    "success": false,
    "result": "Please confirm that these are the only services you are selling at the moment:

{{services}}"
}

Only return a JSON mardown block.
`;
var advertiseServicesAction = {
  name: "ADVERTISE_SERVICES",
  similes: ["SELL_SERVICES", "OFFER_SERVICES", "LIST_SERVICES"],
  description: "Ask the user for the services they want to sell, create the services file locally, and publish it to the serviceAdsDB.",
  suppressInitialMessage: true,
  validate: async (runtime, message2) => {
    console.log("message.content.source: ", message2.content.source);
    if (message2.content.source !== "direct") {
      elizaLogger5.debug("ADVERTISE_SERVICES action is only allowed when interacting with the direct client. This message was from:", message2.content.source);
      return false;
    }
    return true;
  },
  handler: async (runtime, message2, state, _options, callback) => {
    try {
      if (!state) {
        state = await runtime.composeState(message2);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const extractServicesContext = composeContext4({
        state,
        template: extractServicesTemplate
      });
      const extractedServicesText = await generateText4({
        runtime,
        context: extractServicesContext,
        modelClass: ModelClass4.SMALL
      });
      elizaLogger5.debug("extracted the following services from the conversation:", extractedServicesText);
      console.log("extracted the following services from the conversation:", extractedServicesText);
      const extractedServices = parseJSONObjectFromText4(extractedServicesText);
      console.log("message: ", message2);
      if (extractedServices.success === false) {
        elizaLogger5.info("Need more information from the user to advertise services.");
        if (callback) {
          callback({
            text: extractedServices.result,
            action: "ADVERTISE_SERVICES",
            source: message2.content.source
          });
        }
        return false;
      }
      state.services = extractedServices.result.map(
        (service) => `Name: ${service.name}
Description: ${service.description}
Price: ${service.price}`
      ).join("\n\n");
      const confirmServicesContext = composeContext4({
        state,
        template: confirmServicesTemplate
      });
      const confirmServicesText = await generateText4({
        runtime,
        context: confirmServicesContext,
        modelClass: ModelClass4.SMALL
      });
      elizaLogger5.debug("confirmation from the user:", confirmServicesText);
      console.log("confirmation from the user:", confirmServicesText);
      const confirmServices = parseJSONObjectFromText4(confirmServicesText);
      if (confirmServices.success === false) {
        elizaLogger5.info("Need confirmation from the user.");
        if (callback) {
          callback({
            text: confirmServices.result,
            action: "ADVERTISE_SERVICES",
            source: message2.content.source
          });
        }
        return false;
      }
      const servicesFilePath = payAIClient.servicesConfigPath;
      console.log("writing the following services to the services file:", extractedServices.result);
      fs2.writeFileSync(servicesFilePath, JSON.stringify(extractedServices.result, null, 2));
      elizaLogger5.info("Created services file locally at:", servicesFilePath);
      const serviceAd = await prepareServiceAd(extractedServices.result, runtime);
      elizaLogger5.debug("Publishing service ad to IPFS:", serviceAd);
      const result = await payAIClient.serviceAdsDB.put(serviceAd);
      const CID2 = getCIDFromOrbitDbHash(result);
      elizaLogger5.info("Published Service Ad to IPFS: ", CID2);
      let responseToUser = `Successfully advertised your services. Your Service Ad's IPFS CID is ${CID2}`;
      if (callback) {
        const newMemory = {
          userId: message2.agentId,
          agentId: message2.agentId,
          roomId: message2.roomId,
          content: {
            text: responseToUser,
            action: "ADVERTISE_SERVICES",
            source: message2.content.source,
            services: extractedServices.result
          },
          embedding: getEmbeddingZeroVector4()
        };
        await runtime.messageManager.createMemory(newMemory);
        callback(newMemory.content);
      }
      return true;
    } catch (error) {
      elizaLogger5.error("Error in ADVERTISE_SERVICES handler:", error);
      console.error(error);
      if (callback) {
        callback({
          text: "Error processing ADVERTISE_SERVICES request.",
          action: "ADVERTISE_SERVICES",
          source: message2.content.source
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to sell web development services for $50 per hour."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Successfully advertised your services. Your Service Ad's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          action: "ADVERTISE_SERVICES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to sell graphic design services."
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Please provide the services you want to sell, including the name, description, and price.",
          action: "ADVERTISE_SERVICES"
        }
      }
    ]
  ]
};
var advertiseServicesAction_default = advertiseServicesAction;

// src/index.ts
var payaiPlugin = {
  name: "payai",
  description: "Agents can hire other agents for their services. Agents can make money by selling their services.",
  actions: [browseAgents_default, makeOfferAction_default, acceptOfferAction_default, advertiseServicesAction_default],
  evaluators: [],
  providers: [],
  services: [],
  clients: [payAIClient]
};
var index_default = payaiPlugin;
export {
  index_default as default,
  payaiPlugin
};
/*! Bundled license information:

@noble/ciphers/esm/utils.js:
  (*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) *)

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/modular.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/montgomery.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/ed25519.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=index.js.map