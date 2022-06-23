
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (Stream) {

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Stream__default = /*#__PURE__*/_interopDefaultLegacy(Stream);

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind$1(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    !function(n){var r={};function o(t){if(r[t])return r[t].exports;var e=r[t]={i:t,l:!1,exports:{}};return n[t].call(e.exports,e,e.exports,o),e.l=!0,e.exports}o.m=n,o.c=r,o.d=function(t,e,n){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n});},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)o.d(n,r,function(t){return e[t]}.bind(null,r));return n},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="",o(o.s=193);}([function(n,t,e){!function(t){function e(t){return t&&t.Math==Math&&t}n.exports=e("object"==typeof globalThis&&globalThis)||e("object"==typeof window&&window)||e("object"==typeof self&&self)||e("object"==typeof t&&t)||function(){return this}()||Function("return this")();}.call(this,e(154));},function(t,e,n){var n=n(60),r=Function.prototype,o=r.bind,i=r.call,a=n&&o.bind(i,i);t.exports=n?function(t){return t&&a(t)}:function(t){return t&&function(){return i.apply(t,arguments)}};},function(t,e){t.exports=function(t){try{return !!t()}catch(t){return !0}};},function(t,e,n){var u=n(0),l=n(42).f,f=n(45),d=n(37),p=n(98),h=n(126),v=n(81);t.exports=function(t,e){var n,r,o,i=t.target,a=t.global,c=t.stat,s=a?u:c?u[i]||p(i,{}):(u[i]||{}).prototype;if(s)for(n in e){if(r=e[n],o=t.noTargetGet?(o=l(s,n))&&o.value:s[n],!v(a?n:i+(c?".":"#")+n,t.forced)&&void 0!==o){if(typeof r==typeof o)continue;h(r,o);}(t.sham||o&&o.sham)&&f(r,"sham",!0),d(s,n,r,t);}};},function(t,e,n){var r=n(105),o=n(37),n=n(158);r||o(Object.prototype,"toString",n,{unsafe:!0});},function(t,e,n){var r=n(30),o=n(89),i=n(68),a=n(49),c=n(22).f,s=n(109),u=n(54),n=n(17),l="Array Iterator",f=a.set,d=a.getterFor(l),a=(t.exports=s(Array,"Array",function(t,e){f(this,{type:l,target:r(t),index:0,kind:e});},function(){var t=d(this),e=t.target,n=t.kind,r=t.index++;return !e||r>=e.length?{value:t.target=void 0,done:!0}:"keys"==n?{value:r,done:!1}:"values"==n?{value:e[r],done:!1}:{value:[r,e[r]],done:!1}},"values"),i.Arguments=i.Array);if(o("keys"),o("values"),o("entries"),!u&&n&&"values"!==a.name)try{c(a,"name",{value:"values"});}catch(t){}},function(t,e,n){var r=n(137).charAt,o=n(23),i=n(49),n=n(109),a="String Iterator",c=i.set,s=i.getterFor(a);n(String,"String",function(t){c(this,{type:a,string:o(t),index:0});},function(){var t=s(this),e=t.string,n=t.index;return n>=e.length?{value:void 0,done:!0}:(e=r(e,n),t.index+=e.length,{value:e,done:!1})});},function(N,R,t){function r(t,e){var n=P[t]=g(T);return ft(n,{type:x,tag:t,description:e}),u||(n.description=e),n}function o(t,e,n){return t===E&&o(M,e,n),h(t),e=y(e),h(n),d(P,e)?(n.enumerable?(d(t,S)&&t[S][e]&&(t[S][e]=!1),n=g(n,{enumerable:m(0,!1)})):(d(t,S)||D(t,S,m(1,{})),t[S][e]=!0),bt(t,e,n)):D(t,e,n)}function n(e,t){h(e);var n=v(t),t=Q(n).concat(a(n));return C(t,function(t){u&&!s(i,n,t)||o(e,t,n[t]);}),e}function i(t){var t=y(t),e=s(yt,this,t);return !(this===E&&d(P,t)&&!d(M,t))&&(!(e||!d(this,t)||!d(P,t)||d(this,S)&&this[S][t])||e)}function B(t,e){var n,t=v(t),e=y(e);if(t!==E||!d(P,e)||d(M,e))return !(n=ht(t,e))||!d(P,e)||d(t,S)&&t[S][e]||(n.enumerable=!0),n}function H(t){var t=vt(v(t)),e=[];return C(t,function(t){d(P,t)||d(it,t)||mt(e,t);}),e}function a(t){var e=t===E,t=vt(e?M:v(t)),n=[];return C(t,function(t){!d(P,t)||e&&!d(E,t)||mt(n,P[t]);}),n}var F,e=t(3),c=t(0),V=t(43),Y=t(84),s=t(21),W=t(1),z=t(54),u=t(17),l=t(96),f=t(2),d=t(20),U=t(86),q=t(14),K=t(19),$=t(44),p=t(73),h=t(18),X=t(36),v=t(30),y=t(72),G=t(23),m=t(61),g=t(50),Q=t(66),Z=t(55),J=t(107),b=t(103),tt=t(42),et=t(22),nt=t(132),rt=t(70),ot=t(106),_=t(37),w=t(77),O=t(79),it=t(63),at=t(78),ct=t(12),st=t(133),ut=t(134),lt=t(87),k=t(49),C=t(56).forEach,S=O("hidden"),x="Symbol",t="prototype",O=ct("toPrimitive"),ft=k.set,dt=k.getterFor(x),E=Object[t],j=c.Symbol,T=j&&j[t],pt=c.TypeError,k=c.QObject,A=V("JSON","stringify"),ht=tt.f,D=et.f,vt=J.f,yt=rt.f,mt=W([].push),P=w("symbols"),M=w("op-symbols"),I=w("string-to-symbol-registry"),L=w("symbol-to-string-registry"),c=w("wks"),gt=!k||!k[t]||!k[t].findChild,bt=u&&f(function(){return 7!=g(D({},"a",{get:function(){return D(this,"a",{value:7}).a}})).a})?function(t,e,n){var r=ht(E,e);r&&delete E[e],D(t,e,n),r&&t!==E&&D(E,e,r);}:D;l||(_(T=(j=function(){if($(T,this))throw pt("Symbol is not a constructor");var t=arguments.length&&void 0!==arguments[0]?G(arguments[0]):void 0,e=at(t),n=function(t){this===E&&s(n,M,t),d(this,S)&&d(this[S],e)&&(this[S][e]=!1),bt(this,e,m(1,t));};return u&&gt&&bt(E,e,{configurable:!0,set:n}),r(e,t)})[t],"toString",function(){return dt(this).tag}),_(j,"withoutSetter",function(t){return r(at(t),t)}),rt.f=i,et.f=o,nt.f=n,tt.f=B,Z.f=J.f=H,b.f=a,st.f=function(t){return r(ct(t),t)},u&&(D(T,"description",{configurable:!0,get:function(){return dt(this).description}}),z||_(E,"propertyIsEnumerable",i,{unsafe:!0}))),e({global:!0,wrap:!0,forced:!l,sham:!l},{Symbol:j}),C(Q(c),function(t){ut(t);}),e({target:x,stat:!0,forced:!l},{for:function(t){t=G(t);if(d(I,t))return I[t];var e=j(t);return I[t]=e,L[e]=t,e},keyFor:function(t){if(!p(t))throw pt(t+" is not a symbol");if(d(L,t))return L[t]},useSetter:function(){gt=!0;},useSimple:function(){gt=!1;}}),e({target:"Object",stat:!0,forced:!l,sham:!u},{create:function(t,e){return void 0===e?g(t):n(g(t),e)},defineProperty:o,defineProperties:n,getOwnPropertyDescriptor:B}),e({target:"Object",stat:!0,forced:!l},{getOwnPropertyNames:H,getOwnPropertySymbols:a}),e({target:"Object",stat:!0,forced:f(function(){b.f(1);})},{getOwnPropertySymbols:function(t){return b.f(X(t))}}),A&&e({target:"JSON",stat:!0,forced:!l||f(function(){var t=j();return "[null]"!=A([t])||"{}"!=A({a:t})||"{}"!=A(Object(t))})},{stringify:function(t,e,n){var r=ot(arguments),o=e;if((K(e)||void 0!==t)&&!p(t))return U(e)||(e=function(t,e){if(q(o)&&(e=s(o,this,t,e)),!p(e))return e}),r[1]=e,Y(A,null,r)}}),T[O]||(F=T.valueOf,_(T,O,function(t){return s(F,this)})),lt(j,x),it[S]=!0;},function(t,e,n){function r(e,t){if(e){if(e[l]!==d)try{u(e,l,d);}catch(t){e[l]=d;}if(e[f]||u(e,f,t),a[t])for(var n in s)if(e[n]!==s[n])try{u(e,n,s[n]);}catch(t){e[n]=s[n];}}}var o,i=n(0),a=n(138),c=n(139),s=n(5),u=n(45),n=n(12),l=n("iterator"),f=n("toStringTag"),d=s.values;for(o in a)r(i[o]&&i[o].prototype,o);r(c,"DOMTokenList");},function(t,e,n){function r(e){if(e&&e.forEach!==s)try{u(e,"forEach",s);}catch(t){e.forEach=s;}}var o,i=n(0),a=n(138),c=n(139),s=n(168),u=n(45);for(o in a)a[o]&&r(i[o]&&i[o].prototype);r(c);},function(t,e,n){var r,o,i,a,c,s,u,l=n(3),f=n(17),d=n(0),p=n(1),h=n(20),v=n(14),y=n(44),m=n(23),g=n(22).f,n=n(126),b=d.Symbol,_=b&&b.prototype;!f||!v(b)||"description"in _&&void 0===b().description||(r={},n(d=function(){var t=arguments.length<1||void 0===arguments[0]?void 0:m(arguments[0]),e=y(_,this)?new b(t):void 0===t?b():b(t);return ""===t&&(r[e]=!0),e},b),(d.prototype=_).constructor=d,o="Symbol(test)"==String(b("test")),i=p(_.toString),a=p(_.valueOf),c=/^Symbol\((.*)\)[^)]+$/,s=p("".replace),u=p("".slice),g(_,"description",{configurable:!0,get:function(){var t=a(this),e=i(t);if(h(r,t))return "";t=o?u(e,7,-1):s(e,c,"$1");return ""===t?void 0:t}}),l({global:!0,forced:!0},{Symbol:d}));},function(t,e,n){n(134)("iterator");},function(t,e,n){var r=n(0),o=n(77),i=n(20),a=n(78),c=n(96),s=n(123),u=o("wks"),l=r.Symbol,f=l&&l.for,d=s?l:l&&l.withoutSetter||a;t.exports=function(t){var e;return i(u,t)&&(c||"string"==typeof u[t])||(e="Symbol."+t,c&&i(l,t)?u[t]=l[t]:u[t]=(s&&f?f:d)(e)),u[t]};},function(t,e,n){var r=n(3),o=n(36),i=n(66);r({target:"Object",stat:!0,forced:n(2)(function(){i(1);})},{keys:function(t){return i(o(t))}});},function(t,e){t.exports=function(t){return "function"==typeof t};},function(t,e,n){var r=n(3),o=n(56).filter;r({target:"Array",proto:!0,forced:!n(94)("filter")},{filter:function(t){return o(this,t,1<arguments.length?arguments[1]:void 0)}});},function(t,e,n){var r=n(3),n=n(90);r({target:"RegExp",proto:!0,forced:/./.exec!==n},{exec:n});},function(t,e,n){n=n(2);t.exports=!n(function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]});},function(t,e,n){var r=n(0),o=n(19),i=r.String,a=r.TypeError;t.exports=function(t){if(o(t))return t;throw a(i(t)+" is not an object")};},function(t,e,n){var r=n(14);t.exports=function(t){return "object"==typeof t?null!==t:r(t)};},function(t,e,n){var r=n(1),o=n(36),i=r({}.hasOwnProperty);t.exports=Object.hasOwn||function(t,e){return i(o(t),e)};},function(t,e,n){var n=n(60),r=Function.prototype.call;t.exports=n?r.bind(r):function(){return r.apply(r,arguments)};},function(t,e,n){var r=n(0),o=n(17),i=n(124),a=n(125),c=n(18),s=n(72),u=r.TypeError,l=Object.defineProperty,f=Object.getOwnPropertyDescriptor,d="enumerable",p="configurable",h="writable";e.f=o?a?function(t,e,n){var r;return c(t),e=s(e),c(n),"function"==typeof t&&"prototype"===e&&"value"in n&&h in n&&!n[h]&&((r=f(t,e))&&r[h]&&(t[e]=n.value,n={configurable:(p in n?n:r)[p],enumerable:(d in n?n:r)[d],writable:!1})),l(t,e,n)}:l:function(t,e,n){if(c(t),e=s(e),c(n),i)try{return l(t,e,n)}catch(t){}if("get"in n||"set"in n)throw u("Accessors not supported");return "value"in n&&(t[e]=n.value),t};},function(t,e,n){var r=n(0),o=n(83),i=r.String;t.exports=function(t){if("Symbol"===o(t))throw TypeError("Cannot convert a Symbol value to a string");return i(t)};},function(t,e,n){var r=n(3),o=n(2),i=n(30),a=n(42).f,n=n(17),o=o(function(){a(1);});r({target:"Object",stat:!0,forced:!n||o,sham:!n},{getOwnPropertyDescriptor:function(t,e){return a(i(t),e)}});},function(t,e,n){var r=n(3),o=n(17),s=n(127),u=n(30),l=n(42),f=n(67);r({target:"Object",stat:!0,sham:!o},{getOwnPropertyDescriptors:function(t){for(var e,n,r=u(t),o=l.f,i=s(r),a={},c=0;i.length>c;)void 0!==(n=o(r,e=i[c++]))&&f(a,e,n);return a}});},function(t,e,n){var r=n(3),o=n(0),i=n(2),u=n(86),l=n(19),f=n(36),d=n(46),p=n(67),h=n(135),a=n(94),c=n(12),n=n(74),v=c("isConcatSpreadable"),y=9007199254740991,m="Maximum allowed index exceeded",g=o.TypeError,c=51<=n||!i(function(){var t=[];return t[v]=!1,t.concat()[0]!==t}),o=a("concat");r({target:"Array",proto:!0,forced:!c||!o},{concat:function(t){for(var e,n,r,o=f(this),i=h(o,0),a=0,c=-1,s=arguments.length;c<s;c++)if(function(t){if(!l(t))return !1;var e=t[v];return void 0!==e?!!e:u(t)}(r=-1===c?o:arguments[c])){if(n=d(r),y<a+n)throw g(m);for(e=0;e<n;e++,a++)e in r&&p(i,a,r[e]);}else {if(y<=a)throw g(m);p(i,a++,r);}return i.length=a,i}});},function(t,e,n){var r=n(3),o=n(0),u=n(86),l=n(85),f=n(19),d=n(101),p=n(46),h=n(30),v=n(67),i=n(12),a=n(94),y=n(106),n=a("slice"),m=i("species"),g=o.Array,b=Math.max;r({target:"Array",proto:!0,forced:!n},{slice:function(t,e){var n,r,o,i=h(this),a=p(i),c=d(t,a),s=d(void 0===e?a:e,a);if(u(i)&&(n=i.constructor,(n=l(n)&&(n===g||u(n.prototype))||f(n)&&null===(n=n[m])?void 0:n)===g||void 0===n))return y(i,c,s);for(r=new(void 0===n?g:n)(b(s-c,0)),o=0;c<s;c++,o++)c in i&&v(r,o,i[c]);return r.length=o,r}});},function(t,e,n){var r=n(3),o=n(56).find,n=n(89),i="find",a=!0;i in[]&&Array(1)[i](function(){a=!1;}),r({target:"Array",proto:!0,forced:a},{find:function(t){return o(this,t,1<arguments.length?arguments[1]:void 0)}}),n(i);},function(t,e,n){n(3)({target:"Object",stat:!0},{setPrototypeOf:n(104)});},function(t,e,n){var r=n(71),o=n(39);t.exports=function(t){return r(o(t))};},function(t,e,n){var r=n(3),o=n(2),i=n(36),a=n(82),n=n(130);r({target:"Object",stat:!0,forced:o(function(){a(1);}),sham:!n},{getPrototypeOf:function(t){return a(i(t))}});},function(t,e,n){var r=n(3),o=n(43),i=n(84),a=n(159),c=n(131),s=n(18),u=n(19),l=n(50),n=n(2),f=o("Reflect","construct"),d=Object.prototype,p=[].push,h=n(function(){function t(){}return !(f(function(){},[],t)instanceof t)}),v=!n(function(){f(function(){});}),o=h||v;r({target:"Reflect",stat:!0,forced:o,sham:o},{construct:function(t,e){c(t),s(e);var n=arguments.length<3?t:c(arguments[2]);if(v&&!h)return f(t,e,n);if(t==n){switch(e.length){case 0:return new t;case 1:return new t(e[0]);case 2:return new t(e[0],e[1]);case 3:return new t(e[0],e[1],e[2]);case 4:return new t(e[0],e[1],e[2],e[3])}var r=[null];return i(p,r,e),new(i(a,t,r))}r=n.prototype,n=l(u(r)?r:d),r=i(t,n,e);return u(r)?r:n}});},function(t,e,n){var r=n(3),o=n(129).includes,n=n(89);r({target:"Array",proto:!0},{includes:function(t){return o(this,t,1<arguments.length?arguments[1]:void 0)}}),n("includes");},function(t,e,n){var r=n(17),o=n(0),i=n(1),a=n(81),c=n(37),s=n(20),u=n(117),l=n(44),f=n(73),d=n(122),p=n(2),h=n(55).f,v=n(42).f,y=n(22).f,m=n(167),g=n(92).trim,n="Number",b=o[n],_=b.prototype,w=o.TypeError,O=i("".slice),k=i("".charCodeAt),C=function(t){var e,n,r,o,i,a,c,s=d(t,"number");if(f(s))throw w("Cannot convert a Symbol value to a number");if("string"==typeof s&&2<s.length)if(s=g(s),43===(t=k(s,0))||45===t){if(88===(e=k(s,2))||120===e)return NaN}else if(48===t){switch(k(s,1)){case 66:case 98:n=2,r=49;break;case 79:case 111:n=8,r=55;break;default:return +s}for(i=(o=O(s,2)).length,a=0;a<i;a++)if((c=k(o,a))<48||r<c)return NaN;return parseInt(o,n)}return +s};if(a(n,!b(" 0o1")||!b("0b1")||b("+0x1"))){for(var S,x=function(t){var t=arguments.length<1?0:b(function(t){t=d(t,"number");return "bigint"==typeof t?t:C(t)}(t)),e=this;return l(_,e)&&p(function(){m(e);})?u(Object(t),e,x):t},E=r?h(b):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,fromString,range".split(","),j=0;E.length>j;j++)s(b,S=E[j])&&!s(x,S)&&y(x,S,v(b,S));c(o,n,(x.prototype=_).constructor=x);}},function(t,e,n){var r=n(3),o=n(174);r({target:"Array",stat:!0,forced:!n(152)(function(t){Array.from(t);})},{from:o});},function(t,e,n){var r=n(0),o=n(39),i=r.Object;t.exports=function(t){return i(o(t))};},function(t,e,n){var s=n(0),u=n(14),l=n(20),f=n(45),d=n(98),r=n(100),o=n(49),p=n(64).CONFIGURABLE,i=o.get,h=o.enforce,v=String(String).split("String");(t.exports=function(t,e,n,r){var o,i=!!r&&!!r.unsafe,a=!!r&&!!r.enumerable,c=!!r&&!!r.noTargetGet,r=r&&void 0!==r.name?r.name:e;u(n)&&("Symbol("===String(r).slice(0,7)&&(r="["+String(r).replace(/^Symbol\(([^)]*)\)/,"$1")+"]"),(!l(n,"name")||p&&n.name!==r)&&f(n,"name",r),(o=h(n)).source||(o.source=v.join("string"==typeof r?r:""))),t===s?a?t[e]=n:d(e,n):(i?!c&&t[e]&&(a=!0):delete t[e],a?t[e]=n:f(t,e,n));})(Function.prototype,"toString",function(){return u(this)&&i(this).source||r(this)});},function(t,e,n){var l=n(84),f=n(21),r=n(1),o=n(112),d=n(115),m=n(18),p=n(39),g=n(164),b=n(113),_=n(65),w=n(23),i=n(53),O=n(108),k=n(114),C=n(90),a=n(111),n=n(2),S=a.UNSUPPORTED_Y,x=4294967295,E=Math.min,j=[].push,T=r(/./.exec),A=r(j),D=r("".slice);o("split",function(o,h,v){var y="c"=="abbc".split(/(b)*/)[1]||4!="test".split(/(?:)/,-1).length||2!="ab".split(/(?:ab)*/).length||4!=".".split(/(.?)(.?)/).length||1<".".split(/()()/).length||"".split(/.?/).length?function(t,e){var n=w(p(this)),r=void 0===e?x:e>>>0;if(0==r)return [];if(void 0===t)return [n];if(!d(t))return f(h,n,t,r);for(var o,i,a,c=[],e=(t.ignoreCase?"i":"")+(t.multiline?"m":"")+(t.unicode?"u":"")+(t.sticky?"y":""),s=0,u=new RegExp(t.source,e+"g");(o=f(C,u,n))&&!(s<(i=u.lastIndex)&&(A(c,D(n,s,o.index)),1<o.length&&o.index<n.length&&l(j,c,O(o,1)),a=o[0].length,s=i,r<=c.length));)u.lastIndex===o.index&&u.lastIndex++;return s===n.length?!a&&T(u,"")||A(c,""):A(c,D(n,s)),r<c.length?O(c,0,r):c}:"0".split(void 0,0).length?function(t,e){return void 0===t&&0===e?[]:f(h,this,t,e)}:h;return [function(t,e){var n=p(this),r=null==t?void 0:i(t,o);return r?f(r,t,n,e):f(y,w(n),t,e)},function(t,e){var n=m(this),r=w(t),t=v(y,n,r,e,y!==h);if(t.done)return t.value;var t=g(n,RegExp),o=n.unicode,i=(n.ignoreCase?"i":"")+(n.multiline?"m":"")+(n.unicode?"u":"")+(S?"g":"y"),a=new t(S?"^(?:"+n.source+")":n,i),c=void 0===e?x:e>>>0;if(0==c)return [];if(0===r.length)return null===k(a,r)?[r]:[];for(var s=0,u=0,l=[];u<r.length;){a.lastIndex=S?0:u;var f,d=k(a,S?D(r,u):r);if(null===d||(f=E(_(a.lastIndex+(S?u:0)),r.length))===s)u=b(r,u,o);else {if(A(l,D(r,s,u)),l.length===c)return l;for(var p=1;p<=d.length-1;p++)if(A(l,d[p]),l.length===c)return l;u=s=f;}}return A(l,D(r,s)),l}]},!!n(function(){var t=/(?:)/,e=t.exec,t=(t.exec=function(){return e.apply(this,arguments)},"ab".split(t));return 2!==t.length||"a"!==t[0]||"b"!==t[1]}),S);},function(t,e,n){var r=n(0).TypeError;t.exports=function(t){if(null==t)throw r("Can't call method on "+t);return t};},function(t,e,n){var r=n(1),o=n(64).PROPER,i=n(37),a=n(18),c=n(44),s=n(23),u=n(2),n=n(110),l="toString",f=RegExp.prototype,d=f[l],p=r(n),r=u(function(){return "/a/b"!=d.call({source:"a",flags:"b"})}),n=o&&d.name!=l;(r||n)&&i(RegExp.prototype,l,function(){var t=a(this),e=s(t.source),n=t.flags;return "/"+e+"/"+s(void 0!==n||!c(f,t)||"flags"in f?n:p(t))},{unsafe:!0});},function(t,e,n){var r=n(17),o=n(64).EXISTS,i=n(1),n=n(22).f,a=Function.prototype,c=i(a.toString),s=/function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/,u=i(s.exec);r&&!o&&n(a,"name",{configurable:!0,get:function(){try{return u(s,c(this))[1]}catch(t){return ""}}});},function(t,e,n){var r=n(17),o=n(21),i=n(70),a=n(61),c=n(30),s=n(72),u=n(20),l=n(124),f=Object.getOwnPropertyDescriptor;e.f=r?f:function(t,e){if(t=c(t),e=s(e),l)try{return f(t,e)}catch(t){}if(u(t,e))return a(!o(i.f,t,e),t[e])};},function(t,e,n){var r=n(0),o=n(14);t.exports=function(t,e){return arguments.length<2?(n=r[t],o(n)?n:void 0):r[t]&&r[t][e];var n;};},function(t,e,n){n=n(1);t.exports=n({}.isPrototypeOf);},function(t,e,n){var r=n(17),o=n(22),i=n(61);t.exports=r?function(t,e,n){return o.f(t,e,i(1,n))}:function(t,e,n){return t[e]=n,t};},function(t,e,n){var r=n(65);t.exports=function(t){return r(t.length)};},function(t,e,n){var O=n(84),o=n(21),r=n(1),i=n(112),a=n(2),k=n(18),C=n(14),S=n(80),x=n(65),E=n(23),c=n(39),j=n(113),s=n(53),T=n(173),A=n(114),u=n(12)("replace"),D=Math.max,P=Math.min,M=r([].concat),I=r([].push),L=r("".indexOf),N=r("".slice),n="$0"==="a".replace(/./,"$0"),l=!!/./[u]&&""===/./[u]("a","$0");i("replace",function(t,b,_){var w=l?"$":"$0";return [function(t,e){var n=c(this),r=null==t?void 0:s(t,u);return r?o(r,t,n,e):o(b,E(n),t,e)},function(t,e){var n=k(this),r=E(t);if("string"==typeof e&&-1===L(e,w)&&-1===L(e,"$<")){t=_(b,n,r,e);if(t.done)return t.value}for(var o,i=C(e),a=(i||(e=E(e)),n.global),c=(a&&(o=n.unicode,n.lastIndex=0),[]);null!==(d=A(n,r))&&(I(c,d),a);)""===E(d[0])&&(n.lastIndex=j(r,x(n.lastIndex),o));for(var s,u="",l=0,f=0;f<c.length;f++){for(var d,p=E((d=c[f])[0]),h=D(P(S(d.index),r.length),0),v=[],y=1;y<d.length;y++)I(v,void 0===(s=d[y])?s:String(s));var m=d.groups,g=i?(g=M([p],v,h,r),void 0!==m&&I(g,m),E(O(e,void 0,g))):T(p,r,h,v,m,e);l<=h&&(u+=N(r,l,h)+g,l=h+p.length);}return u+N(r,l)}]},!!a(function(){var t=/./;return t.exec=function(){var t=[];return t.groups={a:"7"},t},"7"!=="".replace(t,"$<a>")})||!n||l);},function(t,e,n){var n=n(1),r=n({}.toString),o=n("".slice);t.exports=function(t){return o(r(t),8,-1)};},function(t,e,n){var r,o,i,a,c,s,u,l,f=n(156),d=n(0),p=n(1),h=n(19),v=n(45),y=n(20),m=n(97),g=n(79),n=n(63),b="Object already initialized",_=d.TypeError,d=d.WeakMap;u=f||m.state?(r=m.state||(m.state=new d),o=p(r.get),i=p(r.has),a=p(r.set),c=function(t,e){if(i(r,t))throw new _(b);return e.facade=t,a(r,t,e),e},s=function(t){return o(r,t)||{}},function(t){return i(r,t)}):(n[l=g("state")]=!0,c=function(t,e){if(y(t,l))throw new _(b);return e.facade=t,v(t,l,e),e},s=function(t){return y(t,l)?t[l]:{}},function(t){return y(t,l)}),t.exports={set:c,get:s,has:u,enforce:function(t){return u(t)?s(t):c(t,{})},getterFor:function(e){return function(t){if(h(t)&&(t=s(t)).type===e)return t;throw _("Incompatible receiver, "+e+" required")}}};},function(t,e,n){function r(){}function o(t){t.write(v("")),t.close();var e=t.parentWindow.Object;return t=null,e}var i,a=n(18),c=n(132),s=n(102),u=n(63),l=n(160),f=n(99),n=n(79),d="prototype",p="script",h=n("IE_PROTO"),v=function(t){return "<"+p+">"+t+"</"+p+">"},y=function(){try{i=new ActiveXObject("htmlfile");}catch(t){}y="undefined"==typeof document||document.domain&&i?o(i):(t=f("iframe"),e="java"+p+":",t.style.display="none",l.appendChild(t),t.src=String(e),(e=t.contentWindow.document).open(),e.write(v("document.F=Object")),e.close(),e.F);for(var t,e,n=s.length;n--;)delete y[d][s[n]];return y()};u[h]=!0,t.exports=Object.create||function(t,e){var n;return null!==t?(r[d]=a(t),n=new r,r[d]=null,n[h]=t):n=y(),void 0===e?n:c.f(n,e)};},function(t,e,n){var r=n(3),o=n(1),i=n(142),a=n(39),c=n(23),n=n(143),s=o("".indexOf);r({target:"String",proto:!0,forced:!n("includes")},{includes:function(t){return !!~s(c(a(this)),c(i(t)),1<arguments.length?arguments[1]:void 0)}});},function(N,R,t){var e=t(17),n=t(0),r=t(1),o=t(81),u=t(117),l=t(45),i=t(22).f,a=t(55).f,f=t(44),d=t(115),p=t(23),c=t(110),s=t(111),h=t(37),v=t(2),y=t(20),m=t(49).enforce,g=t(144),b=t(12),_=t(140),w=t(141),O=b("match"),k=n.RegExp,C=k.prototype,S=n.SyntaxError,x=r(c),B=r(C.exec),E=r("".charAt),j=r("".replace),T=r("".indexOf),H=r("".slice),F=/^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/,A=/a/g,D=/a/g,t=new k(A)!==A,P=s.MISSED_STICKY,V=s.UNSUPPORTED_Y,b=e&&(!t||P||_||w||v(function(){return D[O]=!1,k(A)!=A||k(D)==D||"/a/i"!=k(A,"i")})),Y=function(t){for(var e,n=t.length,r=0,o="",i=!1;r<=n;r++)"\\"===(e=E(t,r))?o+=e+E(t,++r):i||"."!==e?("["===e?i=!0:"]"===e&&(i=!1),o+=e):o+="[\\s\\S]";return o},W=function(t){for(var e,n=t.length,r=0,o="",i=[],a={},c=!1,s=!1,u=0,l="";r<=n;r++){if("\\"===(e=E(t,r)))e+=E(t,++r);else if("]"===e)c=!1;else if(!c)switch(!0){case"["===e:c=!0;break;case"("===e:B(F,H(t,r+1))&&(r+=2,s=!0),o+=e,u++;continue;case">"===e&&s:if(""===l||y(a,l))throw new S("Invalid capture group name");a[l]=!0,s=!(i[i.length]=[l,u]),l="";continue}s?l+=e:o+=e;}return [o,i]};if(o("RegExp",b)){for(var M=function(t,e){var n,r,o=f(C,this),i=d(t),a=void 0===e,c=[],s=t;if(!o&&i&&a&&t.constructor===M)return t;if((i||f(C,t))&&(t=t.source,a&&(e="flags"in s?s.flags:x(s))),t=void 0===t?"":p(t),e=void 0===e?"":p(e),s=t,i=e=_&&"dotAll"in A&&(n=!!e&&-1<T(e,"s"))?j(e,/s/g,""):e,P&&"sticky"in A&&(r=!!e&&-1<T(e,"y"))&&V&&(e=j(e,/y/g,"")),w&&(t=(a=W(t))[0],c=a[1]),a=u(k(t,e),o?this:C,M),(n||r||c.length)&&(e=m(a),n&&(e.dotAll=!0,e.raw=M(Y(t),i)),r&&(e.sticky=!0),c.length&&(e.groups=c)),t!==s)try{l(a,"source",""===s?"(?:)":s);}catch(t){}return a},I=a(k),L=0;I.length>L;)!function(e){e in M||i(M,e,{configurable:!0,get:function(){return k[e]},set:function(t){k[e]=t;}});}(I[L++]);(C.constructor=M).prototype=C,h(n,"RegExp",M);}g("RegExp");},function(t,e,n){var r=n(62);t.exports=function(t,e){t=t[e];return null==t?void 0:r(t)};},function(t,e){t.exports=!1;},function(t,e,n){var r=n(128),o=n(102).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,o)};},function(t,e,n){function r(d){var p=1==d,h=2==d,v=3==d,y=4==d,m=6==d,g=7==d,b=5==d||m;return function(t,e,n,r){for(var o,i,a=O(t),c=w(a),s=_(e,n),u=k(c),l=0,e=r||C,f=p?e(t,u):h||g?e(t,0):void 0;l<u;l++)if((b||l in c)&&(i=s(o=c[l],l,a),d))if(p)f[l]=i;else if(i)switch(d){case 3:return !0;case 5:return o;case 6:return l;case 2:S(f,o);}else switch(d){case 4:return !1;case 7:S(f,o);}return m?-1:v||y?y:f}}var _=n(88),o=n(1),w=n(71),O=n(36),k=n(46),C=n(135),S=o([].push);t.exports={forEach:r(0),map:r(1),filter:r(2),some:r(3),every:r(4),find:r(5),findIndex:r(6),filterReject:r(7)};},function(t,e,n){var r=n(3),o=n(1),i=n(42).f,a=n(65),c=n(23),s=n(142),u=n(39),l=n(143),n=n(54),f=o("".startsWith),d=o("".slice),p=Math.min,o=l("startsWith");r({target:"String",proto:!0,forced:!!(n||o||(!(l=i(String.prototype,"startsWith"))||l.writable))&&!o},{startsWith:function(t){var e=c(u(this)),n=(s(t),a(p(1<arguments.length?arguments[1]:void 0,e.length))),t=c(t);return f?f(e,t,n):d(e,n,n+t.length)===t}});},function(t,e,n){var r=n(3),o=n(56).map;r({target:"Array",proto:!0,forced:!n(94)("map")},{map:function(t){return o(this,t,1<arguments.length?arguments[1]:void 0)}});},function(t,e,n){var r=n(3),i=n(21),a=n(19),c=n(18),s=n(179),u=n(42),l=n(82);r({target:"Reflect",stat:!0},{get:function t(e,n){var r,o=arguments.length<3?e:arguments[2];return c(e)===o?e[n]:(r=u.f(e,n))?s(r)?r.value:void 0===r.get?void 0:i(r.get,o):a(r=l(e))?t(r,n,o):void 0}});},function(t,e,n){n=n(2);t.exports=!n(function(){var t=function(){}.bind();return "function"!=typeof t||t.hasOwnProperty("prototype")});},function(t,e){t.exports=function(t,e){return {enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}};},function(t,e,n){var r=n(0),o=n(14),i=n(76),a=r.TypeError;t.exports=function(t){if(o(t))return t;throw a(i(t)+" is not a function")};},function(t,e){t.exports={};},function(t,e,n){var r=n(17),n=n(20),o=Function.prototype,i=r&&Object.getOwnPropertyDescriptor,n=n(o,"name"),a=n&&"something"===function(){}.name,r=n&&(!r||i(o,"name").configurable);t.exports={EXISTS:n,PROPER:a,CONFIGURABLE:r};},function(t,e,n){var r=n(80),o=Math.min;t.exports=function(t){return 0<t?o(r(t),9007199254740991):0};},function(t,e,n){var r=n(128),o=n(102);t.exports=Object.keys||function(t){return r(t,o)};},function(t,e,n){var r=n(72),o=n(22),i=n(61);t.exports=function(t,e,n){e=r(e);e in t?o.f(t,e,i(0,n)):t[e]=n;};},function(t,e){t.exports={};},function(t,e,n){var o=n(21),r=n(112),u=n(18),l=n(65),f=n(23),i=n(39),a=n(53),d=n(113),p=n(114);r("match",function(r,c,s){return [function(t){var e=i(this),n=null==t?void 0:a(t,r);return n?o(n,t,e):new RegExp(t)[r](f(e))},function(t){var e=u(this),n=f(t),t=s(c,e,n);if(t.done)return t.value;if(!e.global)return p(e,n);for(var r=e.unicode,o=[],i=e.lastIndex=0;null!==(a=p(e,n));){var a=f(a[0]);""===(o[i]=a)&&(e.lastIndex=d(n,l(e.lastIndex),r)),i++;}return 0===i?null:o}]});},function(t,e,n){var r={}.propertyIsEnumerable,o=Object.getOwnPropertyDescriptor,i=o&&!r.call({1:2},1);e.f=i?function(t){t=o(this,t);return !!t&&t.enumerable}:r;},function(t,e,n){var r=n(0),o=n(1),i=n(2),a=n(48),c=r.Object,s=o("".split);t.exports=i(function(){return !c("z").propertyIsEnumerable(0)})?function(t){return "String"==a(t)?s(t,""):c(t)}:c;},function(t,e,n){var r=n(122),o=n(73);t.exports=function(t){t=r(t,"string");return o(t)?t:t+""};},function(t,e,n){var r=n(0),o=n(43),i=n(14),a=n(44),n=n(123),c=r.Object;t.exports=n?function(t){return "symbol"==typeof t}:function(t){var e=o("Symbol");return i(e)&&a(e.prototype,c(t))};},function(t,e,n){var r,o,i=n(0),n=n(75),a=i.process,i=i.Deno,a=a&&a.versions||i&&i.version,i=a&&a.v8;!(o=i?0<(r=i.split("."))[0]&&r[0]<4?1:+(r[0]+r[1]):o)&&n&&(!(r=n.match(/Edge\/(\d+)/))||74<=r[1])&&(r=n.match(/Chrome\/(\d+)/))&&(o=+r[1]),t.exports=o;},function(t,e,n){n=n(43);t.exports=n("navigator","userAgent")||"";},function(t,e,n){var r=n(0).String;t.exports=function(t){try{return r(t)}catch(t){return "Object"}};},function(t,e,n){var r=n(54),o=n(97);(t.exports=function(t,e){return o[t]||(o[t]=void 0!==e?e:{})})("versions",[]).push({version:"3.21.1",mode:r?"pure":"global",copyright:"© 2014-2022 Denis Pushkarev (zloirock.ru)",license:"https://github.com/zloirock/core-js/blob/v3.21.1/LICENSE",source:"https://github.com/zloirock/core-js"});},function(t,e,n){var n=n(1),r=0,o=Math.random(),i=n(1..toString);t.exports=function(t){return "Symbol("+(void 0===t?"":t)+")_"+i(++r+o,36)};},function(t,e,n){var r=n(77),o=n(78),i=r("keys");t.exports=function(t){return i[t]||(i[t]=o(t))};},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){t=+t;return t!=t||0==t?0:(0<t?r:n)(t)};},function(t,e,n){function r(t,e){return (t=s[c(t)])==l||t!=u&&(i(e)?o(e):!!e)}var o=n(2),i=n(14),a=/#|\.prototype\./,c=r.normalize=function(t){return String(t).replace(a,".").toLowerCase()},s=r.data={},u=r.NATIVE="N",l=r.POLYFILL="P";t.exports=r;},function(t,e,n){var r=n(0),o=n(20),i=n(14),a=n(36),c=n(79),n=n(130),s=c("IE_PROTO"),u=r.Object,l=u.prototype;t.exports=n?u.getPrototypeOf:function(t){t=a(t);if(o(t,s))return t[s];var e=t.constructor;return i(e)&&t instanceof e?e.prototype:t instanceof u?l:null};},function(t,e,n){var r=n(0),o=n(105),i=n(14),a=n(48),c=n(12)("toStringTag"),s=r.Object,u="Arguments"==a(function(){return arguments}());t.exports=o?a:function(t){var e;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(e=function(t,e){try{return t[e]}catch(t){}}(t=s(t),c))?e:u?a(t):"Object"==(e=a(t))&&i(t.callee)?"Arguments":e};},function(t,e,n){var n=n(60),r=Function.prototype,o=r.apply,i=r.call;t.exports="object"==typeof Reflect&&Reflect.apply||(n?i.bind(o):function(){return i.apply(o,arguments)});},function(t,e,n){function r(){}function o(t){if(!s(t))return !1;try{return p(r,d,t),!0}catch(t){return !1}}function i(t){if(!s(t))return !1;switch(u(t)){case"AsyncFunction":case"GeneratorFunction":case"AsyncGeneratorFunction":return !1}try{return y||!!v(h,f(t))}catch(t){return !0}}var a=n(1),c=n(2),s=n(14),u=n(83),l=n(43),f=n(100),d=[],p=l("Reflect","construct"),h=/^\s*(?:class|function)\b/,v=a(h.exec),y=!h.exec(r);i.sham=!0,t.exports=!p||c(function(){var t;return o(o.call)||!o(Object)||!o(function(){t=!0;})||t})?i:o;},function(t,e,n){var r=n(48);t.exports=Array.isArray||function(t){return "Array"==r(t)};},function(t,e,n){var r=n(22).f,o=n(20),i=n(12)("toStringTag");t.exports=function(t,e,n){(t=t&&!n?t.prototype:t)&&!o(t,i)&&r(t,i,{configurable:!0,value:e});};},function(t,e,n){var r=n(1),o=n(62),i=n(60),a=r(r.bind);t.exports=function(t,e){return o(t),void 0===e?t:i?a(t,e):function(){return t.apply(e,arguments)}};},function(t,e,n){var r=n(12),o=n(50),n=n(22),i=r("unscopables"),a=Array.prototype;null==a[i]&&n.f(a,i,{configurable:!0,value:o(null)}),t.exports=function(t){a[i][t]=!0;};},function(t,e,n){var h=n(21),r=n(1),v=n(23),y=n(110),o=n(111),i=n(77),m=n(50),g=n(49).get,a=n(140),n=n(141),b=i("native-string-replace",String.prototype.replace),_=RegExp.prototype.exec,w=_,O=r("".charAt),k=r("".indexOf),C=r("".replace),S=r("".slice),x=(i=/b*/g,h(_,r=/a/,"a"),h(_,i,"a"),0!==r.lastIndex||0!==i.lastIndex),E=o.BROKEN_CARET,j=void 0!==/()??/.exec("")[1];(x||j||E||a||n)&&(w=function(t){var e,n,r,o,i,a,c=this,s=g(c),t=v(t),u=s.raw;if(u)return u.lastIndex=c.lastIndex,f=h(w,u,t),c.lastIndex=u.lastIndex,f;var l=s.groups,u=E&&c.sticky,f=h(y,c),s=c.source,d=0,p=t;if(u&&(f=C(f,"y",""),-1===k(f,"g")&&(f+="g"),p=S(t,c.lastIndex),0<c.lastIndex&&(!c.multiline||c.multiline&&"\n"!==O(t,c.lastIndex-1))&&(s="(?: "+s+")",p=" "+p,d++),e=new RegExp("^(?:"+s+")",f)),j&&(e=new RegExp("^"+s+"$(?!\\s)",f)),x&&(n=c.lastIndex),r=h(_,u?e:c,p),u?r?(r.input=S(r.input,d),r[0]=S(r[0],d),r.index=c.lastIndex,c.lastIndex+=r[0].length):c.lastIndex=0:x&&r&&(c.lastIndex=c.global?r.index+r[0].length:n),j&&r&&1<r.length&&h(b,r[0],e,function(){for(o=1;o<arguments.length-2;o++)void 0===arguments[o]&&(r[o]=void 0);}),r&&l)for(r.groups=i=m(null),o=0;o<l.length;o++)i[(a=l[o])[0]]=r[a[1]];return r}),t.exports=w;},function(t,e,n){var r=n(3),o=n(92).trim;r({target:"String",proto:!0,forced:n(165)("trim")},{trim:function(){return o(this)}});},function(t,e,n){function r(e){return function(t){t=a(i(t));return 1&e&&(t=c(t,s,"")),t=2&e?c(t,u,""):t}}var o=n(1),i=n(39),a=n(23),n=n(93),c=o("".replace),o="["+n+"]",s=RegExp("^"+o+o+"*"),u=RegExp(o+o+"*$");t.exports={start:r(1),end:r(2),trim:r(3)};},function(t,e){t.exports="\t\n\v\f\r                　\u2028\u2029\ufeff";},function(t,e,n){var r=n(2),o=n(12),i=n(74),a=o("species");t.exports=function(e){return 51<=i||!r(function(){var t=[];return (t.constructor={})[a]=function(){return {foo:1}},1!==t[e](Boolean).foo})};},function(t,e,n){var r=n(3),o=n(1),i=n(71),a=n(30),n=n(118),c=o([].join),o=i!=Object,i=n("join",",");r({target:"Array",proto:!0,forced:o||!i},{join:function(t){return c(a(this),void 0===t?",":t)}});},function(t,e,n){var r=n(74),n=n(2);t.exports=!!Object.getOwnPropertySymbols&&!n(function(){var t=Symbol();return !String(t)||!(Object(t)instanceof Symbol)||!Symbol.sham&&r&&r<41});},function(t,e,n){var r=n(0),n=n(98),o="__core-js_shared__",r=r[o]||n(o,{});t.exports=r;},function(t,e,n){var r=n(0),o=Object.defineProperty;t.exports=function(e,n){try{o(r,e,{value:n,configurable:!0,writable:!0});}catch(t){r[e]=n;}return n};},function(t,e,n){var r=n(0),n=n(19),o=r.document,i=n(o)&&n(o.createElement);t.exports=function(t){return i?o.createElement(t):{}};},function(t,e,n){var r=n(1),o=n(14),n=n(97),i=r(Function.toString);o(n.inspectSource)||(n.inspectSource=function(t){return i(t)}),t.exports=n.inspectSource;},function(t,e,n){var r=n(80),o=Math.max,i=Math.min;t.exports=function(t,e){t=r(t);return t<0?o(t+e,0):i(t,e)};},function(t,e){t.exports=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"];},function(t,e){e.f=Object.getOwnPropertySymbols;},function(t,e,n){var o=n(1),i=n(18),a=n(157);t.exports=Object.setPrototypeOf||("__proto__"in{}?function(){var n,r=!1,t={};try{(n=o(Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set))(t,[]),r=t instanceof Array;}catch(t){}return function(t,e){return i(t),a(e),r?n(t,e):t.__proto__=e,t}}():void 0);},function(t,e,n){var r={};r[n(12)("toStringTag")]="z",t.exports="[object z]"===String(r);},function(t,e,n){n=n(1);t.exports=n([].slice);},function(t,e,n){var r=n(48),o=n(30),i=n(55).f,a=n(108),c="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];t.exports.f=function(t){if(!c||"Window"!=r(t))return i(o(t));try{return i(t)}catch(t){return a(c)}};},function(t,e,n){var r=n(0),s=n(101),u=n(46),l=n(67),f=r.Array,d=Math.max;t.exports=function(t,e,n){for(var r=u(t),o=s(e,r),i=s(void 0===n?r:n,r),a=f(d(i-o,0)),c=0;o<i;o++,c++)l(a,c,t[o]);return a.length=c,a};},function(t,e,n){function v(){return this}var y=n(3),m=n(21),g=n(54),r=n(64),b=n(14),_=n(163),w=n(82),O=n(104),k=n(87),C=n(45),S=n(37),o=n(12),x=n(68),n=n(136),E=r.PROPER,j=r.CONFIGURABLE,T=n.IteratorPrototype,A=n.BUGGY_SAFARI_ITERATORS,D=o("iterator"),P="values",M="entries";t.exports=function(t,e,n,r,o,i,a){_(n,e,r);function c(t){if(t===o&&p)return p;if(!A&&t in f)return f[t];switch(t){case"keys":case P:case M:return function(){return new n(this,t)}}return function(){return new n(this)}}var s,u,r=e+" Iterator",l=!1,f=t.prototype,d=f[D]||f["@@iterator"]||o&&f[o],p=!A&&d||c(o),h="Array"==e&&f.entries||d;if(h&&(h=w(h.call(new t)))!==Object.prototype&&h.next&&(g||w(h)===T||(O?O(h,T):b(h[D])||S(h,D,v)),k(h,r,!0,!0),g&&(x[r]=v)),E&&o==P&&d&&d.name!==P&&(!g&&j?C(f,"name",P):(l=!0,p=function(){return m(d,this)})),o)if(s={values:c(P),keys:i?p:c("keys"),entries:c(M)},a)for(u in s)!A&&!l&&u in f||S(f,u,s[u]);else y({target:e,proto:!0,forced:A||l},s);return g&&!a||f[D]===p||S(f,D,p,{name:o}),x[e]=p,s};},function(t,e,n){var r=n(18);t.exports=function(){var t=r(this),e="";return t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.dotAll&&(e+="s"),t.unicode&&(e+="u"),t.sticky&&(e+="y"),e};},function(t,e,n){var r=n(2),o=n(0).RegExp,n=r(function(){var t=o("a","y");return t.lastIndex=2,null!=t.exec("abcd")}),i=n||r(function(){return !o("a","y").sticky}),r=n||r(function(){var t=o("^r","gy");return t.lastIndex=2,null!=t.exec("str")});t.exports={BROKEN_CARET:r,MISSED_STICKY:i,UNSUPPORTED_Y:n};},function(t,e,n){n(16);var s=n(1),u=n(37),l=n(90),f=n(2),d=n(12),p=n(45),h=d("species"),v=RegExp.prototype;t.exports=function(n,t,e,r){var a,o=d(n),c=!f(function(){var t={};return t[o]=function(){return 7},7!=""[n](t)}),i=c&&!f(function(){var t=!1,e=/a/;return "split"===n&&((e={constructor:{}}).constructor[h]=function(){return e},e.flags="",e[o]=/./[o]),e.exec=function(){return t=!0,null},e[o](""),!t});c&&i&&!e||(a=s(/./[o]),i=t(o,""[n],function(t,e,n,r,o){var t=s(t),i=e.exec;return i===l||i===v.exec?c&&!o?{done:!0,value:a(e,n,r)}:{done:!0,value:t(n,e,r)}:{done:!1}}),u(String.prototype,n,i[0]),u(v,o,i[1])),r&&p(v[o],"sham",!0);};},function(t,e,n){var r=n(137).charAt;t.exports=function(t,e,n){return e+(n?r(t,e).length:1)};},function(t,e,n){var r=n(0),o=n(21),i=n(18),a=n(14),c=n(48),s=n(90),u=r.TypeError;t.exports=function(t,e){var n=t.exec;if(a(n))return null!==(n=o(n,t,e))&&i(n),n;if("RegExp"===c(t))return o(s,t,e);throw u("RegExp#exec called on incompatible receiver")};},function(t,e,n){var r=n(19),o=n(48),i=n(12)("match");t.exports=function(t){var e;return r(t)&&(void 0!==(e=t[i])?!!e:"RegExp"==o(t))};},function(t,e,n){var r=n(3),n=n(166);r({target:"Number",stat:!0,forced:Number.parseFloat!=n},{parseFloat:n});},function(t,e,n){var r=n(14),o=n(19),i=n(104);t.exports=function(t,e,n){return i&&r(e=e.constructor)&&e!==n&&o(e=e.prototype)&&e!==n.prototype&&i(t,e),t};},function(t,e,n){var r=n(2);t.exports=function(t,e){var n=[][t];return !!n&&r(function(){n.call(null,e||function(){return 1},1);})};},function(t,e,n){n(145)("Set",function(t){return function(){return t(this,arguments.length?arguments[0]:void 0)}},n(153));},function(t,e,n){var r=n(83),o=n(53),i=n(68),a=n(12)("iterator");t.exports=function(t){if(null!=t)return o(t,a)||o(t,"@@iterator")||i[r(t)]};},function(t,e,n){var r=n(3),n=n(178);r({target:"Number",stat:!0,forced:Number.parseInt!=n},{parseInt:n});},function(t,e,n){var r=n(0),o=n(21),i=n(19),a=n(73),c=n(53),s=n(155),n=n(12),u=r.TypeError,l=n("toPrimitive");t.exports=function(t,e){if(!i(t)||a(t))return t;var n=c(t,l);if(n){if(n=o(n,t,e=void 0===e?"default":e),!i(n)||a(n))return n;throw u("Can't convert object to primitive value")}return s(t,e=void 0===e?"number":e)};},function(t,e,n){n=n(96);t.exports=n&&!Symbol.sham&&"symbol"==typeof Symbol.iterator;},function(t,e,n){var r=n(17),o=n(2),i=n(99);t.exports=!r&&!o(function(){return 7!=Object.defineProperty(i("div"),"a",{get:function(){return 7}}).a});},function(t,e,n){var r=n(17),n=n(2);t.exports=r&&n(function(){return 42!=Object.defineProperty(function(){},"prototype",{value:42,writable:!1}).prototype});},function(t,e,n){var s=n(20),u=n(127),l=n(42),f=n(22);t.exports=function(t,e,n){for(var r=u(e),o=f.f,i=l.f,a=0;a<r.length;a++){var c=r[a];s(t,c)||n&&s(n,c)||o(t,c,i(e,c));}};},function(t,e,n){var r=n(43),o=n(1),i=n(55),a=n(103),c=n(18),s=o([].concat);t.exports=r("Reflect","ownKeys")||function(t){var e=i.f(c(t)),n=a.f;return n?s(e,n(t)):e};},function(t,e,n){var r=n(1),a=n(20),c=n(30),s=n(129).indexOf,u=n(63),l=r([].push);t.exports=function(t,e){var n,r=c(t),o=0,i=[];for(n in r)!a(u,n)&&a(r,n)&&l(i,n);for(;e.length>o;)!a(r,n=e[o++])||~s(i,n)||l(i,n);return i};},function(t,e,n){function r(c){return function(t,e,n){var r,o=s(t),i=l(o),a=u(n,i);if(c&&e!=e){for(;a<i;)if((r=o[a++])!=r)return !0}else for(;a<i;a++)if((c||a in o)&&o[a]===e)return c||a||0;return !c&&-1}}var s=n(30),u=n(101),l=n(46);t.exports={includes:r(!0),indexOf:r(!1)};},function(t,e,n){n=n(2);t.exports=!n(function(){function t(){}return t.prototype.constructor=null,Object.getPrototypeOf(new t)!==t.prototype});},function(t,e,n){var r=n(0),o=n(85),i=n(76),a=r.TypeError;t.exports=function(t){if(o(t))return t;throw a(i(t)+" is not a constructor")};},function(t,e,n){var r=n(17),o=n(125),c=n(22),s=n(18),u=n(30),l=n(66);e.f=r&&!o?Object.defineProperties:function(t,e){s(t);for(var n,r=u(e),o=l(e),i=o.length,a=0;a<i;)c.f(t,n=o[a++],r[n]);return t};},function(t,e,n){n=n(12);e.f=n;},function(t,e,n){var r=n(161),o=n(20),i=n(133),a=n(22).f;t.exports=function(t){var e=r.Symbol||(r.Symbol={});o(e,t)||a(e,t,{value:i.f(t)});};},function(t,e,n){var r=n(162);t.exports=function(t,e){return new(r(t))(0===e?0:e)};},function(t,e,n){var r,o,i=n(2),a=n(14),c=n(50),s=n(82),u=n(37),l=n(12),n=n(54),f=l("iterator"),l=!1;[].keys&&("next"in(o=[].keys())?(s=s(s(o)))!==Object.prototype&&(r=s):l=!0),null==r||i(function(){var t={};return r[f].call(t)!==t})?r={}:n&&(r=c(r)),a(r[f])||u(r,f,function(){return this}),t.exports={IteratorPrototype:r,BUGGY_SAFARI_ITERATORS:l};},function(t,e,n){function r(o){return function(t,e){var n,t=a(c(t)),e=i(e),r=t.length;return e<0||r<=e?o?"":void 0:(n=u(t,e))<55296||56319<n||e+1===r||(r=u(t,e+1))<56320||57343<r?o?s(t,e):n:o?l(t,e,e+2):r-56320+(n-55296<<10)+65536}}var o=n(1),i=n(80),a=n(23),c=n(39),s=o("".charAt),u=o("".charCodeAt),l=o("".slice);t.exports={codeAt:r(!1),charAt:r(!0)};},function(t,e){t.exports={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0};},function(t,e,n){n=n(99)("span").classList,n=n&&n.constructor&&n.constructor.prototype;t.exports=n===Object.prototype?void 0:n;},function(t,e,n){var r=n(2),o=n(0).RegExp;t.exports=r(function(){var t=o(".","s");return !(t.dotAll&&t.exec("\n")&&"s"===t.flags)});},function(t,e,n){var r=n(2),o=n(0).RegExp;t.exports=r(function(){var t=o("(?<a>b)","g");return "b"!==t.exec("b").groups.a||"bc"!=="b".replace(t,"$<a>c")});},function(t,e,n){var r=n(0),o=n(115),i=r.TypeError;t.exports=function(t){if(o(t))throw i("The method doesn't accept regular expressions");return t};},function(t,e,n){var r=n(12)("match");t.exports=function(e){var n=/./;try{"/./"[e](n);}catch(t){try{return n[r]=!1,"/./"[e](n)}catch(t){}}return !1};},function(t,e,n){var r=n(43),o=n(22),i=n(12),a=n(17),c=i("species");t.exports=function(t){var t=r(t),e=o.f;a&&t&&!t[c]&&e(t,c,{configurable:!0,get:function(){return this}});};},function(t,e,n){var y=n(3),m=n(0),g=n(1),b=n(81),_=n(37),w=n(146),O=n(147),k=n(151),C=n(14),S=n(19),x=n(2),E=n(152),j=n(87),T=n(117);t.exports=function(t,e,n){function r(t){var n=g(p[t]);_(p,t,"add"==t?function(t){return n(this,0===t?0:t),this}:"delete"==t?function(t){return !(l&&!S(t))&&n(this,0===t?0:t)}:"get"==t?function(t){return l&&!S(t)?void 0:n(this,0===t?0:t)}:"has"==t?function(t){return !(l&&!S(t))&&n(this,0===t?0:t)}:function(t,e){return n(this,0===t?0:t,e),this});}var o,i,a,c,s,u=-1!==t.indexOf("Map"),l=-1!==t.indexOf("Weak"),f=u?"set":"add",d=m[t],p=d&&d.prototype,h=d,v={};return b(t,!C(d)||!(l||p.forEach&&!x(function(){(new d).entries().next();})))?(h=n.getConstructor(e,t,u,f),w.enable()):b(t,!0)&&(i=(o=new h)[f](l?{}:-0,1)!=o,a=x(function(){o.has(1);}),c=E(function(t){new d(t);}),s=!l&&x(function(){for(var t=new d,e=5;e--;)t[f](e,e);return !t.has(-0)}),c||(((h=e(function(t,e){k(t,p);t=T(new d,t,h);return null!=e&&O(e,t[f],{that:t,AS_ENTRIES:u}),t})).prototype=p).constructor=h),(a||s)&&(r("delete"),r("has"),u&&r("get")),(s||i)&&r(f),l&&p.clear&&delete p.clear),v[t]=h,y({global:!0,forced:h!=d},v),j(h,t),l||n.setStrong(h,t,u),h};},function(t,e,n){function r(t){u(t,y,{value:{objectID:"O"+m++,weakData:{}}});}var a=n(3),c=n(1),o=n(63),i=n(19),s=n(20),u=n(22).f,l=n(55),f=n(107),d=n(169),p=n(78),h=n(171),v=!1,y=p("meta"),m=0,g=t.exports={enable:function(){g.enable=function(){},v=!0;var o=l.f,i=c([].splice),t={};t[y]=1,o(t).length&&(l.f=function(t){for(var e=o(t),n=0,r=e.length;n<r;n++)if(e[n]===y){i(e,n,1);break}return e},a({target:"Object",stat:!0,forced:!0},{getOwnPropertyNames:f.f}));},fastKey:function(t,e){if(!i(t))return "symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!s(t,y)){if(!d(t))return "F";if(!e)return "E";r(t);}return t[y].objectID},getWeakData:function(t,e){if(!s(t,y)){if(!d(t))return !0;if(!e)return !1;r(t);}return t[y].weakData},onFreeze:function(t){return h&&v&&d(t)&&!s(t,y)&&r(t),t}};o[y]=!0;},function(t,e,n){function y(t,e){this.stopped=t,this.result=e;}var r=n(0),m=n(88),g=n(21),b=n(18),_=n(76),w=n(148),O=n(46),k=n(44),C=n(149),S=n(120),x=n(150),E=r.TypeError,j=y.prototype;t.exports=function(t,e,n){function r(t){return i&&x(i,"normal",t),new y(!0,t)}function o(t){return d?(b(t),h?v(t[0],t[1],r):v(t[0],t[1])):h?v(t,r):v(t)}var i,a,c,s,u,l,f=n&&n.that,d=!(!n||!n.AS_ENTRIES),p=!(!n||!n.IS_ITERATOR),h=!(!n||!n.INTERRUPTED),v=m(e,f);if(p)i=t;else {if(!(n=S(t)))throw E(_(t)+" is not iterable");if(w(n)){for(a=0,c=O(t);a<c;a++)if((s=o(t[a]))&&k(j,s))return s;return new y(!1)}i=C(t,n);}for(u=i.next;!(l=g(u,i)).done;){try{s=o(l.value);}catch(t){x(i,"throw",t);}if("object"==typeof s&&s&&k(j,s))return s}return new y(!1)};},function(t,e,n){var r=n(12),o=n(68),i=r("iterator"),a=Array.prototype;t.exports=function(t){return void 0!==t&&(o.Array===t||a[i]===t)};},function(t,e,n){var r=n(0),o=n(21),i=n(62),a=n(18),c=n(76),s=n(120),u=r.TypeError;t.exports=function(t,e){var n=arguments.length<2?s(t):e;if(i(n))return a(o(n,t));throw u(c(t)+" is not iterable")};},function(t,e,n){var i=n(21),a=n(18),c=n(53);t.exports=function(t,e,n){var r,o;a(t);try{if(!(r=c(t,"return"))){if("throw"===e)throw n;return n}r=i(r,t);}catch(t){o=!0,r=t;}if("throw"===e)throw n;if(o)throw r;return a(r),n};},function(t,e,n){var r=n(0),o=n(44),i=r.TypeError;t.exports=function(t,e){if(o(e,t))return t;throw i("Incorrect invocation")};},function(t,e,n){var o=n(12)("iterator"),i=!1;try{var r=0,a={next:function(){return {done:!!r++}},return:function(){i=!0;}};a[o]=function(){return this},Array.from(a,function(){throw 2});}catch(t){}t.exports=function(t,e){if(!e&&!i)return !1;var n=!1;try{var r={};r[o]=function(){return {next:function(){return {done:n=!0}}}},t(r);}catch(t){}return n};},function(t,e,n){var u=n(22).f,l=n(50),f=n(172),d=n(88),p=n(151),h=n(147),a=n(109),c=n(144),v=n(17),y=n(146).fastKey,n=n(49),m=n.set,g=n.getterFor;t.exports={getConstructor:function(t,n,r,o){function i(t,e,n){var r,o=s(t),i=a(t,e);return i?i.value=n:(o.last=i={index:r=y(e,!0),key:e,value:n,previous:e=o.last,next:void 0,removed:!1},o.first||(o.first=i),e&&(e.next=i),v?o.size++:t.size++,"F"!==r&&(o.index[r]=i)),t}function a(t,e){var n,t=s(t),r=y(e);if("F"!==r)return t.index[r];for(n=t.first;n;n=n.next)if(n.key==e)return n}var t=t(function(t,e){p(t,c),m(t,{type:n,index:l(null),first:void 0,last:void 0,size:0}),v||(t.size=0),null!=e&&h(e,t[o],{that:t,AS_ENTRIES:r});}),c=t.prototype,s=g(n);return f(c,{clear:function(){for(var t=s(this),e=t.index,n=t.first;n;)n.removed=!0,n.previous&&(n.previous=n.previous.next=void 0),delete e[n.index],n=n.next;t.first=t.last=void 0,v?t.size=0:this.size=0;},delete:function(t){var e,n,r=s(this),t=a(this,t);return t&&(e=t.next,n=t.previous,delete r.index[t.index],t.removed=!0,n&&(n.next=e),e&&(e.previous=n),r.first==t&&(r.first=e),r.last==t&&(r.last=n),v?r.size--:this.size--),!!t},forEach:function(t){for(var e,n=s(this),r=d(t,1<arguments.length?arguments[1]:void 0);e=e?e.next:n.first;)for(r(e.value,e.key,this);e&&e.removed;)e=e.previous;},has:function(t){return !!a(this,t)}}),f(c,r?{get:function(t){t=a(this,t);return t&&t.value},set:function(t,e){return i(this,0===t?0:t,e)}}:{add:function(t){return i(this,t=0===t?0:t,t)}}),v&&u(c,"size",{get:function(){return s(this).size}}),t},setStrong:function(t,e,n){var r=e+" Iterator",o=g(e),i=g(r);a(t,e,function(t,e){m(this,{type:r,target:t,state:o(t),kind:e,last:void 0});},function(){for(var t=i(this),e=t.kind,n=t.last;n&&n.removed;)n=n.previous;return t.target&&(t.last=n=n?n.next:t.state.first)?"keys"==e?{value:n.key,done:!1}:"values"==e?{value:n.value,done:!1}:{value:[n.key,n.value],done:!1}:{value:t.target=void 0,done:!0}},n?"entries":"values",!n,!0),c(e);}};},function(t,e){var n=function(){return this}();try{n=n||new Function("return this")();}catch(t){"object"==typeof window&&(n=window);}t.exports=n;},function(t,e,n){var r=n(0),o=n(21),i=n(14),a=n(19),c=r.TypeError;t.exports=function(t,e){var n,r;if("string"===e&&i(n=t.toString)&&!a(r=o(n,t)))return r;if(i(n=t.valueOf)&&!a(r=o(n,t)))return r;if("string"!==e&&i(n=t.toString)&&!a(r=o(n,t)))return r;throw c("Can't convert object to primitive value")};},function(t,e,n){var r=n(0),o=n(14),n=n(100),r=r.WeakMap;t.exports=o(r)&&/native code/.test(n(r));},function(t,e,n){var r=n(0),o=n(14),i=r.String,a=r.TypeError;t.exports=function(t){if("object"==typeof t||o(t))return t;throw a("Can't set "+i(t)+" as a prototype")};},function(t,e,n){var r=n(105),o=n(83);t.exports=r?{}.toString:function(){return "[object "+o(this)+"]"};},function(t,e,n){var r=n(0),o=n(1),i=n(62),l=n(19),f=n(20),d=n(106),n=n(60),p=r.Function,h=o([].concat),v=o([].join),y={};t.exports=n?p.bind:function(a){var c=i(this),t=c.prototype,s=d(arguments,1),u=function(){var t=h(s,d(arguments));if(this instanceof u){var e=c,n=t.length,r=t;if(!f(y,n)){for(var o=[],i=0;i<n;i++)o[i]="a["+i+"]";y[n]=p("C,a","return new C("+v(o,",")+")");}return y[n](e,r)}return c.apply(a,t)};return l(t)&&(u.prototype=t),u};},function(t,e,n){n=n(43);t.exports=n("document","documentElement");},function(t,e,n){n=n(0);t.exports=n;},function(t,e,n){var r=n(0),o=n(86),i=n(85),a=n(19),c=n(12)("species"),s=r.Array;t.exports=function(t){var e;return o(t)&&(e=t.constructor,(i(e)&&(e===s||o(e.prototype))||a(e)&&null===(e=e[c]))&&(e=void 0)),void 0===e?s:e};},function(t,e,n){function o(){return this}var i=n(136).IteratorPrototype,a=n(50),c=n(61),s=n(87),u=n(68);t.exports=function(t,e,n,r){e+=" Iterator";return t.prototype=a(i,{next:c(+!r,n)}),s(t,e,!1,!0),u[e]=o,t};},function(t,e,n){var r=n(18),o=n(131),i=n(12)("species");t.exports=function(t,e){var t=r(t).constructor;return void 0===t||null==(t=r(t)[i])?e:o(t)};},function(t,e,n){var r=n(64).PROPER,o=n(2),i=n(93);t.exports=function(t){return o(function(){return !!i[t]()||"​᠎"!=="​᠎"[t]()||r&&i[t].name!==t})};},function(t,e,n){var r=n(0),o=n(2),i=n(1),a=n(23),c=n(92).trim,n=n(93),s=i("".charAt),u=r.parseFloat,i=r.Symbol,l=i&&i.iterator,r=1/u(n+"-0")!=-1/0||l&&!o(function(){u(Object(l));});t.exports=r?function(t){var t=c(a(t)),e=u(t);return 0===e&&"-"==s(t,0)?-0:e}:u;},function(t,e,n){n=n(1);t.exports=n(1..valueOf);},function(t,e,n){var r=n(56).forEach,n=n(118)("forEach");t.exports=n?[].forEach:function(t){return r(this,t,1<arguments.length?arguments[1]:void 0)};},function(t,e,n){var r=n(2),o=n(19),i=n(48),a=n(170),c=Object.isExtensible,n=r(function(){});t.exports=n||a?function(t){return !!o(t)&&((!a||"ArrayBuffer"!=i(t))&&(!c||c(t)))}:c;},function(t,e,n){n=n(2);t.exports=n(function(){var t;"function"==typeof ArrayBuffer&&(t=new ArrayBuffer(8),Object.isExtensible(t)&&Object.defineProperty(t,"a",{value:8}));});},function(t,e,n){n=n(2);t.exports=!n(function(){return Object.isExtensible(Object.preventExtensions({}))});},function(t,e,n){var o=n(37);t.exports=function(t,e,n){for(var r in e)o(t,r,e[r],n);return t};},function(t,e,n){var r=n(1),o=n(36),d=Math.floor,p=r("".charAt),h=r("".replace),v=r("".slice),y=/\$([$&'`]|\d{1,2}|<[^>]*>)/g,m=/\$([$&'`]|\d{1,2})/g;t.exports=function(i,a,c,s,u,t){var l=c+i.length,f=s.length,e=m;return void 0!==u&&(u=o(u),e=y),h(t,e,function(t,e){var n;switch(p(e,0)){case"$":return "$";case"&":return i;case"`":return v(a,0,c);case"'":return v(a,l);case"<":n=u[v(e,1,-1)];break;default:var r,o=+e;if(0==o)return t;if(f<o)return 0!==(r=d(o/10))&&r<=f?void 0===s[r-1]?p(e,1):s[r-1]+p(e,1):t;n=s[o-1];}return void 0===n?"":n})};},function(t,e,n){var r=n(0),d=n(88),p=n(21),h=n(36),v=n(175),y=n(148),m=n(85),g=n(46),b=n(67),_=n(149),w=n(120),O=r.Array;t.exports=function(t){var e,n,r,o,i,a,c=h(t),t=m(this),s=arguments.length,u=1<s?arguments[1]:void 0,l=void 0!==u,s=(l&&(u=d(u,2<s?arguments[2]:void 0)),w(c)),f=0;if(!s||this==O&&y(s))for(e=g(c),n=t?new this(e):O(e);f<e;f++)a=l?u(c[f],f):c[f],b(n,f,a);else for(i=(o=_(c,s)).next,n=t?new this:[];!(r=p(i,o)).done;f++)a=l?v(o,u,[r.value,f],!0):r.value,b(n,f,a);return n.length=f,n};},function(t,e,n){var o=n(18),i=n(150);t.exports=function(e,t,n,r){try{return r?t(o(n)[0],n[1]):t(n)}catch(t){i(e,"throw",t);}};},function(t,e,n){var r=n(3),o=n(2),n=n(107).f;r({target:"Object",stat:!0,forced:o(function(){return !Object.getOwnPropertyNames(1)})},{getOwnPropertyNames:n});},function(t,e,n){n(145)("Map",function(t){return function(){return t(this,arguments.length?arguments[0]:void 0)}},n(153));},function(t,e,n){var r=n(0),o=n(2),i=n(1),a=n(23),c=n(92).trim,n=n(93),s=r.parseInt,r=r.Symbol,u=r&&r.iterator,l=/^[+-]?0x/i,f=i(l.exec),r=8!==s(n+"08")||22!==s(n+"0x16")||u&&!o(function(){s(Object(u));});t.exports=r?function(t,e){t=c(a(t));return s(t,e>>>0||(f(l,t)?16:10))}:s;},function(t,e,n){var r=n(20);t.exports=function(t){return void 0!==t&&(r(t,"value")||r(t,"writable"))};},function(t,e,n){var r=n(3),o=n(1),c=n(62),s=n(36),u=n(46),l=n(23),i=n(2),f=n(181),a=n(118),d=n(182),p=n(183),h=n(74),v=n(184),y=[],m=o(y.sort),g=o(y.push),n=i(function(){y.sort(void 0);}),o=i(function(){y.sort(null);}),a=a("sort"),b=!i(function(){if(h)return h<70;if(!(d&&3<d)){if(p)return !0;if(v)return v<603;for(var t,e,n,r="",o=65;o<76;o++){switch(t=String.fromCharCode(o),o){case 66:case 69:case 70:case 72:e=3;break;case 68:case 71:e=4;break;default:e=2;}for(n=0;n<47;n++)y.push({k:t+n,v:e});}for(y.sort(function(t,e){return e.v-t.v}),n=0;n<y.length;n++)t=y[n].k.charAt(0),r.charAt(r.length-1)!==t&&(r+=t);return "DGBEFHACIJK"!==r}});r({target:"Array",proto:!0,forced:n||!o||!a||!b},{sort:function(t){void 0!==t&&c(t);var e=s(this);if(b)return void 0===t?m(e):m(e,t);for(var n,r,o=[],i=u(e),a=0;a<i;a++)a in e&&g(o,e[a]);for(f(o,(r=t,function(t,e){return void 0===e?-1:void 0===t?1:void 0!==r?+r(t,e)||0:l(t)>l(e)?1:-1})),n=o.length,a=0;a<n;)e[a]=o[a++];for(;a<i;)delete e[a++];return e}});},function(t,e,n){function g(t,e){var n=t.length,r=_(n/2);if(n<8){for(var o,i,a=t,c=e,s=a.length,u=1;u<s;){for(o=a[i=u];i&&0<c(a[i-1],o);)a[i]=a[--i];i!==u++&&(a[i]=o);}return a}for(var l=t,f=g(b(t,0,r),e),d=g(b(t,r),e),p=e,h=f.length,v=d.length,y=0,m=0;y<h||m<v;)l[y+m]=y<h&&m<v?p(f[y],d[m])<=0?f[y++]:d[m++]:y<h?f[y++]:d[m++];return l}var b=n(108),_=Math.floor;t.exports=g;},function(t,e,n){n=n(75).match(/firefox\/(\d+)/i);t.exports=!!n&&+n[1];},function(t,e,n){n=n(75);t.exports=/MSIE|Trident/.test(n);},function(t,e,n){n=n(75).match(/AppleWebKit\/(\d+)\./);t.exports=!!n&&+n[1];},function(t,e,n){var r=n(3),n=n(186);r({target:"Object",stat:!0,forced:Object.assign!==n},{assign:n});},function(t,e,n){var d=n(17),r=n(1),p=n(21),o=n(2),h=n(66),v=n(103),y=n(70),m=n(36),g=n(71),i=Object.assign,a=Object.defineProperty,b=r([].concat);t.exports=!i||o(function(){if(d&&1!==i({b:1},i(a({},"a",{enumerable:!0,get:function(){a(this,"b",{value:3,enumerable:!1});}}),{b:2})).b)return !0;var t={},e={},n=Symbol(),r="abcdefghijklmnopqrst";return t[n]=7,r.split("").forEach(function(t){e[t]=t;}),7!=i({},t)[n]||h(i({},e)).join("")!=r})?function(t,e){for(var n=m(t),r=arguments.length,o=1,i=v.f,a=y.f;o<r;)for(var c,s=g(arguments[o++]),u=i?b(h(s),i(s)):h(s),l=u.length,f=0;f<l;)c=u[f++],d&&!p(a,s,c)||(n[c]=s[c]);return n}:i;},function(t,e,n){var r=n(3),o=n(56).findIndex,n=n(89),i="findIndex",a=!0;i in[]&&Array(1)[i](function(){a=!1;}),r({target:"Array",proto:!0,forced:a},{findIndex:function(t){return o(this,t,1<arguments.length?arguments[1]:void 0)}}),n(i);},function(t,e,n){n(3)({target:"Number",stat:!0},{isNaN:function(t){return t!=t}});},function(t,e,n){var r=n(3),o=n(190).values;r({target:"Object",stat:!0},{values:function(t){return o(t)}});},function(t,e,n){function r(c){return function(t){for(var e,n=l(t),r=u(n),o=r.length,i=0,a=[];i<o;)e=r[i++],s&&!f(n,e)||d(a,c?[e,n[e]]:n[e]);return a}}var s=n(17),o=n(1),u=n(66),l=n(30),f=o(n(70).f),d=o([].push);t.exports={entries:r(!0),values:r(!1)};},function(t,e,n){var n=n(3),r=Math.ceil,o=Math.floor;n({target:"Math",stat:!0},{trunc:function(t){return (0<t?o:r)(t)}});},,function(N,R,t){t.r(R);var i={};t.r(i),t.d(i,"top",function(){return E}),t.d(i,"bottom",function(){return j}),t.d(i,"right",function(){return T}),t.d(i,"left",function(){return A}),t.d(i,"auto",function(){return Lt}),t.d(i,"basePlacements",function(){return Nt}),t.d(i,"start",function(){return Rt}),t.d(i,"end",function(){return Bt}),t.d(i,"clippingParents",function(){return Ht}),t.d(i,"viewport",function(){return Ft}),t.d(i,"popper",function(){return Vt}),t.d(i,"reference",function(){return Yt}),t.d(i,"variationPlacements",function(){return Wt}),t.d(i,"placements",function(){return zt}),t.d(i,"beforeRead",function(){return Ut}),t.d(i,"read",function(){return qt}),t.d(i,"afterRead",function(){return Kt}),t.d(i,"beforeMain",function(){return $t}),t.d(i,"main",function(){return Xt}),t.d(i,"afterMain",function(){return Gt}),t.d(i,"beforeWrite",function(){return Qt}),t.d(i,"write",function(){return Zt}),t.d(i,"afterWrite",function(){return Jt}),t.d(i,"modifierPhases",function(){return te}),t.d(i,"applyStyles",function(){return oe}),t.d(i,"arrow",function(){return Oe}),t.d(i,"computeStyles",function(){return xe}),t.d(i,"eventListeners",function(){return je}),t.d(i,"flip",function(){return Ye}),t.d(i,"hide",function(){return Ue}),t.d(i,"offset",function(){return qe}),t.d(i,"popperOffsets",function(){return Ke}),t.d(i,"preventOverflow",function(){return $e}),t.d(i,"popperGenerator",function(){return Je}),t.d(i,"detectOverflow",function(){return Ve}),t.d(i,"createPopperBase",function(){return tn}),t.d(i,"createPopper",function(){return en}),t.d(i,"createPopperLite",function(){return nn}),t(29),t(31),t(4),t(32),t(7),t(10),t(11),t(5),t(6),t(8),t(16),t(69),t(33),t(51),t(57),t(38),t(91),t(116),t(34),t(9),t(13),t(52),t(40),t(26);function B(t){return (B="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function H(t){return (t=et(t))&&document.querySelector(t)?t:null}function F(t){return (t=et(t))?document.querySelector(t):null}function V(t){t.dispatchEvent(new Event(tt));}function Y(t){return nt(t)?t.jquery?t[0]:t:"string"==typeof t&&0<t.length?document.querySelector(t):null}function W(r,o,i){Object.keys(i).forEach(function(t){var e=i[t],n=o[t],n=n&&nt(n)?"element":null==(n=n)?"".concat(n):{}.toString.call(n).match(/\s([a-z]+)/i)[1].toLowerCase();if(!new RegExp(e).test(n))throw new TypeError("".concat(r.toUpperCase(),': Option "').concat(t,'" provided type "').concat(n,'" but expected type "').concat(e,'".'))});}function z(t){return !(!nt(t)||0===t.getClientRects().length)&&"visible"===getComputedStyle(t).getPropertyValue("visibility")}function U(t){return !t||t.nodeType!==Node.ELEMENT_NODE||(!!t.classList.contains("disabled")||(void 0!==t.disabled?t.disabled:t.hasAttribute("disabled")&&"false"!==t.getAttribute("disabled")))}function q(t){return document.documentElement.attachShadow?"function"==typeof t.getRootNode?(e=t.getRootNode())instanceof ShadowRoot?e:null:t instanceof ShadowRoot?t:t.parentNode?q(t.parentNode):null:null;var e;}function K(){}function $(t){t.offsetHeight;}function X(){var t=window.jQuery;return t&&!document.body.hasAttribute("data-bs-no-jquery")?t:null}function a(){return "rtl"===document.documentElement.dir}function e(r){var t;t=function(){var t,e,n=X();n&&(t=r.NAME,e=n.fn[t],n.fn[t]=r.jQueryInterface,n.fn[t].Constructor=r,n.fn[t].noConflict=function(){return n.fn[t]=e,r.jQueryInterface});},"loading"===document.readyState?(rt.length||document.addEventListener("DOMContentLoaded",function(){rt.forEach(function(t){return t()});}),rt.push(t)):t();}function G(t){"function"==typeof t&&t();}function Q(n,r){var t,o;2<arguments.length&&void 0!==arguments[2]&&!arguments[2]?G(n):(t=function(t){if(!t)return 0;var t=window.getComputedStyle(t),e=t.transitionDuration,t=t.transitionDelay,n=Number.parseFloat(e),r=Number.parseFloat(t);return n||r?(e=e.split(",")[0],t=t.split(",")[0],(Number.parseFloat(e)+Number.parseFloat(t))*J):0}(r)+5,o=!1,r.addEventListener(tt,function t(e){e.target===r&&(o=!0,r.removeEventListener(tt,t),G(n));}),setTimeout(function(){o||V(r);},t));}function Z(t,e,n,r){if(-1===(e=t.indexOf(e)))return t[!n&&r?t.length-1:0];var o=t.length;return e+=n?1:-1,r&&(e=(e+o)%o),t[Math.max(0,Math.min(e,o-1))]}var J=1e3,tt="transitionend",et=function(t){var e=t.getAttribute("data-bs-target");if(!e||"#"===e){t=t.getAttribute("href");if(!t||!t.includes("#")&&!t.startsWith("."))return null;e=(t=t.includes("#")&&!t.startsWith("#")?"#".concat(t.split("#")[1]):t)&&"#"!==t?t.trim():null;}return e},nt=function(t){return !(!t||"object"!==B(t))&&void 0!==(t=void 0!==t.jquery?t[0]:t).nodeType},rt=[];t(119),t(47),t(27),t(41),t(35);function ot(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var r,o,i=[],a=!0,c=!1;try{for(n=n.call(t);!(a=(r=n.next()).done)&&(i.push(r.value),!e||i.length!==e);a=!0);}catch(t){c=!0,o=t;}finally{try{a||null==n.return||n.return();}finally{if(c)throw o}}return i}}(t,e)||function(t,e){if(t){if("string"==typeof t)return it(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?it(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function it(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}var at=/[^.]*(?=\..*)\.|.*/,ct=/\..*/,st=/::\d+$/,ut={},lt=1,ft={mouseenter:"mouseover",mouseleave:"mouseout"},dt=/^(mouseenter|mouseleave)/i,pt=new Set(["click","dblclick","mouseup","mousedown","contextmenu","mousewheel","DOMMouseScroll","mouseover","mouseout","mousemove","selectstart","selectend","keydown","keypress","keyup","orientationchange","touchstart","touchmove","touchend","touchcancel","pointerdown","pointermove","pointerup","pointerleave","pointercancel","gesturestart","gesturechange","gestureend","focus","blur","change","reset","select","submit","focusin","focusout","load","unload","beforeunload","resize","move","DOMContentLoaded","readystatechange","error","abort","scroll"]);function ht(t,e){return e&&"".concat(e,"::").concat(lt++)||t.uidEvent||lt++}function vt(t){var e=ht(t);return t.uidEvent=e,ut[e]=ut[e]||{},ut[e]}function yt(t,e,n){for(var r=2<arguments.length&&void 0!==n?n:null,o=Object.keys(t),i=0,a=o.length;i<a;i++){var c=t[o[i]];if(c.originalHandler===e&&c.delegationSelector===r)return c}return null}function mt(t,e,n){var r="string"==typeof e,n=r?n:e,e=_t(t);return [r,n,e=pt.has(e)?e:t]}function gt(t,e,n,r,o){var i,a,c,s,u,l,f,d,p,h;"string"==typeof e&&t&&(n||(n=r,r=null),dt.test(e)&&(c=function(e){return function(t){if(!t.relatedTarget||t.relatedTarget!==t.delegateTarget&&!t.delegateTarget.contains(t.relatedTarget))return e.call(this,t)}},r?r=c(r):n=c(n)),i=(c=ot(mt(e,n,r),3))[0],a=c[1],c=c[2],(u=yt(s=(s=vt(t))[c]||(s[c]={}),a,i?n:null))?u.oneOff=u.oneOff&&o:(u=ht(a,e.replace(at,"")),(e=i?(d=t,p=n,h=r,function t(e){for(var n=d.querySelectorAll(p),r=e.target;r&&r!==this;r=r.parentNode)for(var o=n.length;o--;)if(n[o]===r)return e.delegateTarget=r,t.oneOff&&wt.off(d,e.type,p,h),h.apply(r,[e]);return null}):(l=t,f=n,function t(e){return e.delegateTarget=l,t.oneOff&&wt.off(l,e.type,f),f.apply(l,[e])})).delegationSelector=i?n:null,e.originalHandler=a,e.oneOff=o,s[e.uidEvent=u]=e,t.addEventListener(c,e,i)));}function bt(t,e,n,r,o){r=yt(e[n],r,o);r&&(t.removeEventListener(n,r,Boolean(o)),delete e[n][r.uidEvent]);}function _t(t){return t=t.replace(ct,""),ft[t]||t}var wt={on:function(t,e,n,r){gt(t,e,n,r,!1);},one:function(t,e,n,r){gt(t,e,n,r,!0);},off:function(a,c,t,e){if("string"==typeof c&&a){var e=ot(mt(c,t,e),3),n=e[0],r=e[1],o=e[2],i=o!==c,s=vt(a),e=c.startsWith(".");if(void 0!==r)return s&&s[o]?void bt(a,s,o,r,n?t:null):void 0;e&&Object.keys(s).forEach(function(t){var e,n,r,o,i;e=a,n=s,r=t,o=c.slice(1),i=n[r]||{},Object.keys(i).forEach(function(t){t.includes(o)&&(t=i[t],bt(e,n,r,t.originalHandler,t.delegationSelector));});});var u=s[o]||{};Object.keys(u).forEach(function(t){var e=t.replace(st,"");i&&!c.includes(e)||(e=u[t],bt(a,s,o,e.originalHandler,e.delegationSelector));});}},trigger:function(t,e,n){if("string"!=typeof e||!t)return null;var r,o=X(),i=_t(e),a=e!==i,c=pt.has(i),s=!0,u=!0,l=!1,f=null;return a&&o&&(r=o.Event(e,n),o(t).trigger(r),s=!r.isPropagationStopped(),u=!r.isImmediatePropagationStopped(),l=r.isDefaultPrevented()),c?(f=document.createEvent("HTMLEvents")).initEvent(i,s,!0):f=new CustomEvent(e,{bubbles:s,cancelable:!0}),void 0!==n&&Object.keys(n).forEach(function(t){Object.defineProperty(f,t,{get:function(){return n[t]}});}),l&&f.preventDefault(),u&&t.dispatchEvent(f),f.defaultPrevented&&void 0!==r&&r.preventDefault(),f}},d=wt,Ot=(t(176),t(177),new Map),kt=function(t,e,n){Ot.has(t)||Ot.set(t,new Map);t=Ot.get(t);t.has(e)||0===t.size?t.set(e,n):console.error("Bootstrap doesn't allow more than one instance per element. Bound instance: ".concat(Array.from(t.keys())[0],"."));},Ct=function(t,e){return Ot.has(t)&&Ot.get(t).get(e)||null},St=function(t,e){var n;Ot.has(t)&&((n=Ot.get(t)).delete(e),0===n.size&&Ot.delete(t));};function xt(t){return (xt="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Et(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}var c=function(){function e(t){if(!(this instanceof e))throw new TypeError("Cannot call a class as a function");(t=Y(t))&&(this._element=t,kt(this._element,this.constructor.DATA_KEY,this));}var t,n,r;return t=e,r=[{key:"getInstance",value:function(t){return Ct(Y(t),this.DATA_KEY)}},{key:"getOrCreateInstance",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return this.getInstance(t)||new this(t,"object"===xt(e)?e:null)}},{key:"VERSION",get:function(){return "5.1.3"}},{key:"NAME",get:function(){throw new Error('You have to implement the static method "NAME", for each component!')}},{key:"DATA_KEY",get:function(){return "bs.".concat(this.NAME)}},{key:"EVENT_KEY",get:function(){return ".".concat(this.DATA_KEY)}}],(n=[{key:"dispose",value:function(){var e=this;St(this._element,this.constructor.DATA_KEY),d.off(this._element,this.constructor.EVENT_KEY),Object.getOwnPropertyNames(this).forEach(function(t){e[t]=null;});}},{key:"_queueCallback",value:function(t,e){Q(t,e,!(2<arguments.length&&void 0!==arguments[2])||arguments[2]);}}])&&Et(t.prototype,n),r&&Et(t,r),Object.defineProperty(t,"prototype",{writable:!1}),e}();function jt(t){return (jt="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Tt(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function At(t,e){return (At=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function Dt(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=Pt(n),e=(t=r?(t=Pt(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===jt(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function Pt(t){return (Pt=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var R=".".concat("bs.button"),Mt='[data-bs-toggle="button"]',R="click".concat(R).concat(".data-api"),It=function(){var t=o,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&At(t,e);var n,r=Dt(o);function o(){var t=this,e=o;if(t instanceof e)return r.apply(this,arguments);throw new TypeError("Cannot call a class as a function")}return t=o,e=[{key:"NAME",get:function(){return "button"}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t=o.getOrCreateInstance(this);"toggle"===e&&t[e]();})}}],(n=[{key:"toggle",value:function(){this._element.setAttribute("aria-pressed",this._element.classList.toggle("active"));}}])&&Tt(t.prototype,n),e&&Tt(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),R=(d.on(document,R,Mt,function(t){t.preventDefault();t=t.target.closest(Mt);It.getOrCreateInstance(t).toggle();}),e(It),It),E=(t(28),t(58),t(121),t(15),t(59),t(24),t(25),"top"),j="bottom",T="right",A="left",Lt="auto",Nt=[E,j,T,A],Rt="start",Bt="end",Ht="clippingParents",Ft="viewport",Vt="popper",Yt="reference",Wt=Nt.reduce(function(t,e){return t.concat([e+"-"+Rt,e+"-"+Bt])},[]),zt=[].concat(Nt,[Lt]).reduce(function(t,e){return t.concat([e,e+"-"+Rt,e+"-"+Bt])},[]),Ut="beforeRead",qt="read",Kt="afterRead",$t="beforeMain",Xt="main",Gt="afterMain",Qt="beforeWrite",Zt="write",Jt="afterWrite",te=[Ut,qt,Kt,$t,Xt,Gt,Qt,Zt,Jt];function ee(t){return t?(t.nodeName||"").toLowerCase():null}function b(t){return null==t?window:"[object Window]"!==t.toString()?(e=t.ownerDocument)&&e.defaultView||window:t;var e;}function ne(t){return t instanceof b(t).Element||t instanceof Element}function s(t){return t instanceof b(t).HTMLElement||t instanceof HTMLElement}function re(t){if("undefined"!=typeof ShadowRoot)return t instanceof b(t).ShadowRoot||t instanceof ShadowRoot}var oe={name:"applyStyles",enabled:!0,phase:"write",fn:function(t){var o=t.state;Object.keys(o.elements).forEach(function(t){var e=o.styles[t]||{},n=o.attributes[t]||{},r=o.elements[t];s(r)&&ee(r)&&(Object.assign(r.style,e),Object.keys(n).forEach(function(t){var e=n[t];!1===e?r.removeAttribute(t):r.setAttribute(t,!0===e?"":e);}));});},effect:function(t){var r=t.state,o={popper:{position:r.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(r.elements.popper.style,o.popper),r.styles=o,r.elements.arrow&&Object.assign(r.elements.arrow.style,o.arrow),function(){Object.keys(r.elements).forEach(function(t){var e=r.elements[t],n=r.attributes[t]||{},t=Object.keys((r.styles.hasOwnProperty(t)?r.styles:o)[t]).reduce(function(t,e){return t[e]="",t},{});s(e)&&ee(e)&&(Object.assign(e.style,t),Object.keys(n).forEach(function(t){e.removeAttribute(t);}));});}},requires:["computeStyles"]};function ie(t){return t.split("-")[0]}var ae=Math.max,ce=Math.min,se=Math.round;function ue(t,e){void 0===e&&(e=!1);var n=t.getBoundingClientRect(),r=1,o=1;return s(t)&&e&&(e=t.offsetHeight,0<(t=t.offsetWidth)&&(r=se(n.width)/t||1),0<e&&(o=se(n.height)/e||1)),{width:n.width/r,height:n.height/o,top:n.top/o,right:n.right/r,bottom:n.bottom/o,left:n.left/r,x:n.left/r,y:n.top/o}}function le(t){var e=ue(t),n=t.offsetWidth,r=t.offsetHeight;return Math.abs(e.width-n)<=1&&(n=e.width),Math.abs(e.height-r)<=1&&(r=e.height),{x:t.offsetLeft,y:t.offsetTop,width:n,height:r}}function fe(t,e){var n=e.getRootNode&&e.getRootNode();if(t.contains(e))return !0;if(n&&re(n)){var r=e;do{if(r&&t.isSameNode(r))return !0}while(r=r.parentNode||r.host)}return !1}function de(t){return b(t).getComputedStyle(t)}function pe(t){return ((ne(t)?t.ownerDocument:t.document)||window.document).documentElement}function he(t){return "html"===ee(t)?t:t.assignedSlot||t.parentNode||(re(t)?t.host:null)||pe(t)}function ve(t){return s(t)&&"fixed"!==de(t).position?t.offsetParent:null}function ye(t){for(var e,n=b(t),r=ve(t);r&&(e=r,0<=["table","td","th"].indexOf(ee(e)))&&"static"===de(r).position;)r=ve(r);return (!r||"html"!==ee(r)&&("body"!==ee(r)||"static"!==de(r).position))&&(r||function(t){var e=-1!==navigator.userAgent.toLowerCase().indexOf("firefox"),n=-1!==navigator.userAgent.indexOf("Trident");if(n&&s(t)&&"fixed"===de(t).position)return null;var r=he(t);for(re(r)&&(r=r.host);s(r)&&["html","body"].indexOf(ee(r))<0;){var o=de(r);if("none"!==o.transform||"none"!==o.perspective||"paint"===o.contain||-1!==["transform","perspective"].indexOf(o.willChange)||e&&"filter"===o.willChange||e&&o.filter&&"none"!==o.filter)return r;r=r.parentNode;}return null}(t))||n}function me(t){return 0<=["top","bottom"].indexOf(t)?"x":"y"}function ge(t,e,n){return ae(t,ce(e,n))}function be(){return {top:0,right:0,bottom:0,left:0}}function _e(t){return Object.assign({},be(),t)}function we(n,t){return t.reduce(function(t,e){return t[e]=n,t},{})}var Oe={name:"arrow",enabled:!0,phase:"main",fn:function(t){var e,n,r,o,i=t.state,a=t.name,t=t.options,c=i.elements.arrow,s=i.modifiersData.popperOffsets,u=me(l=ie(i.placement)),l=0<=[A,T].indexOf(l)?"height":"width";c&&s&&(t=t.padding,n=i,n=_e("number"!=typeof(t="function"==typeof t?t(Object.assign({},n.rects,{placement:n.placement})):t)?t:we(t,Nt)),t=le(c),o="y"===u?E:A,r="y"===u?j:T,e=i.rects.reference[l]+i.rects.reference[u]-s[u]-i.rects.popper[l],s=s[u]-i.rects.reference[u],c=(c=ye(c))?"y"===u?c.clientHeight||0:c.clientWidth||0:0,o=n[o],n=c-t[l]-n[r],o=ge(o,r=c/2-t[l]/2+(e/2-s/2),n),i.modifiersData[a]=((c={})[u]=o,c.centerOffset=o-r,c));},effect:function(t){var e=t.state;null!=(t=void 0===(t=t.options.element)?"[data-popper-arrow]":t)&&("string"!=typeof t||(t=e.elements.popper.querySelector(t)))&&fe(e.elements.popper,t)&&(e.elements.arrow=t);},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function ke(t){return t.split("-")[1]}var Ce={top:"auto",right:"auto",bottom:"auto",left:"auto"};function Se(t){var e,n,r,o=t.popper,i=t.popperRect,a=t.placement,c=t.variation,s=t.offsets,u=t.position,l=t.gpuAcceleration,f=t.adaptive,d=t.roundOffsets,t=t.isFixed,p=s.x,p=void 0===p?0:p,h=s.y,h=void 0===h?0:h,v="function"==typeof d?d({x:p,y:h}):{x:p,y:h},v=(p=v.x,h=v.y,s.hasOwnProperty("x")),s=s.hasOwnProperty("y"),y=A,m=E,g=window,o=(f&&(n="clientHeight",e="clientWidth",(r=ye(o))===b(o)&&"static"!==de(r=pe(o)).position&&"absolute"===u&&(n="scrollHeight",e="scrollWidth"),a!==E&&(a!==A&&a!==T||c!==Bt)||(m=j,h=(h-((t&&r===g&&g.visualViewport?g.visualViewport.height:r[n])-i.height))*(l?1:-1)),a!==A&&(a!==E&&a!==j||c!==Bt)||(y=T,p=(p-((t&&r===g&&g.visualViewport?g.visualViewport.width:r[e])-i.width))*(l?1:-1))),Object.assign({position:u},f&&Ce)),t=!0===d?(a=(n={x:p,y:h}).x,n=n.y,c=window.devicePixelRatio||1,{x:se(a*c)/c||0,y:se(n*c)/c||0}):{x:p,y:h};return p=t.x,h=t.y,l?Object.assign({},o,((r={})[m]=s?"0":"",r[y]=v?"0":"",r.transform=(g.devicePixelRatio||1)<=1?"translate("+p+"px, "+h+"px)":"translate3d("+p+"px, "+h+"px, 0)",r)):Object.assign({},o,((e={})[m]=s?h+"px":"",e[y]=v?p+"px":"",e.transform="",e))}var xe={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(t){var e=t.state,t=t.options,n=void 0===(n=t.gpuAcceleration)||n,r=void 0===(r=t.adaptive)||r,t=void 0===(t=t.roundOffsets)||t,n={placement:ie(e.placement),variation:ke(e.placement),popper:e.elements.popper,popperRect:e.rects.popper,gpuAcceleration:n,isFixed:"fixed"===e.options.strategy};null!=e.modifiersData.popperOffsets&&(e.styles.popper=Object.assign({},e.styles.popper,Se(Object.assign({},n,{offsets:e.modifiersData.popperOffsets,position:e.options.strategy,adaptive:r,roundOffsets:t})))),null!=e.modifiersData.arrow&&(e.styles.arrow=Object.assign({},e.styles.arrow,Se(Object.assign({},n,{offsets:e.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:t})))),e.attributes.popper=Object.assign({},e.attributes.popper,{"data-popper-placement":e.placement});},data:{}},Ee={passive:!0};var je={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(t){var e=t.state,n=t.instance,r=(t=t.options).scroll,o=void 0===r||r,i=void 0===(r=t.resize)||r,a=b(e.elements.popper),c=[].concat(e.scrollParents.reference,e.scrollParents.popper);return o&&c.forEach(function(t){t.addEventListener("scroll",n.update,Ee);}),i&&a.addEventListener("resize",n.update,Ee),function(){o&&c.forEach(function(t){t.removeEventListener("scroll",n.update,Ee);}),i&&a.removeEventListener("resize",n.update,Ee);}},data:{}},Te={left:"right",right:"left",bottom:"top",top:"bottom"};function Ae(t){return t.replace(/left|right|bottom|top/g,function(t){return Te[t]})}var De={start:"end",end:"start"};function Pe(t){return t.replace(/start|end/g,function(t){return De[t]})}function Me(t){t=b(t);return {scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function Ie(t){return ue(pe(t)).left+Me(t).scrollLeft}function Le(t){var t=de(t),e=t.overflow,n=t.overflowX,t=t.overflowY;return /auto|scroll|overlay|hidden/.test(e+t+n)}function Ne(t,e){void 0===e&&(e=[]);var n=function t(e){return 0<=["html","body","#document"].indexOf(ee(e))?e.ownerDocument.body:s(e)&&Le(e)?e:t(he(e))}(t),t=n===(null==(t=t.ownerDocument)?void 0:t.body),r=b(n),r=t?[r].concat(r.visualViewport||[],Le(n)?n:[]):n,n=e.concat(r);return t?n:n.concat(Ne(he(r)))}function Re(t){return Object.assign({},t,{left:t.x,top:t.y,right:t.x+t.width,bottom:t.y+t.height})}function Be(t,e){return e===Ft?Re((r=b(n=t),o=pe(n),r=r.visualViewport,i=o.clientWidth,o=o.clientHeight,c=a=0,r&&(i=r.width,o=r.height,/^((?!chrome|android).)*safari/i.test(navigator.userAgent)||(a=r.offsetLeft,c=r.offsetTop)),{width:i,height:o,x:a+Ie(n),y:c})):ne(e)?((i=ue(r=e)).top=i.top+r.clientTop,i.left=i.left+r.clientLeft,i.bottom=i.top+r.clientHeight,i.right=i.left+r.clientWidth,i.width=r.clientWidth,i.height=r.clientHeight,i.x=i.left,i.y=i.top,i):Re((o=pe(t),a=pe(o),n=Me(o),c=null==(c=o.ownerDocument)?void 0:c.body,e=ae(a.scrollWidth,a.clientWidth,c?c.scrollWidth:0,c?c.clientWidth:0),t=ae(a.scrollHeight,a.clientHeight,c?c.scrollHeight:0,c?c.clientHeight:0),o=-n.scrollLeft+Ie(o),n=-n.scrollTop,"rtl"===de(c||a).direction&&(o+=ae(a.clientWidth,c?c.clientWidth:0)-e),{width:e,height:t,x:o,y:n}));var n,r,o,i,a,c;}function He(n,t,e){var r,o="clippingParents"===t?(i=Ne(he(o=n)),ne(r=0<=["absolute","fixed"].indexOf(de(o).position)&&s(o)?ye(o):o)?i.filter(function(t){return ne(t)&&fe(t,r)&&"body"!==ee(t)}):[]):[].concat(t),i=[].concat(o,[e]),t=i[0],e=i.reduce(function(t,e){e=Be(n,e);return t.top=ae(e.top,t.top),t.right=ce(e.right,t.right),t.bottom=ce(e.bottom,t.bottom),t.left=ae(e.left,t.left),t},Be(n,t));return e.width=e.right-e.left,e.height=e.bottom-e.top,e.x=e.left,e.y=e.top,e}function Fe(t){var e,n=t.reference,r=t.element,t=t.placement,o=t?ie(t):null,t=t?ke(t):null,i=n.x+n.width/2-r.width/2,a=n.y+n.height/2-r.height/2;switch(o){case E:e={x:i,y:n.y-r.height};break;case j:e={x:i,y:n.y+n.height};break;case T:e={x:n.x+n.width,y:a};break;case A:e={x:n.x-r.width,y:a};break;default:e={x:n.x,y:n.y};}var c=o?me(o):null;if(null!=c){var s="y"===c?"height":"width";switch(t){case Rt:e[c]=e[c]-(n[s]/2-r[s]/2);break;case Bt:e[c]=e[c]+(n[s]/2-r[s]/2);}}return e}function Ve(t,e){var r,e=e=void 0===e?{}:e,n=e.placement,n=void 0===n?t.placement:n,o=e.boundary,o=void 0===o?Ht:o,i=e.rootBoundary,i=void 0===i?Ft:i,a=e.elementContext,a=void 0===a?Vt:a,c=e.altBoundary,c=void 0!==c&&c,e=e.padding,e=void 0===e?0:e,e=_e("number"!=typeof e?e:we(e,Nt)),s=t.rects.popper,c=t.elements[c?a===Vt?Yt:Vt:a],c=He(ne(c)?c:c.contextElement||pe(t.elements.popper),o,i),o=ue(t.elements.reference),i=Fe({reference:o,element:s,strategy:"absolute",placement:n}),s=Re(Object.assign({},s,i)),i=a===Vt?s:o,u={top:c.top-i.top+e.top,bottom:i.bottom-c.bottom+e.bottom,left:c.left-i.left+e.left,right:i.right-c.right+e.right},s=t.modifiersData.offset;return a===Vt&&s&&(r=s[n],Object.keys(u).forEach(function(t){var e=0<=[T,j].indexOf(t)?1:-1,n=0<=[E,j].indexOf(t)?"y":"x";u[t]+=r[n]*e;})),u}var Ye={name:"flip",enabled:!0,phase:"main",fn:function(t){var f=t.state,e=t.options,t=t.name;if(!f.modifiersData[t]._skip){for(var n=e.mainAxis,r=void 0===n||n,n=e.altAxis,o=void 0===n||n,n=e.fallbackPlacements,d=e.padding,p=e.boundary,h=e.rootBoundary,i=e.altBoundary,a=e.flipVariations,v=void 0===a||a,y=e.allowedAutoPlacements,a=f.options.placement,e=ie(a),n=n||(e===a||!v?[Ae(a)]:function(t){if(ie(t)===Lt)return [];var e=Ae(t);return [Pe(t),e,Pe(e)]}(a)),c=[a].concat(n).reduce(function(t,e){return t.concat(ie(e)===Lt?(n=f,r=(t=t=void 0===(t={placement:e,boundary:p,rootBoundary:h,padding:d,flipVariations:v,allowedAutoPlacements:y})?{}:t).placement,o=t.boundary,i=t.rootBoundary,a=t.padding,c=t.flipVariations,s=void 0===(t=t.allowedAutoPlacements)?zt:t,u=ke(r),t=u?c?Wt:Wt.filter(function(t){return ke(t)===u}):Nt,l=(r=0===(r=t.filter(function(t){return 0<=s.indexOf(t)})).length?t:r).reduce(function(t,e){return t[e]=Ve(n,{placement:e,boundary:o,rootBoundary:i,padding:a})[ie(e)],t},{}),Object.keys(l).sort(function(t,e){return l[t]-l[e]})):e);var n,r,o,i,a,c,s,u,l;},[]),s=f.rects.reference,u=f.rects.popper,l=new Map,m=!0,g=c[0],b=0;b<c.length;b++){var _=c[b],w=ie(_),O=ke(_)===Rt,k=0<=[E,j].indexOf(w),C=k?"width":"height",S=Ve(f,{placement:_,boundary:p,rootBoundary:h,altBoundary:i,padding:d}),k=k?O?T:A:O?j:E,O=(s[C]>u[C]&&(k=Ae(k)),Ae(k)),C=[];if(r&&C.push(S[w]<=0),o&&C.push(S[k]<=0,S[O]<=0),C.every(function(t){return t})){g=_,m=!1;break}l.set(_,C);}if(m)for(var x=v?3:1;0<x;x--)if("break"===function(e){var t=c.find(function(t){t=l.get(t);if(t)return t.slice(0,e).every(function(t){return t})});if(t)return g=t,"break"}(x))break;f.placement!==g&&(f.modifiersData[t]._skip=!0,f.placement=g,f.reset=!0);}},requiresIfExists:["offset"],data:{_skip:!1}};function We(t,e,n){return {top:t.top-e.height-(n=void 0===n?{x:0,y:0}:n).y,right:t.right-e.width+n.x,bottom:t.bottom-e.height+n.y,left:t.left-e.width-n.x}}function ze(e){return [E,T,j,A].some(function(t){return 0<=e[t]})}var Ue={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(t){var e=t.state,t=t.name,n=e.rects.reference,r=e.rects.popper,o=e.modifiersData.preventOverflow,i=Ve(e,{elementContext:"reference"}),a=Ve(e,{altBoundary:!0}),i=We(i,n),n=We(a,r,o),a=ze(i),r=ze(n);e.modifiersData[t]={referenceClippingOffsets:i,popperEscapeOffsets:n,isReferenceHidden:a,hasPopperEscaped:r},e.attributes.popper=Object.assign({},e.attributes.popper,{"data-popper-reference-hidden":a,"data-popper-escaped":r});}};var qe={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(t){var a=t.state,e=t.options,t=t.name,c=void 0===(e=e.offset)?[0,0]:e,e=zt.reduce(function(t,e){var n,r,o,i;return t[e]=(e=e,n=a.rects,r=c,o=ie(e),i=0<=[A,E].indexOf(o)?-1:1,e=(n="function"==typeof r?r(Object.assign({},n,{placement:e})):r)[0]||0,r=(n[1]||0)*i,0<=[A,T].indexOf(o)?{x:r,y:e}:{x:e,y:r}),t},{}),n=(r=e[a.placement]).x,r=r.y;null!=a.modifiersData.popperOffsets&&(a.modifiersData.popperOffsets.x+=n,a.modifiersData.popperOffsets.y+=r),a.modifiersData[t]=e;}};var Ke={name:"popperOffsets",enabled:!0,phase:"read",fn:function(t){var e=t.state,t=t.name;e.modifiersData[t]=Fe({reference:e.rects.reference,element:e.rects.popper,strategy:"absolute",placement:e.placement});},data:{}};var $e={name:"preventOverflow",enabled:!0,phase:"main",fn:function(t){var e,n,r,o,i,a,c,s,u,l=t.state,f=t.options,t=t.name,d=void 0===(d=f.mainAxis)||d,p=void 0!==(p=f.altAxis)&&p,h=f.boundary,v=f.rootBoundary,y=f.altBoundary,m=f.padding,g=void 0===(g=f.tether)||g,f=void 0===(f=f.tetherOffset)?0:f,h=Ve(l,{boundary:h,rootBoundary:v,padding:m,altBoundary:y}),v=ie(l.placement),y=!(m=ke(l.placement)),b=me(v),_="x"===b?"y":"x",w=l.modifiersData.popperOffsets,O=l.rects.reference,k=l.rects.popper,f="number"==typeof(f="function"==typeof f?f(Object.assign({},l.rects,{placement:l.placement})):f)?{mainAxis:f,altAxis:f}:Object.assign({mainAxis:0,altAxis:0},f),C=l.modifiersData.offset?l.modifiersData.offset[l.placement]:null,S={x:0,y:0};w&&(d&&(d="y"===b?"height":"width",a=(c=w[b])+h[n="y"===b?E:A],s=c-h[u="y"===b?j:T],e=g?-k[d]/2:0,o=(m===Rt?O:k)[d],m=m===Rt?-k[d]:-O[d],i=l.elements.arrow,i=g&&i?le(i):{width:0,height:0},n=(r=l.modifiersData["arrow#persistent"]?l.modifiersData["arrow#persistent"].padding:be())[n],r=r[u],u=ge(0,O[d],i[d]),i=y?O[d]/2-e-u-n-f.mainAxis:o-u-n-f.mainAxis,o=y?-O[d]/2+e+u+r+f.mainAxis:m+u+r+f.mainAxis,y=(n=l.elements.arrow&&ye(l.elements.arrow))?"y"===b?n.clientTop||0:n.clientLeft||0:0,m=c+o-(e=null!=(d=null==C?void 0:C[b])?d:0),u=ge(g?ce(a,c+i-e-y):a,c,g?ae(s,m):s),w[b]=u,S[b]=u-c),p&&(r="y"==_?"height":"width",o=(n=w[_])+h["x"===b?E:A],d=n-h["x"===b?j:T],i=-1!==[E,A].indexOf(v),y=null!=(e=null==C?void 0:C[_])?e:0,a=i?o:n-O[r]-k[r]-y+f.altAxis,m=i?n+O[r]+k[r]-y-f.altAxis:d,c=g&&i?(s=ge(s=a,n,u=m),u<s?u:s):ge(g?a:o,n,g?m:d),w[_]=c,S[_]=c-n),l.modifiersData[t]=S);},requiresIfExists:["offset"]};function Xe(t,e,n){void 0===n&&(n=!1);var r=s(e),o=s(e)&&(a=(o=e).getBoundingClientRect(),i=se(a.width)/o.offsetWidth||1,a=se(a.height)/o.offsetHeight||1,1!==i||1!==a),i=pe(e),a=ue(t,o),t={scrollLeft:0,scrollTop:0},c={x:0,y:0};return !r&&n||("body"===ee(e)&&!Le(i)||(t=(r=e)!==b(r)&&s(r)?{scrollLeft:r.scrollLeft,scrollTop:r.scrollTop}:Me(r)),s(e)?((c=ue(e,!0)).x+=e.clientLeft,c.y+=e.clientTop):i&&(c.x=Ie(i))),{x:a.left+t.scrollLeft-c.x,y:a.top+t.scrollTop-c.y,width:a.width,height:a.height}}function Ge(t){var n=new Map,r=new Set,o=[];return t.forEach(function(t){n.set(t.name,t);}),t.forEach(function(t){r.has(t.name)||!function e(t){r.add(t.name),[].concat(t.requires||[],t.requiresIfExists||[]).forEach(function(t){r.has(t)||(t=n.get(t))&&e(t);}),o.push(t);}(t);}),o}var Qe={placement:"bottom",modifiers:[],strategy:"absolute"};function Ze(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return !e.some(function(t){return !(t&&"function"==typeof t.getBoundingClientRect)})}function Je(t){var t=t=void 0===t?{}:t,e=t.defaultModifiers,f=void 0===e?[]:e,e=t.defaultOptions,d=void 0===e?Qe:e;return function(r,o,e){void 0===e&&(e=d);var n,i,a={placement:"bottom",orderedModifiers:[],options:Object.assign({},Qe,d),modifiersData:{},elements:{reference:r,popper:o},attributes:{},styles:{}},c=[],s=!1,u={state:a,setOptions:function(t){var n,e,t="function"==typeof t?t(a.options):t,t=(l(),a.options=Object.assign({},d,a.options,t),a.scrollParents={reference:ne(r)?Ne(r):r.contextElement?Ne(r.contextElement):[],popper:Ne(o)},t=[].concat(f,a.options.modifiers),e=t.reduce(function(t,e){var n=t[e.name];return t[e.name]=n?Object.assign({},n,e,{options:Object.assign({},n.options,e.options),data:Object.assign({},n.data,e.data)}):e,t},{}),t=Object.keys(e).map(function(t){return e[t]}),n=Ge(t),te.reduce(function(t,e){return t.concat(n.filter(function(t){return t.phase===e}))},[]));return a.orderedModifiers=t.filter(function(t){return t.enabled}),a.orderedModifiers.forEach(function(t){var e=t.name,n=t.options,t=t.effect;"function"==typeof t&&(t=t({state:a,name:e,instance:u,options:void 0===n?{}:n}),c.push(t||function(){}));}),u.update()},forceUpdate:function(){if(!s){var t=a.elements,e=t.reference,t=t.popper;if(Ze(e,t)){a.rects={reference:Xe(e,ye(t),"fixed"===a.options.strategy),popper:le(t)},a.reset=!1,a.placement=a.options.placement,a.orderedModifiers.forEach(function(t){return a.modifiersData[t.name]=Object.assign({},t.data)});for(var n,r,o,i=0;i<a.orderedModifiers.length;i++)!0===a.reset?(a.reset=!1,i=-1):(n=(o=a.orderedModifiers[i]).fn,r=o.options,o=o.name,"function"==typeof n&&(a=n({state:a,options:void 0===r?{}:r,name:o,instance:u})||a));}}},update:(n=function(){return new Promise(function(t){u.forceUpdate(),t(a);})},function(){return i=i||new Promise(function(t){Promise.resolve().then(function(){i=void 0,t(n());});})}),destroy:function(){l(),s=!0;}};return Ze(r,o)&&u.setOptions(e).then(function(t){!s&&e.onFirstUpdate&&e.onFirstUpdate(t);}),u;function l(){c.forEach(function(t){return t()}),c=[];}}}var tn=Je(),en=Je({defaultModifiers:[je,Ke,xe,oe,qe,Ye,$e,Oe,Ue]}),nn=Je({defaultModifiers:[je,Ke,xe,oe]});function rn(t){return "true"===t||"false"!==t&&(t===Number(t).toString()?Number(t):""===t||"null"===t?null:t)}function on(t){return t.replace(/[A-Z]/g,function(t){return "-".concat(t.toLowerCase())})}var f={setDataAttribute:function(t,e,n){t.setAttribute("data-bs-".concat(on(e)),n);},removeDataAttribute:function(t,e){t.removeAttribute("data-bs-".concat(on(e)));},getDataAttributes:function(n){if(!n)return {};var r={};return Object.keys(n.dataset).filter(function(t){return t.startsWith("bs")}).forEach(function(t){var e=(e=t.replace(/^bs/,"")).charAt(0).toLowerCase()+e.slice(1,e.length);r[e]=rn(n.dataset[t]);}),r},getDataAttribute:function(t,e){return rn(t.getAttribute("data-bs-".concat(on(e))))},offset:function(t){t=t.getBoundingClientRect();return {top:t.top+window.pageYOffset,left:t.left+window.pageXOffset}},position:function(t){return {top:t.offsetTop,left:t.offsetLeft}}};t(95);function an(t){return function(t){if(Array.isArray(t))return cn(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||function(t,e){if(t){if("string"==typeof t)return cn(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?cn(t,e):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function cn(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}var p={find:function(t){var e,n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:document.documentElement;return (e=[]).concat.apply(e,an(Element.prototype.querySelectorAll.call(n,t)))},findOne:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:document.documentElement;return Element.prototype.querySelector.call(e,t)},children:function(t,e){var n;return (n=[]).concat.apply(n,an(t.children)).filter(function(t){return t.matches(e)})},parents:function(t,e){for(var n=[],r=t.parentNode;r&&r.nodeType===Node.ELEMENT_NODE&&3!==r.nodeType;)r.matches(e)&&n.push(r),r=r.parentNode;return n},prev:function(t,e){for(var n=t.previousElementSibling;n;){if(n.matches(e))return [n];n=n.previousElementSibling;}return []},next:function(t,e){for(var n=t.nextElementSibling;n;){if(n.matches(e))return [n];n=n.nextElementSibling;}return []},focusableChildren:function(t){var e=["a","button","input","textarea","select","details","[tabindex]",'[contenteditable="true"]'].map(function(t){return "".concat(t,':not([tabindex^="-"])')}).join(", ");return this.find(e,t).filter(function(t){return !U(t)&&z(t)})}};function sn(t){return (sn="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function un(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function ln(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?un(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):un(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function fn(t){return function(t){if(Array.isArray(t))return dn(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||function(t,e){if(t){if("string"==typeof t)return dn(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?dn(t,e):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function dn(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function pn(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function hn(){return (hn="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=mn(t)););return t}(t,e);if(r)return r=Object.getOwnPropertyDescriptor(r,e),r.get?r.get.call(arguments.length<3?t:n):r.value}).apply(this,arguments)}function vn(t,e){return (vn=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function yn(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=mn(n),e=(t=r?(t=mn(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===sn(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function mn(t){return (mn=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var gn="dropdown",n=".".concat("bs.dropdown"),bn=".data-api",_n="Escape",wn="ArrowUp",On="ArrowDown",kn=new RegExp("".concat(wn,"|").concat(On,"|").concat(_n)),Cn="hide".concat(n),Sn="hidden".concat(n),xn="show".concat(n),En="shown".concat(n),jn="click".concat(n).concat(bn),r="keydown".concat(n).concat(bn),n="keyup".concat(n).concat(bn),Tn="show",An='[data-bs-toggle="dropdown"]',Dn=".dropdown-menu",Pn=a()?"top-end":"top-start",Mn=a()?"top-start":"top-end",In=a()?"bottom-end":"bottom-start",Ln=a()?"bottom-start":"bottom-end",Nn=a()?"left-start":"right-start",Rn=a()?"right-start":"left-start",Bn={offset:[0,2],boundary:"clippingParents",reference:"toggle",display:"dynamic",popperConfig:null,autoClose:!0},Hn={offset:"(array|string|function)",boundary:"(string|element)",reference:"(string|element|object)",display:"string",popperConfig:"(null|object|function)",autoClose:"(boolean|string)"},Fn=function(){var t=s,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&vn(t,e);var n,r=yn(s);function s(t,e){if(this instanceof s)return (t=r.call(this,t))._popper=null,t._config=t._getConfig(e),t._menu=t._getMenuElement(),t._inNavbar=t._detectNavbar(),t;throw new TypeError("Cannot call a class as a function")}return t=s,e=[{key:"Default",get:function(){return Bn}},{key:"DefaultType",get:function(){return Hn}},{key:"NAME",get:function(){return gn}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t=s.getOrCreateInstance(this,e);if("string"==typeof e){if(void 0===t[e])throw new TypeError('No method named "'.concat(e,'"'));t[e]();}})}},{key:"clearMenus",value:function(t){if(!t||2!==t.button&&("keyup"!==t.type||"Tab"===t.key))for(var e=p.find(An),n=0,r=e.length;n<r;n++){var o=s.getInstance(e[n]);if(o&&!1!==o._config.autoClose&&o._isShown()){var i={relatedTarget:o._element};if(t){var a=t.composedPath(),c=a.includes(o._menu);if(a.includes(o._element)||"inside"===o._config.autoClose&&!c||"outside"===o._config.autoClose&&c)continue;if(o._menu.contains(t.target)&&("keyup"===t.type&&"Tab"===t.key||/input|select|option|textarea|form/i.test(t.target.tagName)))continue;"click"===t.type&&(i.clickEvent=t);}o._completeHide(i);}}}},{key:"getParentFromElement",value:function(t){return F(t)||t.parentNode}},{key:"dataApiKeydownHandler",value:function(t){if(/input|textarea/i.test(t.target.tagName)?!("Space"===t.key||t.key!==_n&&(t.key!==On&&t.key!==wn||t.target.closest(Dn))):kn.test(t.key)){var e=this.classList.contains(Tn);if((e||t.key!==_n)&&(t.preventDefault(),t.stopPropagation(),!U(this))){var n=this.matches(An)?this:p.prev(this,An)[0],n=s.getOrCreateInstance(n);if(t.key!==_n)return t.key===wn||t.key===On?(e||n.show(),void n._selectMenuItem(t)):void(e&&"Space"!==t.key||s.clearMenus());n.hide();}}}}],(n=[{key:"toggle",value:function(){return this._isShown()?this.hide():this.show()}},{key:"show",value:function(){var t,e;U(this._element)||this._isShown(this._menu)||(t={relatedTarget:this._element},d.trigger(this._element,xn,t).defaultPrevented||(e=s.getParentFromElement(this._element),this._inNavbar?f.setDataAttribute(this._menu,"popper","none"):this._createPopper(e),"ontouchstart"in document.documentElement&&!e.closest(".navbar-nav")&&(e=[]).concat.apply(e,fn(document.body.children)).forEach(function(t){return d.on(t,"mouseover",K)}),this._element.focus(),this._element.setAttribute("aria-expanded",!0),this._menu.classList.add(Tn),this._element.classList.add(Tn),d.trigger(this._element,En,t)));}},{key:"hide",value:function(){var t;!U(this._element)&&this._isShown(this._menu)&&(t={relatedTarget:this._element},this._completeHide(t));}},{key:"dispose",value:function(){this._popper&&this._popper.destroy(),hn(mn(s.prototype),"dispose",this).call(this);}},{key:"update",value:function(){this._inNavbar=this._detectNavbar(),this._popper&&this._popper.update();}},{key:"_completeHide",value:function(t){var e;d.trigger(this._element,Cn,t).defaultPrevented||("ontouchstart"in document.documentElement&&(e=[]).concat.apply(e,fn(document.body.children)).forEach(function(t){return d.off(t,"mouseover",K)}),this._popper&&this._popper.destroy(),this._menu.classList.remove(Tn),this._element.classList.remove(Tn),this._element.setAttribute("aria-expanded","false"),f.removeDataAttribute(this._menu,"popper"),d.trigger(this._element,Sn,t));}},{key:"_getConfig",value:function(t){if(t=ln(ln(ln({},this.constructor.Default),f.getDataAttributes(this._element)),t),W(gn,t,this.constructor.DefaultType),"object"!==sn(t.reference)||nt(t.reference)||"function"==typeof t.reference.getBoundingClientRect)return t;throw new TypeError("".concat(gn.toUpperCase(),': Option "reference" provided type "object" without a required "getBoundingClientRect" method.'))}},{key:"_createPopper",value:function(t){if(void 0===i)throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org)");var e=this._element,t=("parent"===this._config.reference?e=t:nt(this._config.reference)?e=Y(this._config.reference):"object"===sn(this._config.reference)&&(e=this._config.reference),this._getPopperConfig()),n=t.modifiers.find(function(t){return "applyStyles"===t.name&&!1===t.enabled});this._popper=en(e,this._menu,t),n&&f.setDataAttribute(this._menu,"popper","static");}},{key:"_isShown",value:function(){return (0<arguments.length&&void 0!==arguments[0]?arguments[0]:this._element).classList.contains(Tn)}},{key:"_getMenuElement",value:function(){return p.next(this._element,Dn)[0]}},{key:"_getPlacement",value:function(){var t=this._element.parentNode;if(t.classList.contains("dropend"))return Nn;if(t.classList.contains("dropstart"))return Rn;var e="end"===getComputedStyle(this._menu).getPropertyValue("--bs-position").trim();return t.classList.contains("dropup")?e?Mn:Pn:e?Ln:In}},{key:"_detectNavbar",value:function(){return null!==this._element.closest(".".concat("navbar"))}},{key:"_getOffset",value:function(){var e=this,n=this._config.offset;return "string"==typeof n?n.split(",").map(function(t){return Number.parseInt(t,10)}):"function"==typeof n?function(t){return n(t,e._element)}:n}},{key:"_getPopperConfig",value:function(){var t={placement:this._getPlacement(),modifiers:[{name:"preventOverflow",options:{boundary:this._config.boundary}},{name:"offset",options:{offset:this._getOffset()}}]};return "static"===this._config.display&&(t.modifiers=[{name:"applyStyles",enabled:!1}]),ln(ln({},t),"function"==typeof this._config.popperConfig?this._config.popperConfig(t):this._config.popperConfig)}},{key:"_selectMenuItem",value:function(t){var e=t.key,t=t.target,n=p.find(".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)",this._menu).filter(z);n.length&&Z(n,t,e===On,!n.includes(t)).focus();}}])&&pn(t.prototype,n),e&&pn(t,e),Object.defineProperty(t,"prototype",{writable:!1}),s}(),bn=(d.on(document,r,An,Fn.dataApiKeydownHandler),d.on(document,r,Dn,Fn.dataApiKeydownHandler),d.on(document,jn,Fn.clearMenus),d.on(document,n,Fn.clearMenus),d.on(document,jn,An,function(t){t.preventDefault(),Fn.getOrCreateInstance(this).toggle();}),e(Fn),Fn);function Vn(t){return (Vn="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Yn(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function Wn(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?Yn(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):Yn(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function zn(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function Un(t,e){return (Un=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function qn(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=Kn(n),e=(t=r?(t=Kn(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===Vn(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function Kn(t){return (Kn=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var $n="collapse",Xn="bs.collapse",r=".".concat(Xn),Gn={toggle:!0,parent:null},Qn={toggle:"boolean",parent:"(null|element)"},Zn="show".concat(r),Jn="shown".concat(r),tr="hide".concat(r),er="hidden".concat(r),n="click".concat(r).concat(".data-api"),nr="show",rr="collapse",or="collapsing",ir="collapsed",ar=":scope .".concat(rr," .").concat(rr),cr='[data-bs-toggle="collapse"]',sr=function(){var t=l,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&Un(t,e);var n,u=qn(l);function l(t,e){var n;if(!(this instanceof l))throw new TypeError("Cannot call a class as a function");(n=u.call(this,t))._isTransitioning=!1,n._config=n._getConfig(e),n._triggerArray=[];for(var r=p.find(cr),o=0,i=r.length;o<i;o++){var a=r[o],c=H(a),s=p.find(c).filter(function(t){return t===n._element});null!==c&&s.length&&(n._selector=c,n._triggerArray.push(a));}return n._initializeChildren(),n._config.parent||n._addAriaAndCollapsedClass(n._triggerArray,n._isShown()),n._config.toggle&&n.toggle(),n}return t=l,e=[{key:"Default",get:function(){return Gn}},{key:"NAME",get:function(){return $n}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t={},t=("string"==typeof e&&/show|hide/.test(e)&&(t.toggle=!1),l.getOrCreateInstance(this,t));if("string"==typeof e){if(void 0===t[e])throw new TypeError('No method named "'.concat(e,'"'));t[e]();}})}}],(n=[{key:"toggle",value:function(){this._isShown()?this.hide():this.show();}},{key:"show",value:function(){var t=this;if(!this._isTransitioning&&!this._isShown()){var e,n,r=[],o=(this._config.parent&&(e=p.find(ar,this._config.parent),r=p.find(".collapse.show, .collapse.collapsing",this._config.parent).filter(function(t){return !e.includes(t)})),p.findOne(this._selector));if(r.length){var i,a=r.find(function(t){return o!==t});if((i=a?l.getInstance(a):null)&&i._isTransitioning)return}d.trigger(this._element,Zn).defaultPrevented||(r.forEach(function(t){o!==t&&l.getOrCreateInstance(t,{toggle:!1}).hide(),i||kt(t,Xn,null);}),n=this._getDimension(),this._element.classList.remove(rr),this._element.classList.add(or),this._element.style[n]=0,this._addAriaAndCollapsedClass(this._triggerArray,!0),this._isTransitioning=!0,a=n[0].toUpperCase()+n.slice(1),r="scroll".concat(a),this._queueCallback(function(){t._isTransitioning=!1,t._element.classList.remove(or),t._element.classList.add(rr,nr),t._element.style[n]="",d.trigger(t._element,Jn);},this._element,!0),this._element.style[n]="".concat(this._element[r],"px"));}}},{key:"hide",value:function(){var t=this;if(!this._isTransitioning&&this._isShown()){var e=d.trigger(this._element,tr);if(!e.defaultPrevented){for(var e=this._getDimension(),n=(this._element.style[e]="".concat(this._element.getBoundingClientRect()[e],"px"),$(this._element),this._element.classList.add(or),this._element.classList.remove(rr,nr),this._triggerArray.length),r=0;r<n;r++){var o=this._triggerArray[r],i=F(o);i&&!this._isShown(i)&&this._addAriaAndCollapsedClass([o],!1);}this._isTransitioning=!0;this._element.style[e]="",this._queueCallback(function(){t._isTransitioning=!1,t._element.classList.remove(or),t._element.classList.add(rr),d.trigger(t._element,er);},this._element,!0);}}}},{key:"_isShown",value:function(){return (0<arguments.length&&void 0!==arguments[0]?arguments[0]:this._element).classList.contains(nr)}},{key:"_getConfig",value:function(t){return (t=Wn(Wn(Wn({},Gn),f.getDataAttributes(this._element)),t)).toggle=Boolean(t.toggle),t.parent=Y(t.parent),W($n,t,Qn),t}},{key:"_getDimension",value:function(){return this._element.classList.contains("collapse-horizontal")?"width":"height"}},{key:"_initializeChildren",value:function(){var e,n=this;this._config.parent&&(e=p.find(ar,this._config.parent),p.find(cr,this._config.parent).filter(function(t){return !e.includes(t)}).forEach(function(t){var e=F(t);e&&n._addAriaAndCollapsedClass([t],n._isShown(e));}));}},{key:"_addAriaAndCollapsedClass",value:function(t,e){t.length&&t.forEach(function(t){e?t.classList.remove(ir):t.classList.add(ir),t.setAttribute("aria-expanded",e);});}}])&&zn(t.prototype,n),e&&zn(t,e),Object.defineProperty(t,"prototype",{writable:!1}),l}(),jn=(d.on(document,n,cr,function(t){("A"===t.target.tagName||t.delegateTarget&&"A"===t.delegateTarget.tagName)&&t.preventDefault();t=H(this);p.find(t).forEach(function(t){sr.getOrCreateInstance(t,{toggle:!1}).toggle();});}),e(sr),sr);function ur(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}var lr=".fixed-top, .fixed-bottom, .is-fixed, .sticky-top",fr=".sticky-top",dr=function(){function t(){if(!(this instanceof t))throw new TypeError("Cannot call a class as a function");this._element=document.body;}var e,n;return e=t,(n=[{key:"getWidth",value:function(){var t=document.documentElement.clientWidth;return Math.abs(window.innerWidth-t)}},{key:"hide",value:function(){var e=this.getWidth();this._disableOverFlow(),this._setElementAttributes(this._element,"paddingRight",function(t){return t+e}),this._setElementAttributes(lr,"paddingRight",function(t){return t+e}),this._setElementAttributes(fr,"marginRight",function(t){return t-e});}},{key:"_disableOverFlow",value:function(){this._saveInitialAttribute(this._element,"overflow"),this._element.style.overflow="hidden";}},{key:"_setElementAttributes",value:function(t,n,r){var o=this,i=this.getWidth();this._applyManipulationCallback(t,function(t){var e;t!==o._element&&window.innerWidth>t.clientWidth+i||(o._saveInitialAttribute(t,n),e=window.getComputedStyle(t)[n],t.style[n]="".concat(r(Number.parseFloat(e)),"px"));});}},{key:"reset",value:function(){this._resetElementAttributes(this._element,"overflow"),this._resetElementAttributes(this._element,"paddingRight"),this._resetElementAttributes(lr,"paddingRight"),this._resetElementAttributes(fr,"marginRight");}},{key:"_saveInitialAttribute",value:function(t,e){var n=t.style[e];n&&f.setDataAttribute(t,e,n);}},{key:"_resetElementAttributes",value:function(t,n){this._applyManipulationCallback(t,function(t){var e=f.getDataAttribute(t,n);void 0===e?t.style.removeProperty(n):(f.removeDataAttribute(t,n),t.style[n]=e);});}},{key:"_applyManipulationCallback",value:function(t,e){nt(t)?e(t):p.find(t,this._element).forEach(e);}},{key:"isOverflowing",value:function(){return 0<this.getWidth()}}])&&ur(e.prototype,n),Object.defineProperty(e,"prototype",{writable:!1}),t}();function pr(t){return (pr="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function hr(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function vr(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?hr(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):hr(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function yr(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}var mr={className:"modal-backdrop",isVisible:!0,isAnimated:!1,rootElement:"body",clickCallback:null},gr={className:"string",isVisible:"boolean",isAnimated:"boolean",rootElement:"(element|string)",clickCallback:"(function|null)"},br="backdrop",_r="mousedown.bs.".concat(br),wr=function(){function e(t){if(!(this instanceof e))throw new TypeError("Cannot call a class as a function");this._config=this._getConfig(t),this._isAppended=!1,this._element=null;}var t,n;return t=e,(n=[{key:"show",value:function(t){this._config.isVisible?(this._append(),this._config.isAnimated&&$(this._getElement()),this._getElement().classList.add("show"),this._emulateAnimation(function(){G(t);})):G(t);}},{key:"hide",value:function(t){var e=this;this._config.isVisible?(this._getElement().classList.remove("show"),this._emulateAnimation(function(){e.dispose(),G(t);})):G(t);}},{key:"_getElement",value:function(){var t;return this._element||((t=document.createElement("div")).className=this._config.className,this._config.isAnimated&&t.classList.add("fade"),this._element=t),this._element}},{key:"_getConfig",value:function(t){return (t=vr(vr({},mr),"object"===pr(t)?t:{})).rootElement=Y(t.rootElement),W(br,t,gr),t}},{key:"_append",value:function(){var t=this;this._isAppended||(this._config.rootElement.append(this._getElement()),d.on(this._getElement(),_r,function(){G(t._config.clickCallback);}),this._isAppended=!0);}},{key:"dispose",value:function(){this._isAppended&&(d.off(this._element,_r),this._element.remove(),this._isAppended=!1);}},{key:"_emulateAnimation",value:function(t){Q(t,this._getElement(),this._config.isAnimated);}}])&&yr(t.prototype,n),Object.defineProperty(t,"prototype",{writable:!1}),e}();function Or(t){return (Or="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function kr(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function Cr(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?kr(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):kr(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function Sr(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function xr(e){var n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"hide",t="click.dismiss".concat(e.EVENT_KEY),r=e.NAME;d.on(document,t,'[data-bs-dismiss="'.concat(r,'"]'),function(t){["A","AREA"].includes(this.tagName)&&t.preventDefault(),U(this)||(t=F(this)||this.closest(".".concat(r)),e.getOrCreateInstance(t)[n]());});}var Er={trapElement:null,autofocus:!0},jr={trapElement:"element",autofocus:"boolean"},Tr=".".concat("bs.focustrap"),Ar="focusin".concat(Tr),Dr="keydown.tab".concat(Tr),Pr="backward",Mr=function(){function e(t){if(!(this instanceof e))throw new TypeError("Cannot call a class as a function");this._config=this._getConfig(t),this._isActive=!1,this._lastTabNavDirection=null;}var t,n;return t=e,(n=[{key:"activate",value:function(){var e=this,t=this._config,n=t.trapElement,t=t.autofocus;this._isActive||(t&&n.focus(),d.off(document,Tr),d.on(document,Ar,function(t){return e._handleFocusin(t)}),d.on(document,Dr,function(t){return e._handleKeydown(t)}),this._isActive=!0);}},{key:"deactivate",value:function(){this._isActive&&(this._isActive=!1,d.off(document,Tr));}},{key:"_handleFocusin",value:function(t){var t=t.target,e=this._config.trapElement;t===document||t===e||e.contains(t)||(0===(t=p.focusableChildren(e)).length?e:this._lastTabNavDirection===Pr?t[t.length-1]:t[0]).focus();}},{key:"_handleKeydown",value:function(t){"Tab"===t.key&&(this._lastTabNavDirection=t.shiftKey?Pr:"forward");}},{key:"_getConfig",value:function(t){return t=Cr(Cr({},Er),"object"===Or(t)?t:{}),W("focustrap",t,jr),t}}])&&Sr(t.prototype,n),Object.defineProperty(t,"prototype",{writable:!1}),e}();function Ir(t){return (Ir="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Lr(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function Nr(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?Lr(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):Lr(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function Rr(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function Br(){return (Br="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=Vr(t)););return t}(t,e);if(r)return r=Object.getOwnPropertyDescriptor(r,e),r.get?r.get.call(arguments.length<3?t:n):r.value}).apply(this,arguments)}function Hr(t,e){return (Hr=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function Fr(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=Vr(n),e=(t=r?(t=Vr(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===Ir(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function Vr(t){return (Vr=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var Yr="offcanvas",r=".".concat("bs.offcanvas"),n=".data-api",o="load".concat(r).concat(n),Wr={backdrop:!0,keyboard:!0,scroll:!1},zr={backdrop:"boolean",keyboard:"boolean",scroll:"boolean"},Ur=".offcanvas.show",qr="show".concat(r),Kr="shown".concat(r),$r="hide".concat(r),Xr="hidden".concat(r),n="click".concat(r).concat(n),Gr="keydown.dismiss".concat(r),Qr=function(){var t=o,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&Hr(t,e);var n,r=Fr(o);function o(t,e){if(this instanceof o)return (t=r.call(this,t))._config=t._getConfig(e),t._isShown=!1,t._backdrop=t._initializeBackDrop(),t._focustrap=t._initializeFocusTrap(),t._addEventListeners(),t;throw new TypeError("Cannot call a class as a function")}return t=o,e=[{key:"NAME",get:function(){return Yr}},{key:"Default",get:function(){return Wr}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t=o.getOrCreateInstance(this,e);if("string"==typeof e){if(void 0===t[e]||e.startsWith("_")||"constructor"===e)throw new TypeError('No method named "'.concat(e,'"'));t[e](this);}})}}],(n=[{key:"toggle",value:function(t){return this._isShown?this.hide():this.show(t)}},{key:"show",value:function(t){var e=this;this._isShown||d.trigger(this._element,qr,{relatedTarget:t}).defaultPrevented||(this._isShown=!0,this._element.style.visibility="visible",this._backdrop.show(),this._config.scroll||(new dr).hide(),this._element.removeAttribute("aria-hidden"),this._element.setAttribute("aria-modal",!0),this._element.setAttribute("role","dialog"),this._element.classList.add("show"),this._queueCallback(function(){e._config.scroll||e._focustrap.activate(),d.trigger(e._element,Kr,{relatedTarget:t});},this._element,!0));}},{key:"hide",value:function(){var t=this;this._isShown&&!d.trigger(this._element,$r).defaultPrevented&&(this._focustrap.deactivate(),this._element.blur(),this._isShown=!1,this._element.classList.remove("show"),this._backdrop.hide(),this._queueCallback(function(){t._element.setAttribute("aria-hidden",!0),t._element.removeAttribute("aria-modal"),t._element.removeAttribute("role"),t._element.style.visibility="hidden",t._config.scroll||(new dr).reset(),d.trigger(t._element,Xr);},this._element,!0));}},{key:"dispose",value:function(){this._backdrop.dispose(),this._focustrap.deactivate(),Br(Vr(o.prototype),"dispose",this).call(this);}},{key:"_getConfig",value:function(t){return t=Nr(Nr(Nr({},Wr),f.getDataAttributes(this._element)),"object"===Ir(t)?t:{}),W(Yr,t,zr),t}},{key:"_initializeBackDrop",value:function(){var t=this;return new wr({className:"offcanvas-backdrop",isVisible:this._config.backdrop,isAnimated:!0,rootElement:this._element.parentNode,clickCallback:function(){return t.hide()}})}},{key:"_initializeFocusTrap",value:function(){return new Mr({trapElement:this._element})}},{key:"_addEventListeners",value:function(){var e=this;d.on(this._element,Gr,function(t){e._config.keyboard&&"Escape"===t.key&&e.hide();});}}])&&Rr(t.prototype,n),e&&Rr(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),r=(d.on(document,n,'[data-bs-toggle="offcanvas"]',function(t){var e=this,n=F(this);["A","AREA"].includes(this.tagName)&&t.preventDefault(),U(this)||(d.one(n,Xr,function(){z(e)&&e.focus();}),(t=p.findOne(Ur))&&t!==n&&Qr.getInstance(t).hide(),Qr.getOrCreateInstance(n).toggle(this));}),d.on(window,o,function(){return p.find(Ur).forEach(function(t){return Qr.getOrCreateInstance(t).show()})}),xr(Qr),e(Qr),Qr);function Zr(t){return (Zr="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Jr(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function to(t,e){return (to=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function eo(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=no(n),e=(t=r?(t=no(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===Zr(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function no(t){return (no=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var n=".".concat("bs.alert"),ro="close".concat(n),oo="closed".concat(n),o=function(){var t=o,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&to(t,e);var n,r=eo(o);function o(){var t=this,e=o;if(t instanceof e)return r.apply(this,arguments);throw new TypeError("Cannot call a class as a function")}return t=o,e=[{key:"NAME",get:function(){return "alert"}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t=o.getOrCreateInstance(this);if("string"==typeof e){if(void 0===t[e]||e.startsWith("_")||"constructor"===e)throw new TypeError('No method named "'.concat(e,'"'));t[e](this);}})}}],(n=[{key:"close",value:function(){var t,e=this;d.trigger(this._element,ro).defaultPrevented||(this._element.classList.remove("show"),t=this._element.classList.contains("fade"),this._queueCallback(function(){return e._destroyElement()},this._element,t));}},{key:"_destroyElement",value:function(){this._element.remove(),d.trigger(this._element,oo),this.dispose();}}])&&Jr(t.prototype,n),e&&Jr(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),n=(xr(o,"close"),e(o),o);function io(t){return (io="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function ao(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function co(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?ao(Object(n),!0).forEach(function(t){po(e,t,n[t]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ao(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t));});}return e}function so(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function uo(t,e){return (uo=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function lo(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=fo(n),e=(t=r?(t=fo(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===io(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function fo(t){return (fo=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function po(t,e,n){e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n;}var ho="carousel",o=".".concat("bs.carousel"),vo=".data-api",yo={interval:5e3,keyboard:!0,slide:!1,pause:"hover",wrap:!0,touch:!0},mo={interval:"(number|boolean)",keyboard:"boolean",slide:"(boolean|string)",pause:"(string|boolean)",wrap:"boolean",touch:"boolean"},go="next",bo="prev",_o="left",wo="right",Oo=(po(Io={},"ArrowLeft",wo),po(Io,"ArrowRight",_o),Io),ko="slide".concat(o),Co="slid".concat(o),So="keydown".concat(o),xo="mouseenter".concat(o),Eo="mouseleave".concat(o),jo="touchstart".concat(o),To="touchmove".concat(o),Ao="touchend".concat(o),Do="pointerdown".concat(o),Po="pointerup".concat(o),Mo="dragstart".concat(o),Io="load".concat(o).concat(vo),o="click".concat(o).concat(vo),Lo="active",No=".active.carousel-item",Ro=function(){var t=o,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&uo(t,e);var n,r=lo(o);function o(t,e){if(this instanceof o)return (t=r.call(this,t))._items=null,t._interval=null,t._activeElement=null,t._isPaused=!1,t._isSliding=!1,t.touchTimeout=null,t.touchStartX=0,t.touchDeltaX=0,t._config=t._getConfig(e),t._indicatorsElement=p.findOne(".carousel-indicators",t._element),t._touchSupported="ontouchstart"in document.documentElement||0<navigator.maxTouchPoints,t._pointerEvent=Boolean(window.PointerEvent),t._addEventListeners(),t;throw new TypeError("Cannot call a class as a function")}return t=o,e=[{key:"Default",get:function(){return yo}},{key:"NAME",get:function(){return ho}},{key:"carouselInterface",value:function(t,e){var t=o.getOrCreateInstance(t,e),n=t._config,r=("object"===io(e)&&(n=co(co({},n),e)),"string"==typeof e?e:n.slide);if("number"==typeof e)t.to(e);else if("string"==typeof r){if(void 0===t[r])throw new TypeError('No method named "'.concat(r,'"'));t[r]();}else n.interval&&n.ride&&(t.pause(),t.cycle());}},{key:"jQueryInterface",value:function(t){return this.each(function(){o.carouselInterface(this,t);})}},{key:"dataApiClickHandler",value:function(t){var e,n,r=F(this);r&&r.classList.contains("carousel")&&(e=co(co({},f.getDataAttributes(r)),f.getDataAttributes(this)),(n=this.getAttribute("data-bs-slide-to"))&&(e.interval=!1),o.carouselInterface(r,e),n&&o.getInstance(r).to(n),t.preventDefault());}}],(n=[{key:"next",value:function(){this._slide(go);}},{key:"nextWhenVisible",value:function(){!document.hidden&&z(this._element)&&this.next();}},{key:"prev",value:function(){this._slide(bo);}},{key:"pause",value:function(t){t||(this._isPaused=!0),p.findOne(".carousel-item-next, .carousel-item-prev",this._element)&&(V(this._element),this.cycle(!0)),clearInterval(this._interval),this._interval=null;}},{key:"cycle",value:function(t){t||(this._isPaused=!1),this._interval&&(clearInterval(this._interval),this._interval=null),this._config&&this._config.interval&&!this._isPaused&&(this._updateInterval(),this._interval=setInterval((document.visibilityState?this.nextWhenVisible:this.next).bind(this),this._config.interval));}},{key:"to",value:function(t){var e=this,n=(this._activeElement=p.findOne(No,this._element),this._getItemIndex(this._activeElement));if(!(t>this._items.length-1||t<0))if(this._isSliding)d.one(this._element,Co,function(){return e.to(t)});else {if(n===t)return this.pause(),void this.cycle();this._slide(n<t?go:bo,this._items[t]);}}},{key:"_getConfig",value:function(t){return t=co(co(co({},yo),f.getDataAttributes(this._element)),"object"===io(t)?t:{}),W(ho,t,mo),t}},{key:"_handleSwipe",value:function(){var t=Math.abs(this.touchDeltaX);t<=40||(t=t/this.touchDeltaX,this.touchDeltaX=0,t&&this._slide(0<t?wo:_o));}},{key:"_addEventListeners",value:function(){var e=this;this._config.keyboard&&d.on(this._element,So,function(t){return e._keydown(t)}),"hover"===this._config.pause&&(d.on(this._element,xo,function(t){return e.pause(t)}),d.on(this._element,Eo,function(t){return e.cycle(t)})),this._config.touch&&this._touchSupported&&this._addTouchEventListeners();}},{key:"_addTouchEventListeners",value:function(){function t(t){r(t)?n.touchStartX=t.clientX:n._pointerEvent||(n.touchStartX=t.touches[0].clientX);}function e(t){r(t)&&(n.touchDeltaX=t.clientX-n.touchStartX),n._handleSwipe(),"hover"===n._config.pause&&(n.pause(),n.touchTimeout&&clearTimeout(n.touchTimeout),n.touchTimeout=setTimeout(function(t){return n.cycle(t)},500+n._config.interval));}var n=this,r=function(t){return n._pointerEvent&&("pen"===t.pointerType||"touch"===t.pointerType)};p.find(".carousel-item img",this._element).forEach(function(t){d.on(t,Mo,function(t){return t.preventDefault()});}),this._pointerEvent?(d.on(this._element,Do,t),d.on(this._element,Po,e),this._element.classList.add("pointer-event")):(d.on(this._element,jo,t),d.on(this._element,To,function(t){t=t,n.touchDeltaX=t.touches&&1<t.touches.length?0:t.touches[0].clientX-n.touchStartX;}),d.on(this._element,Ao,e));}},{key:"_keydown",value:function(t){var e;/input|textarea/i.test(t.target.tagName)||(e=Oo[t.key])&&(t.preventDefault(),this._slide(e));}},{key:"_getItemIndex",value:function(t){return this._items=t&&t.parentNode?p.find(".carousel-item",t.parentNode):[],this._items.indexOf(t)}},{key:"_getItemByOrder",value:function(t,e){return Z(this._items,e,t===go,this._config.wrap)}},{key:"_triggerSlideEvent",value:function(t,e){var n=this._getItemIndex(t),r=this._getItemIndex(p.findOne(No,this._element));return d.trigger(this._element,ko,{relatedTarget:t,direction:e,from:r,to:n})}},{key:"_setActiveIndicatorElement",value:function(t){if(this._indicatorsElement)for(var e=p.findOne(".active",this._indicatorsElement),n=(e.classList.remove(Lo),e.removeAttribute("aria-current"),p.find("[data-bs-target]",this._indicatorsElement)),r=0;r<n.length;r++)if(Number.parseInt(n[r].getAttribute("data-bs-slide-to"),10)===this._getItemIndex(t)){n[r].classList.add(Lo),n[r].setAttribute("aria-current","true");break}}},{key:"_updateInterval",value:function(){var t=this._activeElement||p.findOne(No,this._element);t&&((t=Number.parseInt(t.getAttribute("data-bs-interval"),10))?(this._config.defaultInterval=this._config.defaultInterval||this._config.interval,this._config.interval=t):this._config.interval=this._config.defaultInterval||this._config.interval);}},{key:"_slide",value:function(t,e){var n,r=this,t=this._directionToOrder(t),o=p.findOne(No,this._element),i=this._getItemIndex(o),a=e||this._getItemByOrder(t,o),c=this._getItemIndex(a),e=Boolean(this._interval),s=t===go,u=s?"carousel-item-start":"carousel-item-end",l=s?"carousel-item-next":"carousel-item-prev",f=this._orderToDirection(t);a&&a.classList.contains(Lo)?this._isSliding=!1:this._isSliding||this._triggerSlideEvent(a,f).defaultPrevented||o&&a&&(this._isSliding=!0,e&&this.pause(),this._setActiveIndicatorElement(a),this._activeElement=a,n=function(){d.trigger(r._element,Co,{relatedTarget:a,direction:f,from:i,to:c});},this._element.classList.contains("slide")?(a.classList.add(l),$(a),o.classList.add(u),a.classList.add(u),this._queueCallback(function(){a.classList.remove(u,l),a.classList.add(Lo),o.classList.remove(Lo,l,u),r._isSliding=!1,setTimeout(n,0);},o,!0)):(o.classList.remove(Lo),a.classList.add(Lo),this._isSliding=!1,n()),e&&this.cycle());}},{key:"_directionToOrder",value:function(t){return [wo,_o].includes(t)?a()?t===_o?bo:go:t===_o?go:bo:t}},{key:"_orderToDirection",value:function(t){return [go,bo].includes(t)?a()?t===bo?_o:wo:t===bo?wo:_o:t}}])&&so(t.prototype,n),e&&so(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),vo=(d.on(document,o,"[data-bs-slide], [data-bs-slide-to]",Ro.dataApiClickHandler),d.on(window,Io,function(){for(var t=p.find('[data-bs-ride="carousel"]'),e=0,n=t.length;e<n;e++)Ro.carouselInterface(t[e],Ro.getInstance(t[e]));}),e(Ro),Ro);function Bo(t){return (Bo="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Ho(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function Fo(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?Ho(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):Ho(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function Vo(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function Yo(){return (Yo="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=Uo(t)););return t}(t,e);if(r)return r=Object.getOwnPropertyDescriptor(r,e),r.get?r.get.call(arguments.length<3?t:n):r.value}).apply(this,arguments)}function Wo(t,e){return (Wo=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function zo(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=Uo(n),e=(t=r?(t=Uo(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===Bo(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function Uo(t){return (Uo=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var u=".".concat("bs.modal"),qo={backdrop:!0,keyboard:!0,focus:!0},Ko={backdrop:"(boolean|string)",keyboard:"boolean",focus:"boolean"},$o="hide".concat(u),Xo="hidePrevented".concat(u),Go="hidden".concat(u),Qo="show".concat(u),Zo="shown".concat(u),Jo="resize".concat(u),ti="click.dismiss".concat(u),ei="keydown.dismiss".concat(u),ni="mouseup.dismiss".concat(u),ri="mousedown.dismiss".concat(u),o="click".concat(u).concat(".data-api"),oi="modal-open",ii="modal-static",ai=function(){var t=o,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&Wo(t,e);var n,r=zo(o);function o(t,e){if(this instanceof o)return (t=r.call(this,t))._config=t._getConfig(e),t._dialog=p.findOne(".modal-dialog",t._element),t._backdrop=t._initializeBackDrop(),t._focustrap=t._initializeFocusTrap(),t._isShown=!1,t._ignoreBackdropClick=!1,t._isTransitioning=!1,t._scrollBar=new dr,t;throw new TypeError("Cannot call a class as a function")}return t=o,e=[{key:"Default",get:function(){return qo}},{key:"NAME",get:function(){return "modal"}},{key:"jQueryInterface",value:function(e,n){return this.each(function(){var t=o.getOrCreateInstance(this,e);if("string"==typeof e){if(void 0===t[e])throw new TypeError('No method named "'.concat(e,'"'));t[e](n);}})}}],(n=[{key:"toggle",value:function(t){return this._isShown?this.hide():this.show(t)}},{key:"show",value:function(t){var e=this;this._isShown||this._isTransitioning||d.trigger(this._element,Qo,{relatedTarget:t}).defaultPrevented||(this._isShown=!0,this._isAnimated()&&(this._isTransitioning=!0),this._scrollBar.hide(),document.body.classList.add(oi),this._adjustDialog(),this._setEscapeEvent(),this._setResizeEvent(),d.on(this._dialog,ri,function(){d.one(e._element,ni,function(t){t.target===e._element&&(e._ignoreBackdropClick=!0);});}),this._showBackdrop(function(){return e._showElement(t)}));}},{key:"hide",value:function(){var t,e=this;!this._isShown||this._isTransitioning||d.trigger(this._element,$o).defaultPrevented||(this._isShown=!1,(t=this._isAnimated())&&(this._isTransitioning=!0),this._setEscapeEvent(),this._setResizeEvent(),this._focustrap.deactivate(),this._element.classList.remove("show"),d.off(this._element,ti),d.off(this._dialog,ri),this._queueCallback(function(){return e._hideModal()},this._element,t));}},{key:"dispose",value:function(){[window,this._dialog].forEach(function(t){return d.off(t,u)}),this._backdrop.dispose(),this._focustrap.deactivate(),Yo(Uo(o.prototype),"dispose",this).call(this);}},{key:"handleUpdate",value:function(){this._adjustDialog();}},{key:"_initializeBackDrop",value:function(){return new wr({isVisible:Boolean(this._config.backdrop),isAnimated:this._isAnimated()})}},{key:"_initializeFocusTrap",value:function(){return new Mr({trapElement:this._element})}},{key:"_getConfig",value:function(t){return t=Fo(Fo(Fo({},qo),f.getDataAttributes(this._element)),"object"===Bo(t)?t:{}),W("modal",t,Ko),t}},{key:"_showElement",value:function(t){var e=this,n=this._isAnimated(),r=p.findOne(".modal-body",this._dialog);this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE||document.body.append(this._element),this._element.style.display="block",this._element.removeAttribute("aria-hidden"),this._element.setAttribute("aria-modal",!0),this._element.setAttribute("role","dialog"),this._element.scrollTop=0,r&&(r.scrollTop=0),n&&$(this._element),this._element.classList.add("show");this._queueCallback(function(){e._config.focus&&e._focustrap.activate(),e._isTransitioning=!1,d.trigger(e._element,Zo,{relatedTarget:t});},this._dialog,n);}},{key:"_setEscapeEvent",value:function(){var e=this;this._isShown?d.on(this._element,ei,function(t){e._config.keyboard&&"Escape"===t.key?(t.preventDefault(),e.hide()):e._config.keyboard||"Escape"!==t.key||e._triggerBackdropTransition();}):d.off(this._element,ei);}},{key:"_setResizeEvent",value:function(){var t=this;this._isShown?d.on(window,Jo,function(){return t._adjustDialog()}):d.off(window,Jo);}},{key:"_hideModal",value:function(){var t=this;this._element.style.display="none",this._element.setAttribute("aria-hidden",!0),this._element.removeAttribute("aria-modal"),this._element.removeAttribute("role"),this._isTransitioning=!1,this._backdrop.hide(function(){document.body.classList.remove(oi),t._resetAdjustments(),t._scrollBar.reset(),d.trigger(t._element,Go);});}},{key:"_showBackdrop",value:function(t){var e=this;d.on(this._element,ti,function(t){e._ignoreBackdropClick?e._ignoreBackdropClick=!1:t.target===t.currentTarget&&(!0===e._config.backdrop?e.hide():"static"===e._config.backdrop&&e._triggerBackdropTransition());}),this._backdrop.show(t);}},{key:"_isAnimated",value:function(){return this._element.classList.contains("fade")}},{key:"_triggerBackdropTransition",value:function(){var t,e,n,r,o,i=this;d.trigger(this._element,Xo).defaultPrevented||(t=this._element,e=t.classList,n=t.scrollHeight,r=t.style,!(o=n>document.documentElement.clientHeight)&&"hidden"===r.overflowY||e.contains(ii)||(o||(r.overflowY="hidden"),e.add(ii),this._queueCallback(function(){e.remove(ii),o||i._queueCallback(function(){r.overflowY="";},i._dialog);},this._dialog),this._element.focus()));}},{key:"_adjustDialog",value:function(){var t=this._element.scrollHeight>document.documentElement.clientHeight,e=this._scrollBar.getWidth(),n=0<e;(!n&&t&&!a()||n&&!t&&a())&&(this._element.style.paddingLeft="".concat(e,"px")),(n&&!t&&!a()||!n&&t&&a())&&(this._element.style.paddingRight="".concat(e,"px"));}},{key:"_resetAdjustments",value:function(){this._element.style.paddingLeft="",this._element.style.paddingRight="";}}])&&Vo(t.prototype,n),e&&Vo(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),Io=(d.on(document,o,'[data-bs-toggle="modal"]',function(t){var e=this,n=F(this),t=(["A","AREA"].includes(this.tagName)&&t.preventDefault(),d.one(n,Qo,function(t){t.defaultPrevented||d.one(n,Go,function(){z(e)&&e.focus();});}),p.findOne(".modal.show"));t&&ai.getInstance(t).hide(),ai.getOrCreateInstance(n).toggle(this);}),xr(ai),e(ai),ai);function ci(t){return function(t){if(Array.isArray(t))return si(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||function(t,e){if(t){if("string"==typeof t)return si(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?si(t,e):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function si(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}var ui=new Set(["background","cite","href","itemtype","longdesc","poster","src","xlink:href"]),li=/^(?:(?:https?|mailto|ftp|tel|file|sms):|[^#&/:?]*(?:[#/?]|$))/i,fi=/^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i,o={"*":["class","dir","id","lang","role",/^aria-[\w-]*$/i],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],div:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","srcset","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]};function di(t,i,e){if(!t.length)return t;if(e&&"function"==typeof e)return e(t);for(var e=(new window.DOMParser).parseFromString(t,"text/html"),a=(t=[]).concat.apply(t,ci(e.body.querySelectorAll("*"))),n=function(t,e){var n=a[t],t=n.nodeName.toLowerCase();if(!Object.keys(i).includes(t))return n.remove(),"continue";var r=(r=[]).concat.apply(r,ci(n.attributes)),o=[].concat(i["*"]||[],i[t]||[]);r.forEach(function(t){!function(t,e){var n=t.nodeName.toLowerCase();if(e.includes(n))return !ui.has(n)||Boolean(li.test(t.nodeValue)||fi.test(t.nodeValue));for(var r=e.filter(function(t){return t instanceof RegExp}),o=0,i=r.length;o<i;o++)if(r[o].test(n))return !0;return !1}(t,o)&&n.removeAttribute(t.nodeName);});},r=0,o=a.length;r<o;r++)n(r);return e.body.innerHTML}function pi(t){return (pi="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function hi(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function vi(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?hi(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):hi(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function yi(t){return function(t){if(Array.isArray(t))return mi(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||function(t,e){if(t){if("string"==typeof t)return mi(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?mi(t,e):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function mi(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function gi(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function bi(){return (bi="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=Oi(t)););return t}(t,e);if(r)return r=Object.getOwnPropertyDescriptor(r,e),r.get?r.get.call(arguments.length<3?t:n):r.value}).apply(this,arguments)}function _i(t,e){return (_i=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function wi(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=Oi(n),e=(t=r?(t=Oi(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===pi(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function Oi(t){return (Oi=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var ki="tooltip",l=".".concat("bs.tooltip"),Ci=new Set(["sanitize","allowList","sanitizeFn"]),Si={animation:"boolean",template:"string",title:"(string|element|function)",trigger:"string",delay:"(number|object)",html:"boolean",selector:"(string|boolean)",placement:"(string|function)",offset:"(array|string|function)",container:"(string|element|boolean)",fallbackPlacements:"array",boundary:"(string|element)",customClass:"(string|function)",sanitize:"boolean",sanitizeFn:"(null|function)",allowList:"object",popperConfig:"(null|object|function)"},xi={AUTO:"auto",TOP:"top",RIGHT:a()?"left":"right",BOTTOM:"bottom",LEFT:a()?"right":"left"},Ei={animation:!0,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,selector:!1,placement:"top",offset:[0,0],container:!1,fallbackPlacements:["top","right","bottom","left"],boundary:"clippingParents",customClass:"",sanitize:!0,sanitizeFn:null,allowList:o,popperConfig:null},ji={HIDE:"hide".concat(l),HIDDEN:"hidden".concat(l),SHOW:"show".concat(l),SHOWN:"shown".concat(l),INSERTED:"inserted".concat(l),CLICK:"click".concat(l),FOCUSIN:"focusin".concat(l),FOCUSOUT:"focusout".concat(l),MOUSEENTER:"mouseenter".concat(l),MOUSELEAVE:"mouseleave".concat(l)},Ti="fade",Ai="show",Di="show",Pi=".tooltip-inner",Mi=".".concat("modal"),Ii="hide.bs.modal",Li="hover",Ni="focus",o=function(){var t=o,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&_i(t,e);var n,r=wi(o);function o(t,e){if(!(this instanceof o))throw new TypeError("Cannot call a class as a function");if(void 0===i)throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org)");return (t=r.call(this,t))._isEnabled=!0,t._timeout=0,t._hoverState="",t._activeTrigger={},t._popper=null,t._config=t._getConfig(e),t.tip=null,t._setListeners(),t}return t=o,e=[{key:"Default",get:function(){return Ei}},{key:"NAME",get:function(){return ki}},{key:"Event",get:function(){return ji}},{key:"DefaultType",get:function(){return Si}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t=o.getOrCreateInstance(this,e);if("string"==typeof e){if(void 0===t[e])throw new TypeError('No method named "'.concat(e,'"'));t[e]();}})}}],(n=[{key:"enable",value:function(){this._isEnabled=!0;}},{key:"disable",value:function(){this._isEnabled=!1;}},{key:"toggleEnabled",value:function(){this._isEnabled=!this._isEnabled;}},{key:"toggle",value:function(t){this._isEnabled&&(t?((t=this._initializeOnDelegatedTarget(t))._activeTrigger.click=!t._activeTrigger.click,t._isWithActiveTrigger()?t._enter(null,t):t._leave(null,t)):this.getTipElement().classList.contains(Ai)?this._leave(null,this):this._enter(null,this));}},{key:"dispose",value:function(){clearTimeout(this._timeout),d.off(this._element.closest(Mi),Ii,this._hideModalHandler),this.tip&&this.tip.remove(),this._disposePopper(),bi(Oi(o.prototype),"dispose",this).call(this);}},{key:"show",value:function(){var t,e,n,r=this;if("none"===this._element.style.display)throw new Error("Please use show on visible elements");this.isWithContent()&&this._isEnabled&&(e=d.trigger(this._element,this.constructor.Event.SHOW),n=(null===(n=q(this._element))?this._element.ownerDocument.documentElement:n).contains(this._element),!e.defaultPrevented&&n&&("tooltip"===this.constructor.NAME&&this.tip&&this.getTitle()!==this.tip.querySelector(Pi).innerHTML&&(this._disposePopper(),this.tip.remove(),this.tip=null),e=this.getTipElement(),n=function(t){for(;t+=Math.floor(1e6*Math.random()),document.getElementById(t););return t}(this.constructor.NAME),e.setAttribute("id",n),this._element.setAttribute("aria-describedby",n),this._config.animation&&e.classList.add(Ti),n="function"==typeof this._config.placement?this._config.placement.call(this,e,this._element):this._config.placement,n=this._getAttachment(n),this._addAttachmentClass(n),t=this._config.container,kt(e,this.constructor.DATA_KEY,this),this._element.ownerDocument.documentElement.contains(this.tip)||(t.append(e),d.trigger(this._element,this.constructor.Event.INSERTED)),this._popper?this._popper.update():this._popper=en(this._element,e,this._getPopperConfig(n)),e.classList.add(Ai),(t=this._resolvePossibleFunction(this._config.customClass))&&(n=e.classList).add.apply(n,yi(t.split(" "))),"ontouchstart"in document.documentElement&&(e=[]).concat.apply(e,yi(document.body.children)).forEach(function(t){d.on(t,"mouseover",K);}),n=this.tip.classList.contains(Ti),this._queueCallback(function(){var t=r._hoverState;r._hoverState=null,d.trigger(r._element,r.constructor.Event.SHOWN),"out"===t&&r._leave(null,r);},this.tip,n)));}},{key:"hide",value:function(){var t,e,n=this;this._popper&&(t=this.getTipElement(),d.trigger(this._element,this.constructor.Event.HIDE).defaultPrevented||(t.classList.remove(Ai),"ontouchstart"in document.documentElement&&(e=[]).concat.apply(e,yi(document.body.children)).forEach(function(t){return d.off(t,"mouseover",K)}),this._activeTrigger.click=!1,this._activeTrigger[Ni]=!1,this._activeTrigger[Li]=!1,e=this.tip.classList.contains(Ti),this._queueCallback(function(){n._isWithActiveTrigger()||(n._hoverState!==Di&&t.remove(),n._cleanTipClass(),n._element.removeAttribute("aria-describedby"),d.trigger(n._element,n.constructor.Event.HIDDEN),n._disposePopper());},this.tip,e),this._hoverState=""));}},{key:"update",value:function(){null!==this._popper&&this._popper.update();}},{key:"isWithContent",value:function(){return Boolean(this.getTitle())}},{key:"getTipElement",value:function(){if(this.tip)return this.tip;var t=document.createElement("div"),t=(t.innerHTML=this._config.template,t.children[0]);return this.setContent(t),t.classList.remove(Ti,Ai),this.tip=t,this.tip}},{key:"setContent",value:function(t){this._sanitizeAndSetContent(t,this.getTitle(),Pi);}},{key:"_sanitizeAndSetContent",value:function(t,e,n){n=p.findOne(n,t);!e&&n?n.remove():this.setElementContent(n,e);}},{key:"setElementContent",value:function(t,e){if(null!==t)return nt(e)?(e=Y(e),void(this._config.html?e.parentNode!==t&&(t.innerHTML="",t.append(e)):t.textContent=e.textContent)):void(this._config.html?(this._config.sanitize&&(e=di(e,this._config.allowList,this._config.sanitizeFn)),t.innerHTML=e):t.textContent=e)}},{key:"getTitle",value:function(){var t=this._element.getAttribute("data-bs-original-title")||this._config.title;return this._resolvePossibleFunction(t)}},{key:"updateAttachment",value:function(t){return "right"===t?"end":"left"===t?"start":t}},{key:"_initializeOnDelegatedTarget",value:function(t,e){return e||this.constructor.getOrCreateInstance(t.delegateTarget,this._getDelegateConfig())}},{key:"_getOffset",value:function(){var e=this,n=this._config.offset;return "string"==typeof n?n.split(",").map(function(t){return Number.parseInt(t,10)}):"function"==typeof n?function(t){return n(t,e._element)}:n}},{key:"_resolvePossibleFunction",value:function(t){return "function"==typeof t?t.call(this._element):t}},{key:"_getPopperConfig",value:function(t){var e=this,t={placement:t,modifiers:[{name:"flip",options:{fallbackPlacements:this._config.fallbackPlacements}},{name:"offset",options:{offset:this._getOffset()}},{name:"preventOverflow",options:{boundary:this._config.boundary}},{name:"arrow",options:{element:".".concat(this.constructor.NAME,"-arrow")}},{name:"onChange",enabled:!0,phase:"afterWrite",fn:function(t){return e._handlePopperPlacementChange(t)}}],onFirstUpdate:function(t){t.options.placement!==t.placement&&e._handlePopperPlacementChange(t);}};return vi(vi({},t),"function"==typeof this._config.popperConfig?this._config.popperConfig(t):this._config.popperConfig)}},{key:"_addAttachmentClass",value:function(t){this.getTipElement().classList.add("".concat(this._getBasicClassPrefix(),"-").concat(this.updateAttachment(t)));}},{key:"_getAttachment",value:function(t){return xi[t.toUpperCase()]}},{key:"_setListeners",value:function(){var n=this;this._config.trigger.split(" ").forEach(function(t){var e;"click"===t?d.on(n._element,n.constructor.Event.CLICK,n._config.selector,function(t){return n.toggle(t)}):"manual"!==t&&(e=t===Li?n.constructor.Event.MOUSEENTER:n.constructor.Event.FOCUSIN,t=t===Li?n.constructor.Event.MOUSELEAVE:n.constructor.Event.FOCUSOUT,d.on(n._element,e,n._config.selector,function(t){return n._enter(t)}),d.on(n._element,t,n._config.selector,function(t){return n._leave(t)}));}),this._hideModalHandler=function(){n._element&&n.hide();},d.on(this._element.closest(Mi),Ii,this._hideModalHandler),this._config.selector?this._config=vi(vi({},this._config),{},{trigger:"manual",selector:""}):this._fixTitle();}},{key:"_fixTitle",value:function(){var t=this._element.getAttribute("title"),e=pi(this._element.getAttribute("data-bs-original-title"));!t&&"string"===e||(this._element.setAttribute("data-bs-original-title",t||""),!t||this._element.getAttribute("aria-label")||this._element.textContent||this._element.setAttribute("aria-label",t),this._element.setAttribute("title",""));}},{key:"_enter",value:function(t,e){e=this._initializeOnDelegatedTarget(t,e),t&&(e._activeTrigger["focusin"===t.type?Ni:Li]=!0),e.getTipElement().classList.contains(Ai)||e._hoverState===Di?e._hoverState=Di:(clearTimeout(e._timeout),e._hoverState=Di,e._config.delay&&e._config.delay.show?e._timeout=setTimeout(function(){e._hoverState===Di&&e.show();},e._config.delay.show):e.show());}},{key:"_leave",value:function(t,e){e=this._initializeOnDelegatedTarget(t,e),t&&(e._activeTrigger["focusout"===t.type?Ni:Li]=e._element.contains(t.relatedTarget)),e._isWithActiveTrigger()||(clearTimeout(e._timeout),e._hoverState="out",e._config.delay&&e._config.delay.hide?e._timeout=setTimeout(function(){"out"===e._hoverState&&e.hide();},e._config.delay.hide):e.hide());}},{key:"_isWithActiveTrigger",value:function(){for(var t in this._activeTrigger)if(this._activeTrigger[t])return !0;return !1}},{key:"_getConfig",value:function(t){var e=f.getDataAttributes(this._element);return Object.keys(e).forEach(function(t){Ci.has(t)&&delete e[t];}),(t=vi(vi(vi({},this.constructor.Default),e),"object"===pi(t)&&t?t:{})).container=!1===t.container?document.body:Y(t.container),"number"==typeof t.delay&&(t.delay={show:t.delay,hide:t.delay}),"number"==typeof t.title&&(t.title=t.title.toString()),"number"==typeof t.content&&(t.content=t.content.toString()),W(ki,t,this.constructor.DefaultType),t.sanitize&&(t.template=di(t.template,t.allowList,t.sanitizeFn)),t}},{key:"_getDelegateConfig",value:function(){var t,e={};for(t in this._config)this.constructor.Default[t]!==this._config[t]&&(e[t]=this._config[t]);return e}},{key:"_cleanTipClass",value:function(){var e=this.getTipElement(),t=new RegExp("(^|\\s)".concat(this._getBasicClassPrefix(),"\\S+"),"g"),t=e.getAttribute("class").match(t);null!==t&&0<t.length&&t.map(function(t){return t.trim()}).forEach(function(t){return e.classList.remove(t)});}},{key:"_getBasicClassPrefix",value:function(){return "bs-tooltip"}},{key:"_handlePopperPlacementChange",value:function(t){t=t.state;t&&(this.tip=t.elements.popper,this._cleanTipClass(),this._addAttachmentClass(this._getAttachment(t.placement)));}},{key:"_disposePopper",value:function(){this._popper&&(this._popper.destroy(),this._popper=null);}}])&&gi(t.prototype,n),e&&gi(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),Ri=(e(o),o);function Bi(t){return (Bi="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Hi(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function Fi(t,e){return (Fi=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function Vi(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=Yi(n),e=(t=r?(t=Yi(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===Bi(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function Yi(t){return (Yi=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function Wi(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function zi(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?Wi(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):Wi(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}var l=".".concat("bs.popover"),Ui=zi(zi({},Ri.Default),{},{placement:"right",offset:[0,8],trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'}),qi=zi(zi({},Ri.DefaultType),{},{content:"(string|element|function)"}),Ki={HIDE:"hide".concat(l),HIDDEN:"hidden".concat(l),SHOW:"show".concat(l),SHOWN:"shown".concat(l),INSERTED:"inserted".concat(l),CLICK:"click".concat(l),FOCUSIN:"focusin".concat(l),FOCUSOUT:"focusout".concat(l),MOUSEENTER:"mouseenter".concat(l),MOUSELEAVE:"mouseleave".concat(l)},o=function(){var t=o,e=Ri;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&Fi(t,e);var n,r=Vi(o);function o(){var t=this,e=o;if(t instanceof e)return r.apply(this,arguments);throw new TypeError("Cannot call a class as a function")}return t=o,e=[{key:"Default",get:function(){return Ui}},{key:"NAME",get:function(){return "popover"}},{key:"Event",get:function(){return Ki}},{key:"DefaultType",get:function(){return qi}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t=o.getOrCreateInstance(this,e);if("string"==typeof e){if(void 0===t[e])throw new TypeError('No method named "'.concat(e,'"'));t[e]();}})}}],(n=[{key:"isWithContent",value:function(){return this.getTitle()||this._getContent()}},{key:"setContent",value:function(t){this._sanitizeAndSetContent(t,this.getTitle(),".popover-header"),this._sanitizeAndSetContent(t,this._getContent(),".popover-body");}},{key:"_getContent",value:function(){return this._resolvePossibleFunction(this._config.content)}},{key:"_getBasicClassPrefix",value:function(){return "bs-popover"}}])&&Hi(t.prototype,n),e&&Hi(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),l=(e(o),o);t(180);function $i(t){return ($i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Xi(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function Gi(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?Xi(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):Xi(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function Qi(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function Zi(){return (Zi="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=ea(t)););return t}(t,e);if(r)return r=Object.getOwnPropertyDescriptor(r,e),r.get?r.get.call(arguments.length<3?t:n):r.value}).apply(this,arguments)}function Ji(t,e){return (Ji=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function ta(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=ea(n),e=(t=r?(t=ea(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===$i(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function ea(t){return (ea=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var na="scrollspy",ra=".".concat("bs.scrollspy"),oa={offset:10,method:"auto",target:""},ia={offset:"number",method:"string",target:"(string|element)"},aa="activate".concat(ra),ca="scroll".concat(ra),o="load".concat(ra).concat(".data-api"),sa="dropdown-item",ua="active",la=".nav-link",fa=".list-group-item",da="".concat(la,", ").concat(fa,", .").concat(sa),pa="position",ha=function(){var t=o,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&Ji(t,e);var n,r=ta(o);function o(t,e){var n;if(this instanceof o)return (n=r.call(this,t))._scrollElement="BODY"===n._element.tagName?window:n._element,n._config=n._getConfig(e),n._offsets=[],n._targets=[],n._activeTarget=null,n._scrollHeight=0,d.on(n._scrollElement,ca,function(){return n._process()}),n.refresh(),n._process(),n;throw new TypeError("Cannot call a class as a function")}return t=o,e=[{key:"Default",get:function(){return oa}},{key:"NAME",get:function(){return na}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t=o.getOrCreateInstance(this,e);if("string"==typeof e){if(void 0===t[e])throw new TypeError('No method named "'.concat(e,'"'));t[e]();}})}}],(n=[{key:"refresh",value:function(){var e=this,t=this._scrollElement===this._scrollElement.window?"offset":pa,r="auto"===this._config.method?t:this._config.method,o=r===pa?this._getScrollTop():0;this._offsets=[],this._targets=[],this._scrollHeight=this._getScrollHeight(),p.find(da,this._config.target).map(function(t){var t=H(t),e=t?p.findOne(t):null;if(e){var n=e.getBoundingClientRect();if(n.width||n.height)return [f[r](e).top+o,t]}return null}).filter(function(t){return t}).sort(function(t,e){return t[0]-e[0]}).forEach(function(t){e._offsets.push(t[0]),e._targets.push(t[1]);});}},{key:"dispose",value:function(){d.off(this._scrollElement,ra),Zi(ea(o.prototype),"dispose",this).call(this);}},{key:"_getConfig",value:function(t){return (t=Gi(Gi(Gi({},oa),f.getDataAttributes(this._element)),"object"===$i(t)&&t?t:{})).target=Y(t.target)||document.documentElement,W(na,t,ia),t}},{key:"_getScrollTop",value:function(){return this._scrollElement===window?this._scrollElement.pageYOffset:this._scrollElement.scrollTop}},{key:"_getScrollHeight",value:function(){return this._scrollElement.scrollHeight||Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)}},{key:"_getOffsetHeight",value:function(){return this._scrollElement===window?window.innerHeight:this._scrollElement.getBoundingClientRect().height}},{key:"_process",value:function(){var t=this._getScrollTop()+this._config.offset,e=this._getScrollHeight(),n=this._config.offset+e-this._getOffsetHeight();if(this._scrollHeight!==e&&this.refresh(),n<=t)return e=this._targets[this._targets.length-1],void(this._activeTarget!==e&&this._activate(e));if(this._activeTarget&&t<this._offsets[0]&&0<this._offsets[0])return this._activeTarget=null,void this._clear();for(var r=this._offsets.length;r--;)this._activeTarget!==this._targets[r]&&t>=this._offsets[r]&&(void 0===this._offsets[r+1]||t<this._offsets[r+1])&&this._activate(this._targets[r]);}},{key:"_activate",value:function(e){this._activeTarget=e,this._clear();var t=da.split(",").map(function(t){return "".concat(t,'[data-bs-target="').concat(e,'"],').concat(t,'[href="').concat(e,'"]')}),t=p.findOne(t.join(","),this._config.target);t.classList.add(ua),t.classList.contains(sa)?p.findOne(".dropdown-toggle",t.closest(".dropdown")).classList.add(ua):p.parents(t,".nav, .list-group").forEach(function(t){p.prev(t,"".concat(la,", ").concat(fa)).forEach(function(t){return t.classList.add(ua)}),p.prev(t,".nav-item").forEach(function(t){p.children(t,la).forEach(function(t){return t.classList.add(ua)});});}),d.trigger(this._scrollElement,aa,{relatedTarget:e});}},{key:"_clear",value:function(){p.find(da,this._config.target).filter(function(t){return t.classList.contains(ua)}).forEach(function(t){return t.classList.remove(ua)});}}])&&Qi(t.prototype,n),e&&Qi(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),o=(d.on(window,o,function(){p.find('[data-bs-spy="scroll"]').forEach(function(t){return new ha(t)});}),e(ha),ha);function va(t){return (va="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function ya(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function ma(t,e){return (ma=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function ga(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=ba(n),e=(t=r?(t=ba(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===va(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function ba(t){return (ba=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var _a=".".concat("bs.tab"),wa="hide".concat(_a),Oa="hidden".concat(_a),ka="show".concat(_a),Ca="shown".concat(_a),_a="click".concat(_a).concat(".data-api"),Sa="active",xa=".active",Ea=":scope > li > .active",ja=function(){var t=o,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&ma(t,e);var n,r=ga(o);function o(){var t=this,e=o;if(t instanceof e)return r.apply(this,arguments);throw new TypeError("Cannot call a class as a function")}return t=o,e=[{key:"NAME",get:function(){return "tab"}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t=o.getOrCreateInstance(this);if("string"==typeof e){if(void 0===t[e])throw new TypeError('No method named "'.concat(e,'"'));t[e]();}})}}],(n=[{key:"show",value:function(){var t,e,n,r,o=this;this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE&&this._element.classList.contains(Sa)||(t=F(this._element),(e=this._element.closest(".nav, .list-group"))&&(r="UL"===e.nodeName||"OL"===e.nodeName?Ea:xa,n=(n=p.find(r,e))[n.length-1]),r=n?d.trigger(n,wa,{relatedTarget:this._element}):null,d.trigger(this._element,ka,{relatedTarget:n}).defaultPrevented||null!==r&&r.defaultPrevented||(this._activate(this._element,e),r=function(){d.trigger(n,Oa,{relatedTarget:o._element}),d.trigger(o._element,Ca,{relatedTarget:n});},t?this._activate(t,t.parentNode,r):r()));}},{key:"_activate",value:function(t,e,n){function r(){return o._transitionComplete(t,i,n)}var o=this,i=(!e||"UL"!==e.nodeName&&"OL"!==e.nodeName?p.children(e,xa):p.find(Ea,e))[0],e=n&&i&&i.classList.contains("fade");i&&e?(i.classList.remove("show"),this._queueCallback(r,t,!0)):r();}},{key:"_transitionComplete",value:function(t,e,n){e&&(e.classList.remove(Sa),(r=p.findOne(":scope > .dropdown-menu .active",e.parentNode))&&r.classList.remove(Sa),"tab"===e.getAttribute("role")&&e.setAttribute("aria-selected",!1)),t.classList.add(Sa),"tab"===t.getAttribute("role")&&t.setAttribute("aria-selected",!0),$(t),t.classList.contains("fade")&&t.classList.add("show");var r=t.parentNode;(r=r&&"LI"===r.nodeName?r.parentNode:r)&&r.classList.contains("dropdown-menu")&&((e=t.closest(".dropdown"))&&p.find(".dropdown-toggle",e).forEach(function(t){return t.classList.add(Sa)}),t.setAttribute("aria-expanded",!0)),n&&n();}}])&&ya(t.prototype,n),e&&ya(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),_a=(d.on(document,_a,'[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]',function(t){["A","AREA"].includes(this.tagName)&&t.preventDefault(),U(this)||ja.getOrCreateInstance(this).show();}),e(ja),ja);function Ta(t){return (Ta="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Aa(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function Da(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?Aa(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):Aa(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function Pa(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function Ma(){return (Ma="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=Na(t)););return t}(t,e);if(r)return r=Object.getOwnPropertyDescriptor(r,e),r.get?r.get.call(arguments.length<3?t:n):r.value}).apply(this,arguments)}function Ia(t,e){return (Ia=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function La(n){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return !1}}();return function(){var t,e=Na(n),e=(t=r?(t=Na(this).constructor,Reflect.construct(e,arguments,t)):e.apply(this,arguments),this);if(t&&("object"===Ta(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}}function Na(t){return (Na=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function Ra(t){for(;t+=Math.floor(Math.random()*nc),document.getElementById(t););return t}function Ba(o,i,a){Object.keys(a).forEach(function(t){var e,n=a[t],r=i[t],r=r&&((e=r)[0]||e).nodeType?"element":null==(e=r)?"".concat(e):{}.toString.call(e).match(/\s([a-z]+)/i)[1].toLowerCase();if(!new RegExp(n).test(r))throw new Error("".concat(o.toUpperCase(),": ")+'Option "'.concat(t,'" provided type "').concat(r,'" ')+'but expected type "'.concat(n,'".'))});}function Ha(){var t=window.jQuery;return t&&!document.body.hasAttribute("data-mdb-no-jquery")?t:null}function Fa(t){"loading"===document.readyState?document.addEventListener("DOMContentLoaded",t):t();}function Va(t){return document.createElement(t)}var Ya,Wa,h=".".concat("bs.toast"),za="mouseover".concat(h),Ua="mouseout".concat(h),qa="focusin".concat(h),Ka="focusout".concat(h),$a="hide".concat(h),Xa="hidden".concat(h),Ga="show".concat(h),Qa="shown".concat(h),Za="show",Ja="showing",tc={animation:"boolean",autohide:"boolean",delay:"number"},ec={animation:!0,autohide:!0,delay:5e3},h=function(){var t=o,e=c;if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&Ia(t,e);var n,r=La(o);function o(t,e){if(this instanceof o)return (t=r.call(this,t))._config=t._getConfig(e),t._timeout=null,t._hasMouseInteraction=!1,t._hasKeyboardInteraction=!1,t._setListeners(),t;throw new TypeError("Cannot call a class as a function")}return t=o,e=[{key:"DefaultType",get:function(){return tc}},{key:"Default",get:function(){return ec}},{key:"NAME",get:function(){return "toast"}},{key:"jQueryInterface",value:function(e){return this.each(function(){var t=o.getOrCreateInstance(this,e);if("string"==typeof e){if(void 0===t[e])throw new TypeError('No method named "'.concat(e,'"'));t[e](this);}})}}],(n=[{key:"show",value:function(){var t=this;d.trigger(this._element,Ga).defaultPrevented||(this._clearTimeout(),this._config.animation&&this._element.classList.add("fade"),this._element.classList.remove("hide"),$(this._element),this._element.classList.add(Za),this._element.classList.add(Ja),this._queueCallback(function(){t._element.classList.remove(Ja),d.trigger(t._element,Qa),t._maybeScheduleHide();},this._element,this._config.animation));}},{key:"hide",value:function(){var t=this;this._element.classList.contains(Za)&&!d.trigger(this._element,$a).defaultPrevented&&(this._element.classList.add(Ja),this._queueCallback(function(){t._element.classList.add("hide"),t._element.classList.remove(Ja),t._element.classList.remove(Za),d.trigger(t._element,Xa);},this._element,this._config.animation));}},{key:"dispose",value:function(){this._clearTimeout(),this._element.classList.contains(Za)&&this._element.classList.remove(Za),Ma(Na(o.prototype),"dispose",this).call(this);}},{key:"_getConfig",value:function(t){return t=Da(Da(Da({},ec),f.getDataAttributes(this._element)),"object"===Ta(t)&&t?t:{}),W("toast",t,this.constructor.DefaultType),t}},{key:"_maybeScheduleHide",value:function(){var t=this;!this._config.autohide||this._hasMouseInteraction||this._hasKeyboardInteraction||(this._timeout=setTimeout(function(){t.hide();},this._config.delay));}},{key:"_onInteraction",value:function(t,e){switch(t.type){case"mouseover":case"mouseout":this._hasMouseInteraction=e;break;case"focusin":case"focusout":this._hasKeyboardInteraction=e;}e?this._clearTimeout():(t=t.relatedTarget,this._element===t||this._element.contains(t)||this._maybeScheduleHide());}},{key:"_setListeners",value:function(){var e=this;d.on(this._element,za,function(t){return e._onInteraction(t,!0)}),d.on(this._element,Ua,function(t){return e._onInteraction(t,!1)}),d.on(this._element,qa,function(t){return e._onInteraction(t,!0)}),d.on(this._element,Ka,function(t){return e._onInteraction(t,!1)});}},{key:"_clearTimeout",value:function(){clearTimeout(this._timeout),this._timeout=null;}}])&&Pa(t.prototype,n),e&&Pa(t,e),Object.defineProperty(t,"prototype",{writable:!1}),o}(),nc=(xr(h),e(h),1e6),rc=(document.documentElement.dir,Ya={},Wa=1,{set:function(t,e,n){void 0===t[e]&&(t[e]={key:e,id:Wa},Wa++),Ya[t[e].id]=n;},get:function(t,e){if(!t||void 0===t[e])return null;t=t[e];return t.key===e?Ya[t.id]:null},delete:function(t,e){var n;void 0!==t[e]&&(n=t[e]).key===e&&(delete Ya[n.id],delete t[e]);}}),v={setData:function(t,e,n){rc.set(t,e,n);},getData:function(t,e){return rc.get(t,e)},removeData:function(t,e){rc.delete(t,e);}};function oc(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var r,o,i=[],a=!0,c=!1;try{for(n=n.call(t);!(a=(r=n.next()).done)&&(i.push(r.value),!e||i.length!==e);a=!0);}catch(t){c=!0,o=t;}finally{try{a||null==n.return||n.return();}finally{if(c)throw o}}return i}}(t,e)||function(t,e){if(t){if("string"==typeof t)return ic(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?ic(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function ic(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}var ac=Ha(),cc=/[^.]*(?=\..*)\.|.*/,sc=/\..*/,uc=/::\d+$/,lc={},fc=1,dc={mouseenter:"mouseover",mouseleave:"mouseout"},pc=["click","dblclick","mouseup","mousedown","contextmenu","mousewheel","DOMMouseScroll","mouseover","mouseout","mousemove","selectstart","selectend","keydown","keypress","keyup","orientationchange","touchstart","touchmove","touchend","touchcancel","pointerdown","pointermove","pointerup","pointerleave","pointercancel","gesturestart","gesturechange","gestureend","focus","blur","change","reset","select","submit","focusin","focusout","load","unload","beforeunload","resize","move","DOMContentLoaded","readystatechange","error","abort","scroll"];function hc(t,e){return e&&"".concat(e,"::").concat(fc++)||t.uidEvent||fc++}function vc(t){var e=hc(t);return t.uidEvent=e,lc[e]=lc[e]||{},lc[e]}function yc(t,e,n){for(var r=2<arguments.length&&void 0!==n?n:null,o=Object.keys(t),i=0,a=o.length;i<a;i++){var c=t[o[i]];if(c.originalHandler===e&&c.delegationSelector===r)return c}return null}function mc(t,e,n){var r="string"==typeof e,n=r?n:e,e=t.replace(sc,""),o=dc[e];return [r,n,e=-1<pc.indexOf(e=o?o:e)?e:t]}function gc(t,e,n,r,o){var i,a,c,s,u,l,f,d,p,h;"string"==typeof e&&t&&(n||(n=r,r=null),i=(c=oc(mc(e,n,r),3))[0],a=c[1],c=c[2],(u=yc(s=(s=vc(t))[c]||(s[c]={}),a,i?n:null))?u.oneOff=u.oneOff&&o:(u=hc(a,e.replace(cc,"")),(e=i?(d=t,p=n,h=r,function t(e){for(var n=d.querySelectorAll(p),r=e.target;r&&r!==this;r=r.parentNode)for(var o=n.length;o--;)if(n[o]===r)return e.delegateTarget=r,t.oneOff&&_c.off(d,e.type,h),h.apply(r,[e]);return null}):(l=t,f=n,function t(e){return e.delegateTarget=l,t.oneOff&&_c.off(l,e.type,f),f.apply(l,[e])})).delegationSelector=i?n:null,e.originalHandler=a,e.oneOff=o,s[e.uidEvent=u]=e,t.addEventListener(c,e,i)));}function bc(t,e,n,r,o){r=yc(e[n],r,o);r&&(t.removeEventListener(n,r,Boolean(o)),delete e[n][r.uidEvent]);}var _c={on:function(t,e,n,r){gc(t,e,n,r,!1);},one:function(t,e,n,r){gc(t,e,n,r,!0);},off:function(a,c,t,e){if("string"==typeof c&&a){var e=oc(mc(c,t,e),3),n=e[0],r=e[1],o=e[2],i=o!==c,s=vc(a),e="."===c.charAt(0);if(void 0!==r)return s&&s[o]?void bc(a,s,o,r,n?t:null):void 0;e&&Object.keys(s).forEach(function(t){var e,n,r,o,i;e=a,n=s,r=t,o=c.slice(1),i=n[r]||{},Object.keys(i).forEach(function(t){-1<t.indexOf(o)&&(t=i[t],bc(e,n,r,t.originalHandler,t.delegationSelector));});});var u=s[o]||{};Object.keys(u).forEach(function(t){var e=t.replace(uc,"");(!i||-1<c.indexOf(e))&&(e=u[t],bc(a,s,o,e.originalHandler,e.delegationSelector));});}},trigger:function(t,e,n){if("string"!=typeof e||!t)return null;var r,o=e.replace(sc,""),i=e!==o,a=-1<pc.indexOf(o),c=!0,s=!0,u=!1,l=null;return i&&ac&&(r=ac.Event(e,n),ac(t).trigger(r),c=!r.isPropagationStopped(),s=!r.isImmediatePropagationStopped(),u=r.isDefaultPrevented()),a?(l=document.createEvent("HTMLEvents")).initEvent(o,c,!0):l=new CustomEvent(e,{bubbles:c,cancelable:!0}),void 0!==n&&Object.keys(n).forEach(function(t){Object.defineProperty(l,t,{get:function(){return n[t]}});}),u&&l.preventDefault(),s&&t.dispatchEvent(l),l.defaultPrevented&&void 0!==r&&r.preventDefault(),l}},wc=function(t,e,n,r){for(var o=e.split(" "),i=0;i<o.length;i++)_c.on(t,o[i],n,r);},Oc=function(t,e,n,r){for(var o=e.split(" "),i=0;i<o.length;i++)_c.off(t,o[i],n,r);},_=_c;t(185);function kc(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function Cc(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?kc(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):kc(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function Sc(t){return "true"===t||"false"!==t&&(t===Number(t).toString()?Number(t):""===t||"null"===t?null:t)}function xc(t){return t.replace(/[A-Z]/g,function(t){return "-".concat(t.toLowerCase())})}var S={setDataAttribute:function(t,e,n){t.setAttribute("data-mdb-".concat(xc(e)),n);},removeDataAttribute:function(t,e){t.removeAttribute("data-mdb-".concat(xc(e)));},getDataAttributes:function(t){if(!t)return {};var n=Cc({},t.dataset);return Object.keys(n).filter(function(t){return t.startsWith("mdb")}).forEach(function(t){var e=(e=t.replace(/^mdb/,"")).charAt(0).toLowerCase()+e.slice(1,e.length);n[e]=Sc(n[t]);}),n},getDataAttribute:function(t,e){return Sc(t.getAttribute("data-mdb-".concat(xc(e))))},offset:function(t){t=t.getBoundingClientRect();return {top:t.top+document.body.scrollTop,left:t.left+document.body.scrollLeft}},position:function(t){return {top:t.offsetTop,left:t.offsetLeft}},style:function(t,e){Object.assign(t.style,e);},toggleClass:function(t,e){t&&(t.classList.contains(e)?t.classList.remove(e):t.classList.add(e));},addClass:function(t,e){t.classList.contains(e)||t.classList.add(e);},addStyle:function(e,n){Object.keys(n).forEach(function(t){e.style[t]=n[t];});},removeClass:function(t,e){t.classList.contains(e)&&t.classList.remove(e);},hasClass:function(t,e){return t.classList.contains(e)}};function Ec(t){return function(t){if(Array.isArray(t))return jc(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||function(t,e){if(t){if("string"==typeof t)return jc(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?jc(t,e):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function jc(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}var x={closest:function(t,e){return t.closest(e)},matches:function(t,e){return t.matches(e)},find:function(t){var e,n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:document.documentElement;return (e=[]).concat.apply(e,Ec(Element.prototype.querySelectorAll.call(n,t)))},findOne:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:document.documentElement;return Element.prototype.querySelector.call(e,t)},children:function(t,e){var n;return (n=[]).concat.apply(n,Ec(t.children)).filter(function(t){return t.matches(e)})},parents:function(t,e){for(var n=[],r=t.parentNode;r&&r.nodeType===Node.ELEMENT_NODE&&3!==r.nodeType;)this.matches(r,e)&&n.push(r),r=r.parentNode;return n},prev:function(t,e){for(var n=t.previousElementSibling;n;){if(n.matches(e))return [n];n=n.previousElementSibling;}return []},next:function(t,e){for(var n=t.nextElementSibling;n;){if(this.matches(n,e))return [n];n=n.nextElementSibling;}return []}};function Tc(t){return (Tc="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Ac(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function Dc(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?Ac(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):Ac(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function Pc(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}var Mc="ripple",Ic="mdb.ripple",Lc="ripple-surface",Nc="ripple-wave",Rc=["[data-mdb-ripple]"],Bc="ripple-surface-unbound",Hc=[0,0,0],Fc=["primary","secondary","success","danger","warning","info","light","dark"],Vc={rippleCentered:!1,rippleColor:"",rippleDuration:"500ms",rippleRadius:0,rippleUnbound:!1},Yc={rippleCentered:"boolean",rippleColor:"string",rippleDuration:"string",rippleRadius:"number",rippleUnbound:"boolean"},Wc=function(){function n(t,e){if(!(this instanceof n))throw new TypeError("Cannot call a class as a function");this._element=t,this._options=this._getConfig(e),this._element&&(v.setData(t,Ic,this),S.addClass(this._element,Lc)),this._clickHandler=this._createRipple.bind(this),this._rippleTimer=null,this._isMinWidthSet=!1,this.init();}var t,e,r;return t=n,r=[{key:"NAME",get:function(){return Mc}},{key:"autoInitial",value:function(e){return function(t){e._autoInit(t);}}},{key:"jQueryInterface",value:function(t){return this.each(function(){return v.getData(this,Ic)?null:new n(this,t)})}},{key:"getInstance",value:function(t){return v.getData(t,Ic)}},{key:"getOrCreateInstance",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return this.getInstance(t)||new this(t,"object"===Tc(e)?e:null)}}],(e=[{key:"init",value:function(){this._addClickEvent(this._element);}},{key:"dispose",value:function(){v.removeData(this._element,Ic),_.off(this._element,"click",this._clickHandler),this._element=null,this._options=null;}},{key:"_autoInit",value:function(e){var n=this;Rc.forEach(function(t){x.closest(e.target,t)&&(n._element=x.closest(e.target,t));}),this._element.style.minWidth||(S.style(this._element,{"min-width":"".concat(this._element.offsetWidth,"px")}),this._isMinWidthSet=!0),S.addClass(this._element,Lc),this._options=this._getConfig(),this._createRipple(e);}},{key:"_addClickEvent",value:function(t){_.on(t,"mousedown",this._clickHandler);}},{key:"_createRipple",value:function(t){S.hasClass(this._element,Lc)||S.addClass(this._element,Lc);var e=t.layerX,t=t.layerY,n=this._element.offsetHeight,r=this._element.offsetWidth,o=this._durationToMsNumber(this._options.rippleDuration),i={offsetX:this._options.rippleCentered?n/2:e,offsetY:this._options.rippleCentered?r/2:t,height:n,width:r},i=this._getDiameter(i),a=this._options.rippleRadius||i/2,c={delay:.5*o,duration:o-.5*o},r={left:this._options.rippleCentered?"".concat(r/2-a,"px"):"".concat(e-a,"px"),top:this._options.rippleCentered?"".concat(n/2-a,"px"):"".concat(t-a,"px"),height:"".concat(2*this._options.rippleRadius||i,"px"),width:"".concat(2*this._options.rippleRadius||i,"px"),transitionDelay:"0s, ".concat(c.delay,"ms"),transitionDuration:"".concat(o,"ms, ").concat(c.duration,"ms")},e=Va("div");this._createHTMLRipple({wrapper:this._element,ripple:e,styles:r}),this._removeHTMLRipple({ripple:e,duration:o});}},{key:"_createHTMLRipple",value:function(t){var e=t.wrapper,n=t.ripple,r=t.styles;Object.keys(r).forEach(function(t){return n.style[t]=r[t]}),n.classList.add(Nc),""!==this._options.rippleColor&&(this._removeOldColorClasses(e),this._addColor(n,e)),this._toggleUnbound(e),this._appendRipple(n,e);}},{key:"_removeHTMLRipple",value:function(t){var e=this,n=t.ripple,t=t.duration;this._rippleTimer&&(clearTimeout(this._rippleTimer),this._rippleTimer=null),this._rippleTimer=setTimeout(function(){n&&(n.remove(),e._element&&(x.find(".".concat(Nc),e._element).forEach(function(t){t.remove();}),e._isMinWidthSet&&(S.style(e._element,{"min-width":""}),e._isMinWidthSet=!1),S.removeClass(e._element,Lc)));},t);}},{key:"_durationToMsNumber",value:function(t){return Number(t.replace("ms","").replace("s","000"))}},{key:"_getConfig",value:function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},e=S.getDataAttributes(this._element),t=Dc(Dc(Dc({},Vc),e),t);return Ba(Mc,t,Yc),t}},{key:"_getDiameter",value:function(t){function e(t,e){return Math.sqrt(Math.pow(t,2)+Math.pow(e,2))}var n=t.offsetX,r=t.offsetY,o=t.height,t=t.width,i=r<=o/2,a=n<=t/2,c=r===o/2&&n===t/2,s=!0==i&&!1==a,u=!0==i&&!0==a,l=!1==i&&!0==a,i=!1==i&&!1==a,a={topLeft:e(n,r),topRight:e(t-n,r),bottomLeft:e(n,o-r),bottomRight:e(t-n,o-r)},t=0;return c||i?t=a.topLeft:l?t=a.topRight:u?t=a.bottomRight:s&&(t=a.bottomLeft),2*t}},{key:"_appendRipple",value:function(t,e){e.appendChild(t),setTimeout(function(){S.addClass(t,"active");},50);}},{key:"_toggleUnbound",value:function(t){!0===this._options.rippleUnbound?S.addClass(t,Bc):t.classList.remove(Bc);}},{key:"_addColor",value:function(t,e){var n=this;Fc.find(function(t){return t===n._options.rippleColor.toLowerCase()})?S.addClass(e,"".concat(Lc,"-").concat(this._options.rippleColor.toLowerCase())):(e=this._colorToRGB(this._options.rippleColor).join(","),e="rgba({{color}}, 0.2) 0, rgba({{color}}, 0.3) 40%, rgba({{color}}, 0.4) 50%, rgba({{color}}, 0.5) 60%, rgba({{color}}, 0) 70%".split("{{color}}").join("".concat(e)),t.style.backgroundImage="radial-gradient(circle, ".concat(e,")"));}},{key:"_removeOldColorClasses",value:function(e){var t=new RegExp("".concat(Lc,"-[a-z]+"),"gi");(e.classList.value.match(t)||[]).forEach(function(t){e.classList.remove(t);});}},{key:"_colorToRGB",value:function(t){return "transparent"===t.toLowerCase()?Hc:"#"===t[0]?((e=t).length<7&&(e="#".concat(e[1]).concat(e[1]).concat(e[2]).concat(e[2]).concat(e[3]).concat(e[3])),[parseInt(e.substr(1,2),16),parseInt(e.substr(3,2),16),parseInt(e.substr(5,2),16)]):(-1===t.indexOf("rgb")&&(e=t,n=document.body.appendChild(document.createElement("fictum")),r="rgb(1, 2, 3)",n.style.color=r,t=n.style.color!==r?Hc:(n.style.color=e,n.style.color===r||""===n.style.color?Hc:(e=getComputedStyle(n).color,document.body.removeChild(n),e))),0===t.indexOf("rgb")?((r=(r=t).match(/[.\d]+/g).map(function(t){return +Number(t)})).length=3,r):Hc);var e,n,r;}}])&&Pc(t.prototype,e),r&&Pc(t,r),Object.defineProperty(t,"prototype",{writable:!1}),n}(),zc=(Rc.forEach(function(t){_.one(document,"mousedown",t,Wc.autoInitial(new Wc));}),Fa(function(){var t,e=Ha();e&&(t=e.fn[Mc],e.fn[Mc]=Wc.jQueryInterface,e.fn[Mc].Constructor=Wc,e.fn[Mc].noConflict=function(){return e.fn[Mc]=t,Wc.jQueryInterface});}),Wc);t(187);function Uc(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}var qc=function(){function a(t){var e=this,n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},r=2<arguments.length?arguments[2]:void 0,o=this,i=a;if(!(o instanceof i))throw new TypeError("Cannot call a class as a function");this._element=t,this._toggler=r,this._event=n.event||"blur",this._condition=n.condition||function(){return !0},this._selector=n.selector||'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',this._onlyVisible=n.onlyVisible||!1,this._focusableElements=[],this._firstElement=null,this._lastElement=null,this.handler=function(t){e._condition(t)&&t.target===e._lastElement&&(t.preventDefault(),e._firstElement.focus());};}var t,e;return t=a,(e=[{key:"trap",value:function(){this._setElements(),this._init(),this._setFocusTrap();}},{key:"disable",value:function(){var e=this;this._focusableElements.forEach(function(t){t.removeEventListener(e._event,e.handler);}),this._toggler&&this._toggler.focus();}},{key:"update",value:function(){this._setElements(),this._setFocusTrap();}},{key:"_init",value:function(){var n=this;window.addEventListener("keydown",function t(e){n._firstElement&&"Tab"===e.key&&!n._focusableElements.includes(e.target)&&(e.preventDefault(),n._firstElement.focus(),window.removeEventListener("keydown",t));});}},{key:"_filterVisible",value:function(t){return t.filter(function(t){if(!(e=t)||(!(e.style&&e.parentNode&&e.parentNode.style)||(n=getComputedStyle(e),e=getComputedStyle(e.parentNode),"none"===n.display||"none"===e.display||"hidden"===n.visibility)))return !1;for(var e,n,r=x.parents(t,"*"),o=0;o<r.length;o++){var i=window.getComputedStyle(r[o]);if(i&&("none"===i.display||"hidden"===i.visibility))return !1}return !0})}},{key:"_setElements",value:function(){this._focusableElements=x.find(this._selector,this._element),this._onlyVisible&&(this._focusableElements=this._filterVisible(this._focusableElements)),this._firstElement=this._focusableElements[0],this._lastElement=this._focusableElements[this._focusableElements.length-1];}},{key:"_setFocusTrap",value:function(){var n=this;this._focusableElements.forEach(function(t,e){e===n._focusableElements.length-1?t.addEventListener(n._event,n.handler):t.removeEventListener(n._event,n.handler);});}}])&&Uc(t.prototype,e),Object.defineProperty(t,"prototype",{writable:!1}),a}();t(188);function O(t){return t.getDate()}function Kc(t){return t.getDay()}function k(t){return t.getMonth()}function C(t){return t.getFullYear()}function $c(t){return Qc((t=t).getFullYear(),t.getMonth()+1,0).getDate()}function Xc(){return new Date}function y(t,e){return D(t,12*e)}function D(t,e){e=Qc(t.getFullYear(),t.getMonth()+e,t.getDate());return O(t)!==O(e)&&e.setDate(0),e}function Gc(t,e){return Qc(t.getFullYear(),t.getMonth(),t.getDate()+e)}function Qc(t,e,n){e=new Date(t,e,n);return 0<=t&&t<100&&e.setFullYear(e.getFullYear()-1900),e}function Zc(t){t=t.split("-");return Qc(t[0],t[1],t[2])}function Jc(t,e){return t.setHours(0,0,0,0),e.setHours(0,0,0,0),t.getTime()===e.getTime()}function ts(t,e){return ((C(t)-function(t,e,n){var r=0;n?(n=C(n),r=n-t+1):e&&(r=C(e));return r}())%e+e)%e}function es(t,e,n,r,o){return "days"===n?C(t)===C(e)&&k(t)===k(e):"months"===n?C(t)===C(e):"years"===n&&(C(e)>=o&&C(e)<=r)}function ns(t,e,n,r,o,i,a,c,s){var u,l,f=k(t),d=C(t),p=O(t),h=Kc(t),v=Va("div"),a="\n      ".concat((p=p,h=h,u=f,'\n      <div class="datepicker-header">\n        <div class="datepicker-title">\n          <span class="datepicker-title-text">'.concat((l=o).title,'</span>\n        </div>\n        <div class="datepicker-date">\n          <span class="datepicker-date-text">').concat(l.weekdaysShort[h],", ").concat(l.monthsShort[u]," ").concat(p,"</span>\n        </div>\n      </div>\n    ")),"\n      ").concat((h=t,l=e,u=n,p=r,t=i,e=a,n=c,'\n    <div class="datepicker-main">\n      '.concat(function(t,e,n){return '\n    <div class="datepicker-date-controls">\n      <button class="datepicker-view-change-button" aria-label="'.concat(n.switchToMultiYearViewLabel,'">\n        ').concat(n.monthsFull[t]," ").concat(e,'\n      </button>\n      <div class="datepicker-arrow-controls">\n        <button class="datepicker-previous-button" aria-label="').concat(n.prevMonthLabel,'"></button>\n        <button class="datepicker-next-button" aria-label="').concat(n.nextMonthLabel,'"></button>\n      </div>\n    </div>\n    ')}(f,r=d,i=o),'\n      <div class="datepicker-view" tabindex="0">\n        ').concat(function(t,e,n,r,o,i,a,c,s){n="days"===i.view?rs(t,n,i):"months"===i.view?os(e,r,o,i,a):is(t,r,0,c,s);return n}(h,r,l,u,p,i,t,e,n),"\n      </div>\n      ").concat(function(t){return '\n        <div class="datepicker-footer">\n          <button class="datepicker-footer-btn datepicker-clear-btn" aria-label="'.concat(t.clearBtnLabel,'">').concat(t.clearBtnText,'</button>\n          <button class="datepicker-footer-btn datepicker-cancel-btn" aria-label="').concat(t.cancelBtnLabel,'">').concat(t.cancelBtnText,'</button>\n          <button class="datepicker-footer-btn datepicker-ok-btn" aria-label="').concat(t.okBtnLabel,'">').concat(t.okBtnText,"</button>\n        </div>\n      ")}(i),"\n    </div>\n  ")),"\n    ");return S.addClass(v,"datepicker-modal-container"),S.addClass(v,"datepicker-modal-container-".concat(s)),v.innerHTML=a,v}function rs(t,e,n){t=function(t,e,n){for(var r=[],o=k(t),i=k(D(t,-1)),a=k(D(t,1)),c=C(t),s=function(t,e,n){return n=0<(n=n.startDay)?7-n:0,7<=(t=new Date(t,e).getDay()+n)?t-7:t}(c,o,n),u=$c(t),l=$c(D(t,-1)),f=1,d=!1,p=1;p<7;p++){var h=[];if(1===p){for(var v=l-s+1;v<=l;v++){var y=Qc(c,i,v);h.push({date:y,currentMonth:d,isSelected:e&&Jc(y,e),isToday:Jc(y,Xc()),dayNumber:O(y)});}d=!0;for(var m=7-h.length,g=0;g<m;g++){var b=Qc(c,o,f);h.push({date:b,currentMonth:d,isSelected:e&&Jc(b,e),isToday:Jc(b,Xc()),dayNumber:O(b)}),f++;}}else for(var _=1;_<8;_++){u<f&&(d=!(f=1));var w=Qc(c,d?o:a,f);h.push({date:w,currentMonth:d,isSelected:e&&Jc(w,e),isToday:Jc(w,Xc()),dayNumber:O(w)}),f++;}r.push(h);}return r}(t,e,n),e=n.weekdaysNarrow,e="\n      <tr>\n        ".concat(e.map(function(t,e){return '<th class="datepicker-day-heading" scope="col" aria-label="'.concat(n.weekdaysFull[e],'">').concat(t,"</th>")}).join(""),"\n      </tr>\n    "),t=t.map(function(t){return "\n        <tr>\n          ".concat(t.map(function(t){return '\n              <td\n              class="datepicker-cell datepicker-small-cell datepicker-day-cell\n              '.concat(t.currentMonth?"":"disabled"," ").concat(t.disabled?"disabled":"","\n              ").concat(t.isToday&&"current"," ").concat(t.isSelected&&"selected",'"\n              data-mdb-date="').concat(C(t.date),"-").concat(k(t.date),"-").concat(O(t.date),'"\n              aria-label="').concat(t.date,'"\n              aria-selected="').concat(t.isSelected,'">\n                <div\n                  class="datepicker-cell-content datepicker-small-cell-content"\n                  style="').concat(t.currentMonth?"display: block":"display: none",'">\n                  ').concat(t.dayNumber,"\n                  </div>\n              </td>\n            ")}).join(""),"\n        </tr>\n      ")}).join("");return '\n      <table class="datepicker-table">\n        <thead>\n          '.concat(e,'\n        </thead>\n        <tbody class="datepicker-table-body">\n         ').concat(t,"\n        </tbody>\n      </table>\n    ")}function os(n,r,o,i,t){var t=function(t,e){for(var n=[],r=[],o=0;o<t.monthsShort.length;o++){var i;r.push(t.monthsShort[o]),r.length===e&&(i=r,n.push(i),r=[]);}return n}(i,t),a=k(Xc()),t="\n      ".concat(t.map(function(t){return "\n          <tr>\n            ".concat(t.map(function(t){var e=i.monthsShort.indexOf(t);return '\n                <td class="datepicker-cell datepicker-large-cell datepicker-month-cell '.concat(e===o&&n===r?"selected":""," ").concat(e===a?"current":"",'" data-mdb-month="').concat(e,'" data-mdb-year="').concat(n,'" aria-label="').concat(t,", ").concat(n,'">\n                  <div class="datepicker-cell-content datepicker-large-cell-content">').concat(t,"</div>\n                </td>\n              ")}).join(""),"\n          </tr>\n        ")}).join(""),"\n    ");return '\n      <table class="datepicker-table">\n        <tbody class="datepicker-table-body">\n         '.concat(t,"\n        </tbody>\n      </table>\n    ")}function is(t,e,n,r,o){var t=function(t,e,n){for(var r=[],o=C(t),t=ts(t,e),i=o-t,a=[],c=0;c<e;c++){var s;a.push(i+c),a.length===n&&(s=a,r.push(s),a=[]);}return r}(t,r,o),i=C(Xc()),r="\n    ".concat(t.map(function(t){return "\n        <tr>\n          ".concat(t.map(function(t){return '\n              <td class="datepicker-cell datepicker-large-cell datepicker-year-cell '.concat(t===e?"selected":""," ").concat(t===i?"current":"",'" aria-label="').concat(t,'" data-mdb-year="').concat(t,'">\n                <div class="datepicker-cell-content datepicker-large-cell-content">').concat(t,"</div>\n              </td>\n            ")}).join(""),"\n        </tr>\n      ")}).join(""),"\n  ");return '\n      <table class="datepicker-table">\n        <tbody class="datepicker-table-body">\n        '.concat(r,"\n        </tbody>\n      </table>\n    ")}function as(t){return (as="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function cs(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function ss(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?cs(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):cs(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function us(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}var ls="datepicker",fs="mdb.datepicker",ds=".".concat(fs),ps="close".concat(ds),hs="open".concat(ds),vs="dateChange".concat(ds),ys="click".concat(ds).concat(".data-api"),ms={title:"Select date",monthsFull:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],weekdaysFull:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],weekdaysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],weekdaysNarrow:["S","M","T","W","T","F","S"],okBtnText:"Ok",clearBtnText:"Clear",cancelBtnText:"Cancel",okBtnLabel:"Confirm selection",clearBtnLabel:"Clear selection",cancelBtnLabel:"Cancel selection",nextMonthLabel:"Next month",prevMonthLabel:"Previous month",nextYearLabel:"Next year",prevYearLabel:"Previous year",nextMultiYearLabel:"Next 24 years",prevMultiYearLabel:"Previous 24 years",switchToMultiYearViewLabel:"Choose year and month",switchToMonthViewLabel:"Choose date",switchToDayViewLabel:"Choose date",startDate:null,startDay:0,format:"dd/mm/yyyy",view:"days",toggleButton:!0,disableToggleButton:!1,disableInput:!1},gs={title:"string",monthsFull:"array",monthsShort:"array",weekdaysFull:"array",weekdaysShort:"array",weekdaysNarrow:"array",okBtnText:"string",clearBtnText:"string",cancelBtnText:"string",okBtnLabel:"string",clearBtnLabel:"string",cancelBtnLabel:"string",nextMonthLabel:"string",prevMonthLabel:"string",nextYearLabel:"string",prevYearLabel:"string",nextMultiYearLabel:"string",prevMultiYearLabel:"string",switchToMultiYearViewLabel:"string",switchToMonthViewLabel:"string",switchToDayViewLabel:"string",startDate:"(null|string|date)",startDay:"number",format:"string",view:"string",toggleButton:"boolean",disableToggleButton:"boolean",disableInput:"boolean"},bs=function(){function n(t,e){if(!(this instanceof n))throw new TypeError("Cannot call a class as a function");this._element=t,this._input=x.findOne("input",this._element),this._options=this._getConfig(e),this._activeDate=new Date,this._selectedDate=null,this._selectedYear=null,this._selectedMonth=null,this._view=this._options.view,this._popper=null,this._focusTrap=null,this._isOpen=!1,this._toggleButtonId=Ra("datepicker-toggle-"),this._element&&v.setData(t,fs,this),this._init(),this.toggleButton&&this._options.disableToggle&&(this.toggleButton.disabled="true"),this._options.disableInput&&(this._input.disabled="true");}var t,e,r;return t=n,r=[{key:"NAME",get:function(){return ls}},{key:"getInstance",value:function(t){return v.getData(t,fs)}},{key:"getOrCreateInstance",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return this.getInstance(t)||new this(t,"object"===as(e)?e:null)}}],(e=[{key:"container",get:function(){return x.findOne(".datepicker-modal-container".concat("-",this._toggleButtonId))||x.findOne(".datepicker-dropdown-container".concat("-",this._toggleButtonId))}},{key:"options",get:function(){return this._options}},{key:"activeCell",get:function(){var t;return "days"===this._view&&(t=this._getActiveDayCell()),"months"===this._view&&(t=this._getActiveMonthCell()),t="years"===this._view?this._getActiveYearCell():t}},{key:"activeDay",get:function(){return O(this._activeDate)}},{key:"activeMonth",get:function(){return k(this._activeDate)}},{key:"activeYear",get:function(){return C(this._activeDate)}},{key:"firstYearInView",get:function(){return this.activeYear-ts(this._activeDate,24)}},{key:"lastYearInView",get:function(){return this.firstYearInView+24-1}},{key:"viewChangeButton",get:function(){return x.findOne(".datepicker-view-change-button",this.container)}},{key:"previousButton",get:function(){return x.findOne(".datepicker-previous-button",this.container)}},{key:"nextButton",get:function(){return x.findOne(".datepicker-next-button",this.container)}},{key:"okButton",get:function(){return x.findOne(".datepicker-ok-btn",this.container)}},{key:"cancelButton",get:function(){return x.findOne(".datepicker-cancel-btn",this.container)}},{key:"clearButton",get:function(){return x.findOne(".datepicker-clear-btn",this.container)}},{key:"datesContainer",get:function(){return x.findOne(".datepicker-view",this.container)}},{key:"toggleButton",get:function(){return x.findOne(".datepicker-toggle-button",this._element)}},{key:"_getConfig",value:function(t){var e=S.getDataAttributes(this._element);return t=ss(ss(ss({},ms),e),t),Ba(ls,t,gs),t.startDay&&0!==t.startDay&&(e=this._getNewDaysOrderArray(t),t.weekdaysNarrow=e),t}},{key:"_getNewDaysOrderArray",value:function(t){var e=t.startDay,t=t.weekdaysNarrow;return t.slice(e).concat(t.slice(0,e))}},{key:"_init",value:function(){!this.toggleButton&&this._options.toggleButton&&(this._appendToggleButton(),(this._input.readOnly||this._input.disabled)&&(this.toggleButton.style.pointerEvents="none")),this._listenToUserInput(),this._listenToToggleClick(),this._listenToToggleKeydown();}},{key:"_appendToggleButton",value:function(){var t='\n    <button id="'.concat(this._toggleButtonId,'" type="button" class="datepicker-toggle-button" data-mdb-toggle="datepicker">\n      <i class="far fa-calendar datepicker-toggle-icon"></i>\n    </button>\n  ');this._element.insertAdjacentHTML("beforeend",t),S.addClass(this._input,"form-icon-trailing");}},{key:"open",value:function(){var t,e,n=this;this._input.readOnly||this._input.disabled||(t=_.trigger(this._element,hs),this._isOpen||t.defaultPrevented||(this._setInitialDate(),t=Va("div"),S.addClass(t,"datepicker-backdrop"),t=t,e=ns(this._activeDate,this._selectedDate,this._selectedYear,this._selectedMonth,this._options,4,24,24,this._toggleButtonId),this._openModal(t,e),S.addClass(this.container,"animation"),S.addClass(this.container,"fade-in"),this.container.style.animationDuration="300ms",S.addClass(t,"animation"),S.addClass(t,"fade-in"),t.style.animationDuration="150ms",this._setFocusTrap(this.container),this._listenToDateSelection(),this._addControlsListeners(),this._listenToEscapeClick(),this._listenToKeyboardNavigation(),this._listenToDatesContainerFocus(),this._listenToDatesContainerBlur(),this._asyncFocusDatesContainer(),this._updateViewControlsAndAttributes(this._view),this._isOpen=!0,setTimeout(function(){n._listenToOutsideClick();},0)));}},{key:"_openDropdown",value:function(t){this._popper=en(this._input,t,{placement:"bottom-start"}),document.body.appendChild(t);}},{key:"_openModal",value:function(t,e){document.body.appendChild(t),document.body.appendChild(e);window.innerWidth>document.documentElement.clientWidth&&(document.body.style.overflow="hidden",document.body.style.paddingRight="15px");}},{key:"_setFocusTrap",value:function(t){this._focusTrap=new qc(t,{event:"keydown",condition:function(t){return "Tab"===t.key}}),this._focusTrap.trap();}},{key:"_listenToUserInput",value:function(){var e=this;_.on(this._input,"input",function(t){e._handleUserInput(t.target.value);});}},{key:"_listenToToggleClick",value:function(){var e=this;_.on(this._element,ys,'[data-mdb-toggle="datepicker"]',function(t){t.preventDefault(),e.open();});}},{key:"_listenToToggleKeydown",value:function(){var e=this;_.on(this._element,"keydown",'[data-mdb-toggle="datepicker"]',function(t){13!==t.keyCode||e._isOpen||e.open();});}},{key:"_listenToDateSelection",value:function(){var r=this;_.on(this.datesContainer,"click",function(t){var e,n=("DIV"===t.target.nodeName?t.target.parentNode:t.target).dataset,t="DIV"===t.target.nodeName?t.target.parentNode:t.target;n.mdbDate&&r._pickDay(n.mdbDate,t),n.mdbMonth&&n.mdbYear&&(t=parseInt(n.mdbMonth,10),e=parseInt(n.mdbYear,10),r._pickMonth(t,e)),n.mdbYear&&!n.mdbMonth&&(t=parseInt(n.mdbYear,10),r._pickYear(t)),r._updateHeaderDate(r._activeDate,r._options.monthsShort,r._options.weekdaysShort);});}},{key:"_updateHeaderDate",value:function(t,e,n){var r=x.findOne(".datepicker-date-text",this.container),o=k(t),i=O(t),t=Kc(t);r.innerHTML="".concat(n[t],", ").concat(e[o]," ").concat(i);}},{key:"_addControlsListeners",value:function(){var t=this;_.on(this.nextButton,"click",function(){"days"===t._view?t.nextMonth():"years"===t._view?t.nextYears():t.nextYear();}),_.on(this.previousButton,"click",function(){"days"===t._view?t.previousMonth():"years"===t._view?t.previousYears():t.previousYear();}),_.on(this.viewChangeButton,"click",function(){"days"===t._view?t._changeView("years"):"years"!==t._view&&"months"!==t._view||t._changeView("days");}),this._listenToFooterButtonsClick();}},{key:"_listenToFooterButtonsClick",value:function(){var t=this;_.on(this.okButton,"click",function(){return t.handleOk()}),_.on(this.cancelButton,"click",function(){return t.handleCancel()}),_.on(this.clearButton,"click",function(){return t.handleClear()});}},{key:"_listenToOutsideClick",value:function(){var n=this;_.on(document,ys,function(t){var e=t.target===n.container,t=n.container&&n.container.contains(t.target);e||t||n.close();});}},{key:"_listenToEscapeClick",value:function(){var e=this;_.on(document,"keydown",function(t){27===t.keyCode&&e._isOpen&&e.close();});}},{key:"_listenToKeyboardNavigation",value:function(){var e=this;_.on(this.datesContainer,"keydown",function(t){e._handleKeydown(t);});}},{key:"_listenToDatesContainerFocus",value:function(){var t=this;_.on(this.datesContainer,"focus",function(){t._focusActiveCell(t.activeCell);});}},{key:"_listenToDatesContainerBlur",value:function(){var t=this;_.on(this.datesContainer,"blur",function(){t._removeCurrentFocusStyles();});}},{key:"_handleKeydown",value:function(t){"days"===this._view&&this._handleDaysViewKeydown(t),"months"===this._view&&this._handleMonthsViewKeydown(t),"years"===this._view&&this._handleYearsViewKeydown(t);}},{key:"_handleDaysViewKeydown",value:function(t){var e=this._activeDate,n=this.activeCell;switch(t.keyCode){case 37:this._activeDate=Gc(this._activeDate,-1);break;case 39:this._activeDate=Gc(this._activeDate,1);break;case 38:this._activeDate=Gc(this._activeDate,-7);break;case 40:this._activeDate=Gc(this._activeDate,7);break;case 36:this._activeDate=Gc(this._activeDate,1-O(this._activeDate));break;case 35:this._activeDate=Gc(this._activeDate,$c(this._activeDate)-O(this._activeDate));break;case 33:this._activeDate=D(this._activeDate,-1);break;case 34:this._activeDate=D(this._activeDate,1);break;case 13:case 32:return this._selectDate(this._activeDate),void t.preventDefault();default:return}es(e,this._activeDate,this._view,24,0)||this._changeView("days"),this._removeHighlightFromCell(n),this._focusActiveCell(this.activeCell),t.preventDefault();}},{key:"_asyncFocusDatesContainer",value:function(){var t=this;setTimeout(function(){t.datesContainer.focus();},0);}},{key:"_focusActiveCell",value:function(t){t&&S.addClass(t,"focused");}},{key:"_removeHighlightFromCell",value:function(t){t&&t.classList.remove("focused");}},{key:"_getActiveDayCell",value:function(){var e=this,t=x.find("td",this.datesContainer);return Array.from(t).find(function(t){return Jc(Zc(t.dataset.mdbDate),e._activeDate)})}},{key:"_handleMonthsViewKeydown",value:function(t){var e=this._activeDate,n=this.activeCell;switch(t.keyCode){case 37:this._activeDate=D(this._activeDate,-1);break;case 39:this._activeDate=D(this._activeDate,1);break;case 38:this._activeDate=D(this._activeDate,-4);break;case 40:this._activeDate=D(this._activeDate,4);break;case 36:this._activeDate=D(this._activeDate,-this.activeMonth);break;case 35:this._activeDate=D(this._activeDate,11-this.activeMonth);break;case 33:this._activeDate=y(this._activeDate,-1);break;case 34:this._activeDate=y(this._activeDate,1);break;case 13:case 32:return void this._selectMonth(this.activeMonth);default:return}es(e,this._activeDate,this._view,24,0)||this._changeView("months"),this._removeHighlightFromCell(n),this._focusActiveCell(this.activeCell),t.preventDefault();}},{key:"_getActiveMonthCell",value:function(){var n=this,t=x.find("td",this.datesContainer);return Array.from(t).find(function(t){var e=parseInt(t.dataset.mdbYear,10),t=parseInt(t.dataset.mdbMonth,10);return e===n.activeYear&&t===n.activeMonth})}},{key:"_handleYearsViewKeydown",value:function(t){var e=this._activeDate,n=this.activeCell;switch(t.keyCode){case 37:this._activeDate=y(this._activeDate,-1);break;case 39:this._activeDate=y(this._activeDate,1);break;case 38:this._activeDate=y(this._activeDate,-4);break;case 40:this._activeDate=y(this._activeDate,4);break;case 36:this._activeDate=y(this._activeDate,-ts(this._activeDate,24));break;case 35:this._activeDate=y(this._activeDate,24-ts(this._activeDate,24)-1);break;case 33:this._activeDate=y(this._activeDate,-24);break;case 34:this._activeDate=y(this._activeDate,24);break;case 13:case 32:return void this._selectYear(this.activeYear);default:return}es(e,this._activeDate,this._view,24,0)||this._changeView("years"),this._removeHighlightFromCell(n),this._focusActiveCell(this.activeCell),t.preventDefault();}},{key:"_getActiveYearCell",value:function(){var e=this,t=x.find("td",this.datesContainer);return Array.from(t).find(function(t){return parseInt(t.dataset.mdbYear,10)===e.activeYear})}},{key:"_setInitialDate",value:function(){this._input.value?this._handleUserInput(this._input.value):this._options.startDate?this._activeDate=new Date(this._options.startDate):this._activeDate=new Date;}},{key:"close",value:function(){var t=_.trigger(this._element,ps);this._isOpen&&!t.defaultPrevented&&(this._removeDatepickerListeners(),S.addClass(this.container,"animation"),S.addClass(this.container,"fade-out"),this._closeModal(),this._isOpen=!1,this._view=this._options.view,(this.toggleButton||this._input).focus());}},{key:"_closeDropdown",value:function(){var t=this,e=x.findOne(".datepicker-dropdown-container");e.addEventListener("animationend",function(){e&&document.body.removeChild(e),t._popper&&t._popper.destroy();}),this._removeFocusTrap();}},{key:"_closeModal",value:function(){var t=x.findOne(".datepicker-backdrop"),e=x.findOne(".datepicker-modal-container");S.addClass(t,"animation"),S.addClass(t,"fade-out"),e&&t&&t.addEventListener("animationend",function(){document.body.removeChild(t),document.body.removeChild(e),document.body.style.overflow="",document.body.style.paddingRight="";});}},{key:"_removeFocusTrap",value:function(){this._focusTrap&&(this._focusTrap.disable(),this._focusTrap=null);}},{key:"_removeDatepickerListeners",value:function(){_.off(this.nextButton,"click"),_.off(this.previousButton,"click"),_.off(this.viewChangeButton,"click"),_.off(this.okButton,"click"),_.off(this.cancelButton,"click"),_.off(this.clearButton,"click"),_.off(this.datesContainer,"click"),_.off(this.datesContainer,"keydown"),_.off(this.datesContainer,"focus"),_.off(this.datesContainer,"blur"),_.off(document,ys);}},{key:"dispose",value:function(){this._isOpen&&this.close(),this._removeInputAndToggleListeners();var t=x.findOne("#".concat(this._toggleButtonId));t&&this._element.removeChild(t),v.removeData(this._element,fs),this._element=null,this._input=null,this._options=null,this._activeDate=null,this._selectedDate=null,this._selectedYear=null,this._selectedMonth=null,this._view=null,this._popper=null,this._focusTrap=null;}},{key:"_removeInputAndToggleListeners",value:function(){_.off(this._input,"input"),_.off(this._element,ys,'[data-mdb-toggle="datepicker"]'),_.off(this._element,"keydown",'[data-mdb-toggle="datepicker"]');}},{key:"handleOk",value:function(){this._confirmSelection(this._selectedDate),this.close();}},{key:"_selectDate",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:this.activeCell;this._removeCurrentSelectionStyles(),this._removeCurrentFocusStyles(),this._addSelectedStyles(e),this._selectedDate=t;}},{key:"_selectYear",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:this.activeCell;this._removeCurrentSelectionStyles(),this._removeCurrentFocusStyles(),this._addSelectedStyles(e),this._selectedYear=t,this._asyncChangeView("months");}},{key:"_selectMonth",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:this.activeCell;this._removeCurrentSelectionStyles(),this._removeCurrentFocusStyles(),this._addSelectedStyles(e),this._selectedMonth=t,this._asyncChangeView("days");}},{key:"_removeSelectedStyles",value:function(t){t&&t.classList.remove("selected");}},{key:"_addSelectedStyles",value:function(t){t&&S.addClass(t,"selected");}},{key:"_confirmSelection",value:function(t){var e;t&&(e=this.formatDate(t),this._input.value=e,S.addClass(this._input,"active"),_.trigger(this._element,vs,{date:t}));}},{key:"handleCancel",value:function(){this._selectedDate=null,this._selectedYear=null,this._selectedMonth=null,this.close();}},{key:"handleClear",value:function(){this._selectedDate=null,this._selectedMonth=null,this._selectedYear=null,this._removeCurrentSelectionStyles(),this._input.value="",this._input.classList.remove("active"),this._setInitialDate(),this._changeView("days");}},{key:"_removeCurrentSelectionStyles",value:function(){var t=x.findOne(".selected",this.container);t&&t.classList.remove("selected");}},{key:"_removeCurrentFocusStyles",value:function(){var t=x.findOne(".focused",this.container);t&&t.classList.remove("focused");}},{key:"formatDate",value:function(t){var e=O(t),n=this._addLeadingZero(O(t)),r=this._options.weekdaysShort[Kc(t)],o=this._options.weekdaysFull[Kc(t)],i=k(t)+1,a=this._addLeadingZero(k(t)+1),c=this._options.monthsShort[k(t)],s=this._options.monthsFull[k(t)],u=2===C(t).toString().length?C(t):C(t).toString().slice(2,4),l=C(t),t=this._options.format.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g),f="";return t.forEach(function(t){switch(t){case"dddd":t=t.replace(t,o);break;case"ddd":t=t.replace(t,r);break;case"dd":t=t.replace(t,n);break;case"d":t=t.replace(t,e);break;case"mmmm":t=t.replace(t,s);break;case"mmm":t=t.replace(t,c);break;case"mm":t=t.replace(t,a);break;case"m":t=t.replace(t,i);break;case"yyyy":t=t.replace(t,l);break;case"yy":t=t.replace(t,u);}f+=t;}),f}},{key:"_addLeadingZero",value:function(t){return parseInt(t,10)<10?"0".concat(t):t}},{key:"_pickDay",value:function(t,e){t=Zc(t);this._activeDate=t,this._selectDate(t,e);}},{key:"_pickYear",value:function(t){var e=Qc(t,this.activeMonth,this.activeDay);this._activeDate=e,this._selectedDate=e,this._selectYear(t);}},{key:"_pickMonth",value:function(t,e){e=Qc(e,t,this.activeDay);this._activeDate=e,this._selectMonth(t);}},{key:"nextMonth",value:function(){var t,e=rs(t=D(this._activeDate,1),this._selectedDate,this._options);this._activeDate=t,this.viewChangeButton.textContent="".concat(this._options.monthsFull[this.activeMonth]," ").concat(this.activeYear),this.datesContainer.innerHTML=e;}},{key:"previousMonth",value:function(){var t=D(this._activeDate,-1),t=rs(this._activeDate=t,this._selectedDate,this._options);this.viewChangeButton.textContent="".concat(this._options.monthsFull[this.activeMonth]," ").concat(this.activeYear),this.datesContainer.innerHTML=t;}},{key:"nextYear",value:function(){var t=y(this._activeDate,1),t=(this._activeDate=t,this.viewChangeButton.textContent="".concat(this.activeYear),os(this.activeYear,this._selectedYear,this._selectedMonth,this._options,4));this.datesContainer.innerHTML=t;}},{key:"previousYear",value:function(){var t=y(this._activeDate,-1),t=(this._activeDate=t,this.viewChangeButton.textContent="".concat(this.activeYear),os(this.activeYear,this._selectedYear,this._selectedMonth,this._options,4));this.datesContainer.innerHTML=t;}},{key:"nextYears",value:function(){var t=y(this._activeDate,24),t=is(this._activeDate=t,this._selectedYear,this._options,24,4);this.viewChangeButton.textContent="".concat(this.firstYearInView," - ").concat(this.lastYearInView),this.datesContainer.innerHTML=t;}},{key:"previousYears",value:function(){var t=y(this._activeDate,-24),t=is(this._activeDate=t,this._selectedYear,this._options,24,4);this.viewChangeButton.textContent="".concat(this.firstYearInView," - ").concat(this.lastYearInView),this.datesContainer.innerHTML=t;}},{key:"_asyncChangeView",value:function(t){var e=this;setTimeout(function(){e._changeView(t);},0);}},{key:"_changeView",value:function(t){this._view=t,this.datesContainer.blur(),"days"===t&&(this.datesContainer.innerHTML=rs(this._activeDate,this._selectedDate,this._options)),"months"===t&&(this.datesContainer.innerHTML=os(this.activeYear,this._selectedYear,this._selectedMonth,this._options,4)),"years"===t&&(this.datesContainer.innerHTML=is(this._activeDate,this._selectedYear,this._options,24,4)),this.datesContainer.focus(),this._updateViewControlsAndAttributes(t);}},{key:"_updateViewControlsAndAttributes",value:function(t){"days"===t&&(this.viewChangeButton.textContent="".concat(this._options.monthsFull[this.activeMonth]," ").concat(this.activeYear),this.viewChangeButton.setAttribute("aria-label",this._options.switchToMultiYearViewLabel),this.previousButton.setAttribute("aria-label",this._options.prevMonthLabel),this.nextButton.setAttribute("aria-label",this._options.nextMonthLabel)),"months"===t&&(this.viewChangeButton.textContent="".concat(this.activeYear),this.viewChangeButton.setAttribute("aria-label",this._options.switchToDayViewLabel),this.previousButton.setAttribute("aria-label",this._options.prevYearLabel),this.nextButton.setAttribute("aria-label",this._options.nextYearLabel)),"years"===t&&(this.viewChangeButton.textContent="".concat(this.firstYearInView," - ").concat(this.lastYearInView),this.viewChangeButton.setAttribute("aria-label",this._options.switchToMonthViewLabel),this.previousButton.setAttribute("aria-label",this._options.prevMultiYearLabel),this.nextButton.setAttribute("aria-label",this._options.nextMultiYearLabel));}},{key:"_handleUserInput",value:function(t){var e=this._getDelimeters(this._options.format),t=this._parseDate(t,this._options.format,e);Number.isNaN(t.getTime())?(this._activeDate=new Date,this._selectedDate=null,this._selectedMonth=null,this._selectedYear=null):(this._activeDate=t,this._selectedDate=t);}},{key:"_getDelimeters",value:function(t){return t.match(/[^(dmy)]{1,}/g)}},{key:"_parseDate",value:function(t,e,n){for(var n=n[0]!==n[1]?n[0]+n[1]:n[0],n=new RegExp("[".concat(n,"]")),r=t.split(n),o=e.split(n),t=-1!==e.indexOf("mmm"),i=[],a=0;a<o.length;a++)-1!==o[a].indexOf("yy")&&(i[0]={value:r[a],format:o[a]}),-1!==o[a].indexOf("m")&&(i[1]={value:r[a],format:o[a]}),-1!==o[a].indexOf("d")&&o[a].length<=2&&(i[2]={value:r[a],format:o[a]});n=-1!==e.indexOf("mmmm")?this._options.monthsFull:this._options.monthsShort;return Qc(Number(i[0].value),t?this.getMonthNumberByMonthName(i[1].value,n):Number(i[1].value)-1,Number(i[2].value))}},{key:"getMonthNumberByMonthName",value:function(e,t){return t.findIndex(function(t){return t===e})}}])&&us(t.prototype,e),r&&us(t,r),Object.defineProperty(t,"prototype",{writable:!1}),n}(),ds=bs;x.find(".datepicker").forEach(function(t){var e=bs.getInstance(t);e||new bs(t);}),t(189),t(191);function _s(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var r,o,i=[],a=!0,c=!1;try{for(n=n.call(t);!(a=(r=n.next()).done)&&(i.push(r.value),!e||i.length!==e);a=!0);}catch(t){c=!0,o=t;}finally{try{a||null==n.return||n.return();}finally{if(c)throw o}}return i}}(t,e)||function(t,e){if(t){if("string"==typeof t)return ws(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?ws(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function ws(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function Os(t,e){var n=t.clientX,r=t.clientY,t=t.touches,o=2<arguments.length&&void 0!==arguments[2]&&arguments[2],e=e.getBoundingClientRect(),i=e.left,e=e.top,a={};return o&&t?o&&0<Object.keys(t).length&&(a={x:t[0].clientX-i,y:t[0].clientY-e}):a={x:n-i,y:r-e},a}function ks(){return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}var Cs=function(t){return t&&"[object Date]"===Object.prototype.toString.call(t)&&!isNaN(t)},P=function(t){t=(!(1<arguments.length&&void 0!==arguments[1])||arguments[1]?t.value:t).replace(/:/gi," ");return t.split(" ")};function Ss(t){return (Ss="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function xs(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function Es(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?xs(Object(n),!0).forEach(function(t){Ms(e,t,n[t]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):xs(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t));});}return e}function js(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var r,o,i=[],a=!0,c=!1;try{for(n=n.call(t);!(a=(r=n.next()).done)&&(i.push(r.value),!e||i.length!==e);a=!0);}catch(t){c=!0,o=t;}finally{try{a||null==n.return||n.return();}finally{if(c)throw o}}return i}}(t,e)||As(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function Ts(t){return function(t){if(Array.isArray(t))return Ds(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||As(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function As(t,e){if(t){if("string"==typeof t)return Ds(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Ds(t,e):void 0}}function Ds(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function Ps(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}function Ms(t,e,n){e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n;}var m="timepicker",Is="mdb.".concat(m),M="active",Ls="".concat(m,"-am"),Ns="".concat(m,"-cancel"),Rs="".concat(m,"-clear"),Bs="".concat(m,"-submit"),Hs="".concat(m,"-circle"),Fs="".concat(m,"-clock-animation"),Vs="".concat(m,"-clock"),Ys="".concat(m,"-clock-inner"),Ws="".concat(m,"-clock-wrapper"),zs=".".concat(m,"-current"),Us="".concat(m,"-current-inline"),qs="".concat(m,"-hand-pointer"),Ks="".concat(m,"-hour"),$s="".concat(m,"-hour-mode"),Xs="".concat(m,"-icon-down"),Gs="".concat(m,"-icon-inline-hour"),Qs="".concat(m,"-icon-inline-minute"),Zs="".concat(m,"-icon-up"),Js="".concat(m,"-inline-hour-icons"),tu="".concat(m,"-middle-dot"),eu="".concat(m,"-minute"),nu="".concat(m,"-modal"),ru="".concat(m,"-pm"),ou="".concat(m,"-tips-element"),iu="".concat(m,"-time-tips-hours"),au="".concat(m,"-tips-inner-element"),cu="".concat(m,"-time-tips-inner"),I="".concat(m,"-time-tips-minutes"),su="".concat(m,"-transform"),uu="".concat(m,"-wrapper"),lu="".concat(m,"-input"),fu={appendValidationInfo:!0,bodyID:"",cancelLabel:"Cancel",clearLabel:"Clear",closeModalOnBackdropClick:!0,closeModalOnMinutesClick:!1,defaultTime:"",disabled:!1,focusInputAfterApprove:!1,footerID:"",format12:!0,headID:"",increment:!1,invalidLabel:"Invalid Time Format",maxHour:"",minHour:"",maxTime:"",minTime:"",modalID:"",okLabel:"Ok",overflowHidden:!0,pickerID:"",readOnly:!1,showClearBtn:!0,switchHoursToMinutesOnClick:!0,iconClass:"far fa-clock fa-sm timepicker-icon",withIcon:!0,pmLabel:"PM",amLabel:"AM"},du={appendValidationInfo:"boolean",bodyID:"string",cancelLabel:"string",clearLabel:"string",closeModalOnBackdropClick:"boolean",closeModalOnMinutesClick:"boolean",disabled:"boolean",footerID:"string",format12:"boolean",headID:"string",increment:"boolean",invalidLabel:"string",maxHour:"(string|number)",minHour:"(string|number)",modalID:"string",okLabel:"string",overflowHidden:"boolean",pickerID:"string",readOnly:"boolean",showClearBtn:"boolean",switchHoursToMinutesOnClick:"boolean",defaultTime:"(string|date|number)",iconClass:"string",withIcon:"boolean",pmLabel:"string",amLabel:"string"},pu=function(){function o(t){var C=this,e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},n=this,r=o;if(!(n instanceof r))throw new TypeError("Cannot call a class as a function");Ms(this,"_toggleBackgroundColorCircle",function(t){null!==C._modal.querySelector(".".concat(t,".").concat(M))?S.addStyle(C._circle,{backgroundColor:"#1976d2"}):S.addStyle(C._circle,{backgroundColor:"transparent"});}),Ms(this,"_toggleClassActive",function(t,e,n){var r=e.textContent,o=Ts(t).find(function(t){return Number(t)===Number(r)});return n.forEach(function(t){S.hasClass(t,"disabled")||(t.textContent===o?S.addClass(t,M):S.removeClass(t,M));})}),Ms(this,"_makeMinutesDegrees",function(t,e){var n=C._options.increment;return t=t<0?(e=Math.round(360+t/6)%60,360+6*Math.round(t/6)):(e=Math.round(t/6)%60,6*Math.round(t/6)),n&&(t=30*Math.round(t/30),60===(e=6*Math.round(t/6)/6)&&(e="00")),{degrees:t=360<=t?0:t,minute:e,addDegrees:n?30:6}}),Ms(this,"_makeHourDegrees",function(t,e,n){var r=C._options,o=r.maxHour,r=r.minHour;if(t&&(S.hasClass(t,Ys)||S.hasClass(t,cu)||S.hasClass(t,au)?e<0?(n=Math.round(360+e/30)%24,e=360+e):12===(n=Math.round(e/30)+12)&&(n="00"):e<0?(n=Math.round(360+e/30)%12,e=360+e):(0===(n=Math.round(e/30)%12)||12<n)&&(n=12),360<=e&&(e=0),!(""!==o&&n>Number(o)||""!==r&&n<Number(r))))return {degrees:e,hour:n,addDegrees:30}}),Ms(this,"_makeInnerHoursDegrees",function(t,e){return t<0?(e=Math.round(360+t/30)%24,t=360+t):12===(e=Math.round(t/30)+12)&&(e="00"),{degrees:t,hour:e,addDegrees:30}}),Ms(this,"_getAppendClock",function(){var a,c,s,u=0<arguments.length&&void 0!==arguments[0]?arguments[0]:[],t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:".".concat(Vs),l=2<arguments.length?arguments[2]:void 0,e=C._options,f=e.maxHour,d=e.minHour,p=e.minTime,h=e.maxTime,n=e.inline,e=e.format12,r=js(P(h,!1),3),v=r[0],y=r[1],m=r[2],r=js(P(p,!1),3),g=r[0],b=r[1],_=r[2],w=(n||e&&C._isInvalidTimeFormat&&!S.hasClass(C._AM,"active")&&S.addClass(C._PM,"active"),x.findOne(".".concat($s,".").concat(M))),O=x.findOne(t),k=360/u.length;null!==O&&(a=(O.offsetWidth-32)/2,c=(O.offsetHeight-32)/2,s=a-4,Ts(u).forEach(function(t,e){var e=e*k*(Math.PI/180),n=Va("span"),r=Va("span"),o=(r.innerHTML=t,S.addClass(n,l),n.offsetWidth),i=n.offsetHeight;return S.addStyle(n,{left:"".concat(a+Math.sin(e)*s-o,"px"),bottom:"".concat(c+Math.cos(e)*s-i,"px")}),u.includes("05")&&S.addClass(n,"".concat(I)),u.includes("13")?r.classList.add(au):r.classList.add(ou),S.hasClass(n,"".concat(I))?S.hasClass(n,"".concat(I))&&(""!==h&&Number(t)>Number(y)&&Number(C._hour.textContent)>=Number(v)&&S.addClass(n,"disabled"),""!==p&&Number(t)<Number(b)&&Number(C._hour.textContent)<=Number(g)&&S.addClass(n,"disabled"),""!==h&&void 0!==m&&("PM"===m&&"PM"===w.textContent?Number(t)>Number(y)&&Number(C._hour.textContent)>=Number(v)&&S.addClass(n,"disabled"):"PM"===m&&"AM"===w.textContent&&S.removeClass(n,"disabled"),("AM"===m&&"PM"===w.textContent||"AM"===m&&"AM"===w.textContent&&Number(C._hour.textContent)>=Number(v)&&Number(t)>Number(y))&&S.addClass(n,"disabled")),""!==p&&void 0!==_&&("PM"===_&&"PM"===w.textContent?(Number(t)<Number(b)&&Number(C._hour.textContent)===Number(g)||Number(C._hour.textContent)<Number(g))&&S.addClass(n,"disabled"):"PM"===_&&"AM"===w.textContent&&S.addClass(n,"disabled"),"AM"===_&&"PM"===w.textContent?S.removeClass(n,"disabled"):"AM"===_&&"AM"===w.textContent&&(Number(C._hour.textContent)===Number(g)&&Number(t)<Number(b)||Number(C._hour.textContent)<Number(g))&&S.addClass(n,"disabled"))):(""!==f&&Number(t)>Number(f)&&S.addClass(n,"disabled"),""!==d&&Number(t)<Number(d)&&S.addClass(n,"disabled"),""!==h&&(void 0!==m?("PM"===m&&"PM"===w.textContent&&(C._isAmEnabled=!1,C._isPmEnabled=!0,Number(t)>Number(v)&&S.addClass(n,"disabled")),"AM"===m&&"PM"===w.textContent?(C._isAmEnabled=!1,C._isPmEnabled=!0,S.addClass(n,"disabled")):"AM"===m&&"AM"===w.textContent&&(C._isAmEnabled=!0,C._isPmEnabled=!1,Number(t)>Number(v)&&S.addClass(n,"disabled"))):Number(t)>Number(v)&&S.addClass(n,"disabled")),""!==p&&Number(t)<Number(g)&&S.addClass(n,"disabled"),""!==p&&void 0!==_&&("PM"===_&&"PM"===w.textContent?(C._isAmEnabled=!1,C._isPmEnabled=!0,Number(t)<Number(g)&&S.addClass(n,"disabled")):"PM"===_&&"AM"===w.textContent&&(C._isAmEnabled=!0,C._isPmEnabled=!1,S.addClass(n,"disabled")),"AM"===_&&"PM"===w.textContent?(C._isAmEnabled=!1,C._isPmEnabled=!0,S.removeClass(n,"disabled")):"AM"===_&&"AM"===w.textContent&&(C._isAmEnabled=!0,C._isPmEnabled=!1,Number(t)<Number(g)&&S.addClass(n,"disabled")))),n.appendChild(r),O.appendChild(n)}));}),this._element=t,this._element&&v.setData(t,Is,this),this._document=document,this._options=this._getConfig(e),this._currentTime=null,this._toggleButtonId=Ra("timepicker-toggle-"),this.hoursArray=["12","1","2","3","4","5","6","7","8","9","10","11"],this.innerHours=["00","13","14","15","16","17","18","19","20","21","22","23"],this.minutesArray=["00","05","10","15","20","25","30","35","40","45","50","55"],this.input=x.findOne("input",this._element),this.dataWithIcon=t.dataset.withIcon,this.dataToggle=t.dataset.toggle,this.customIcon=x.findOne(".timepicker-toggle-button",this._element),this._checkToggleButton(),this.inputFormatShow=x.findOne("[data-mdb-timepicker-format24]",this._element),this.inputFormat=null===this.inputFormatShow?"":Object.values(this.inputFormatShow.dataset)[0],this.elementToggle=x.findOne("[data-mdb-toggle]",this._element),this.toggleElement=Object.values(t.querySelector("[data-mdb-toggle]").dataset)[0],this._hour=null,this._minutes=null,this._AM=null,this._PM=null,this._wrapper=null,this._modal=null,this._hand=null,this._circle=null,this._focusTrap=null,this._popper=null,this._interval=null,this._inputValue=""!==this._options.defaultTime?this._options.defaultTime:this.input.value,this._options.format12&&(this._currentTime=function(t){var e,n,r;if(""!==t)return Cs(t)?(e=t.getHours(),0===(e%=12)&&(r="AM"),e=e||12,void 0===r&&(r=12<=e?"PM":"AM"),n=(n=t.getMinutes())<10?"0".concat(n):n):(e=(t=_s(P(t,!1),3))[0],n=t[1],r=t[2],0===(e%=12)&&(r="AM"),e=e||12,void 0===r&&(r=12<=e?"PM":"AM")),{hours:e,minutes:n,amOrPm:r}}(this._inputValue)),this._options.readOnly&&this.input.setAttribute("readonly",!0),this.init(),this._isHours=!0,this._isMinutes=!1,this._isInvalidTimeFormat=!1,this._isMouseMove=!1,this._isInner=!1,this._isAmEnabled=!1,this._isPmEnabled=!1,this._objWithDataOnChange={degrees:null};}var t,e,n;return t=o,n=[{key:"NAME",get:function(){return m}},{key:"getInstance",value:function(t){return v.getData(t,Is)}},{key:"getOrCreateInstance",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return this.getInstance(t)||new this(t,"object"===Ss(e)?e:null)}}],(e=[{key:"init",value:function(){var t,e,n,r;S.addClass(this.input,lu),void 0!==this._currentTime?(n=(t=this._currentTime).hours,r=t.minutes,t=t.amOrPm,e=Number(n)<10?0:"",n="".concat(e).concat(Number(n),":").concat(r),r=t,this.input.value="".concat(n," ").concat(r)):this.input.value=r=n=e="",0<this.input.value.length&&""!==this.input.value&&S.addClass(this.input,"active"),null===this._options&&null===this._element||(this._handleOpen(),this._listenToToggleKeydown());}},{key:"dispose",value:function(){this._removeModal(),null!==this._element&&v.removeData(this._element,Is),this._element=null,this._options=null,this.input=null,this._focusTrap=null,_.off(this._document,"click","[data-mdb-toggle='".concat(this.toggleElement,"']")),_.off(this._element,"keydown","[data-mdb-toggle='".concat(this.toggleElement,"']"));}},{key:"_checkToggleButton",value:function(){null===this.customIcon&&(void 0!==this.dataWithIcon&&(this._options.withIcon=null,"true"===this.dataWithIcon&&this._appendToggleButton(this._options)),this._options.withIcon&&this._appendToggleButton(this._options));}},{key:"_appendToggleButton",value:function(){var t=function(t,e){t=t.iconClass;return '\n  <button id="'.concat(e,'" tabindex="0" type="button" class="timepicker-toggle-button" data-mdb-toggle="timepicker"  >\n    <i class="').concat(t,'"></i>\n  </button>\n')}(this._options,this._toggleButtonId);this.input.insertAdjacentHTML("afterend",t);}},{key:"_getDomElements",value:function(){this._hour=x.findOne(".".concat(Ks)),this._minutes=x.findOne(".".concat(eu)),this._AM=x.findOne(".".concat(Ls)),this._PM=x.findOne(".".concat(ru)),this._wrapper=x.findOne(".".concat(uu)),this._modal=x.findOne(".".concat(nu)),this._hand=x.findOne(".".concat(qs)),this._circle=x.findOne(".".concat(Hs)),this._clock=x.findOne(".".concat(Vs)),this._clockInner=x.findOne(".".concat(Ys));}},{key:"_handlerMaxMinHoursOptions",value:function(t,e,n,r,o,i){var a=""!==n?30*n:"",c=""!==r?30*r:"";if(""!==n&&""!==r){if((t=t<=0?360+t:t)<=a&&c<=t)return e()}else if(""!==r){if(t<=0&&(t=360+t),(c=12<Number(r)?30*r-c:c)<=t&&void 0===i)return e();if(void 0!==i){if("PM"===i&&this._isAmEnabled)return;if("PM"===i&&this._isPmEnabled&&c<=t)return e();if("AM"===i&&this._isPmEnabled)return e();if("AM"===i&&this._isAmEnabled&&c<=t)return e()}}else {if(""===n)return e();if((t=t<=0?360+t:t)<=a&&void 0===o)return e();if(void 0!==o){if("AM"===o&&this._isPmEnabled)return;if("AM"===o&&this._isAmEnabled&&t<=a)return e();if("PM"===o&&this._isPmEnabled){if(t<=a)return e()}else if("PM"===o&&this._isAmEnabled)return e()}}return e}},{key:"_handleKeyboard",value:function(){var b=this;_.on(this._document,"keydown","",function(t){var e,n=b._options,r=n.maxHour,o=n.minHour,n=n.increment,i=null!==x.findOne(".".concat(I)),a=null!==x.findOne(".".concat(cu)),c=Number(b._hand.style.transform.replace(/[^\d-]/g,"")),s=x.find(".".concat(I),b._modal),u=x.find(".".concat(iu),b._modal),l=x.find(".".concat(cu),b._modal),f=""!==r?Number(r):"",d=""!==o?Number(o):"",p=b._makeHourDegrees(t.target,c,void 0).hour,h=b._makeHourDegrees(t.target,c,void 0),v=h.degrees,y=h.addDegrees,h=b._makeMinutesDegrees(c,void 0),m=h.minute,h=h.degrees,g=b._makeMinutesDegrees(c,void 0).addDegrees,c=b._makeInnerHoursDegrees(c,void 0).hour;27===t.keyCode&&(e=x.findOne(".".concat(Ns),b._modal),_.trigger(e,"click")),i?(38===t.keyCode&&(S.addStyle(b._hand,{transform:"rotateZ(".concat(h+=g,"deg)")}),m+=1,n&&"0014"===(m+=4)&&(m=5),b._minutes.textContent=b._setHourOrMinute(59<m?0:m),b._toggleClassActive(b.minutesArray,b._minutes,s),b._toggleBackgroundColorCircle("".concat(I))),40===t.keyCode&&(S.addStyle(b._hand,{transform:"rotateZ(".concat(h-=g,"deg)")}),n?m-=5:--m,-1===m?m=59:-5===m&&(m=55),b._minutes.textContent=b._setHourOrMinute(m),b._toggleClassActive(b.minutesArray,b._minutes,s),b._toggleBackgroundColorCircle("".concat(I)))):(a&&(39===t.keyCode&&(b._isInner=!1,S.addStyle(b._hand,{height:"calc(40% + 1px)"}),b._hour.textContent=b._setHourOrMinute(12<p?1:p),b._toggleClassActive(b.hoursArray,b._hour,u),b._toggleClassActive(b.innerHours,b._hour,l)),37===t.keyCode&&(b._isInner=!0,S.addStyle(b._hand,{height:"21.5%"}),b._hour.textContent=b._setHourOrMinute(24<=c||"00"===c?0:c),b._toggleClassActive(b.innerHours,b._hour,l),b._toggleClassActive(b.hoursArray,b._hour-1,u))),38===t.keyCode&&(b._handlerMaxMinHoursOptions(v+30,function(){return S.addStyle(b._hand,{transform:"rotateZ(".concat(v+y,"deg)")})},r,o),b._isInner?(24===(c+=1)?c=0:25!==c&&"001"!==c||(c=13),b._hour.textContent=b._setHourOrMinute(c),b._toggleClassActive(b.innerHours,b._hour,l)):(p+=1,""!==r&&""!==o?r<p?p=f:p<o&&(p=d):""!==r&&""===o?r<p&&(p=f):""===r&&""!==o&&12<=p&&(p=12),b._hour.textContent=b._setHourOrMinute(12<p?1:p),b._toggleClassActive(b.hoursArray,b._hour,u))),40===t.keyCode&&(b._handlerMaxMinHoursOptions(v-30,function(){return S.addStyle(b._hand,{transform:"rotateZ(".concat(v-y,"deg)")})},r,o),b._isInner?(12===--c?c=0:-1===c&&(c=23),b._hour.textContent=b._setHourOrMinute(c),b._toggleClassActive(b.innerHours,b._hour,l)):(--p,""!==r&&""!==o?f<p?p=f:p<d&&(p=d):""===r&&""!==o?p<=d&&(p=d):""!==r&&""===o&&p<=1&&(p=1),b._hour.textContent=b._setHourOrMinute(0===p?12:p),b._toggleClassActive(b.hoursArray,b._hour,u))));});}},{key:"_setActiveClassToTipsOnOpen",value:function(t){var e=this;if(!this._isInvalidTimeFormat){for(var n=arguments.length,r=new Array(1<n?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];[].concat(r).filter(function(t){return "PM"===t?S.addClass(e._PM,M):"AM"===t?S.addClass(e._AM,M):(S.removeClass(e._AM,M),S.removeClass(e._PM,M)),t});var i=x.find(".".concat(iu),this._modal);this._addActiveClassToTip(i,t);}}},{key:"_setTipsAndTimesDependOnInputValue",value:function(t,e){var n=this._options,r=n.inline,n=n.format12;this._isInvalidTimeFormat?(this._hour.textContent="12",this._minutes.textContent="00",r||S.addStyle(this._hand,{transform:"rotateZ(0deg)"}),n&&S.addClass(this._PM,M)):(n=12<t?30*t-360:30*t,this._hour.textContent=t,this._minutes.textContent=e,r||(S.addStyle(this._hand,{transform:"rotateZ(".concat(n,"deg)")}),S.addStyle(this._circle,{backgroundColor:"#1976d2"}),(12<Number(t)||"00"===t)&&S.addStyle(this._hand,{height:"21.5%"})));}},{key:"_listenToToggleKeydown",value:function(){var e=this;_.on(this._element,"keydown","[data-mdb-toggle='".concat(this.toggleElement,"']"),function(t){13===t.keyCode&&(t.preventDefault(),_.trigger(e.elementToggle,"click"));});}},{key:"_handleOpen",value:function(){var b=this;wc(this._element,"click","[data-mdb-toggle='".concat(this.toggleElement,"']"),function(g){var t;null!==b._options&&(t=null!==S.getDataAttribute(b.input,"toggle")?200:0,setTimeout(function(){S.addStyle(b.elementToggle,{pointerEvents:"none"}),b.elementToggle.blur(),h=""===P(b.input)[0]?["12","00","PM"]:P(b.input);var t,e,n,r,o,i,a,c,s,u,l=b._options,f=l.modalID,d=l.inline,p=l.format12,l=l.overflowHidden,h=js(h,3),v=h[0],y=h[1],h=h[2],m=Va("div");(12<Number(v)||"00"===v)&&(b._isInner=!0),b.input.blur(),g.target.blur(),m.innerHTML=(t=b._options,e=t.okLabel,n=t.cancelLabel,u=t.headID,r=t.footerID,o=t.bodyID,s=t.pickerID,i=t.clearLabel,a=t.showClearBtn,c=t.amLabel,t=t.pmLabel,"<div id='".concat(s,"' class='timepicker-wrapper h-full flex items-center justify-center flex-col fixed'>\n      <div class=\"flex items-center justify-center flex-col timepicker-container\">\n        <div class=\"flex flex-col timepicker-elements justify-around\">\n        <div id='").concat(u,"' class='timepicker-head flex flex-row items-center justify-center'>\n        <div class='timepicker-head-content flex w-100 justify-evenly'>\n            <div class=\"timepicker-current-wrapper\">\n              <span class=\"relative h-100\">\n                <button type='button' class='timepicker-current timepicker-hour active ripple' tabindex=\"0\">21</button>\n              </span>\n              <button type='button' class='timepicker-dot' disabled>:</button>\n            <span class=\"relative h-100\">\n              <button type='button' class='timepicker-current timepicker-minute ripple' tabindex=\"0\">21</button>\n            </span>\n            </div>\n            <div class=\"flex flex-col justify-center timepicker-mode-wrapper\">\n              <button type='button' class=\"timepicker-hour-mode timepicker-am ripple\" tabindex=\"0\">").concat(c,'</button>\n              <button class="timepicker-hour-mode timepicker-pm ripple" tabindex="0">').concat(t,"</button>\n            </div>\n        </div>\n      </div>\n      <div id='").concat(o,"' class='timepicker-clock-wrapper flex justify-center flex-col items-center'>\n        <div class='timepicker-clock'>\n          <span class='timepicker-middle-dot absolute'></span>\n          <div class='timepicker-hand-pointer absolute'>\n            <div class='timepicker-circle absolute'></div>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div id='").concat(r,"' class='timepicker-footer'>\n      <div class=\"w-full flex justify-between\">\n        ").concat(a?"<button type='button' class='timepicker-button timepicker-clear ripple' tabindex=\"0\">".concat(i,"</button>"):"","\n        <button type='button' class='timepicker-button timepicker-cancel ripple' tabindex=\"0\">").concat(n,"</button>\n        <button type='button' class='timepicker-button timepicker-submit ripple' tabindex=\"0\">").concat(e,"</button>\n      </div>\n    </div>\n  </div>\n</div>")),S.addClass(m,nu),m.setAttribute("role","dialog"),m.setAttribute("tabIndex","-1"),m.setAttribute("id",f),d&&(b._popper=en(b.input,m,{placement:"bottom-start"})),b._document.body.appendChild(m),b._getDomElements(),b._toggleBackdropAnimation(),b._setActiveClassToTipsOnOpen(v,y,h),b._appendTimes(),b._setActiveClassToTipsOnOpen(v,y,h),b._setTipsAndTimesDependOnInputValue(v,y),""===b.input.value&&(s=x.find(".".concat(iu),b._modal),p&&S.addClass(b._PM,M),b._hour.textContent="12",b._minutes.textContent="00",b._addActiveClassToTip(s,Number(b._hour.textContent))),b._handleSwitchTimeMode(),b._handleOkButton(),b._handleClose(),d?(b._handleHoverInlineBtn(),b._handleDocumentClickInline(),b._handleInlineClicks()):(b._handleSwitchHourMinute(),b._handleClockClick(),b._handleKeyboard(),S.addStyle(b._hour,{pointerEvents:"none"}),S.addStyle(b._minutes,{pointerEvents:""})),l&&(u=window.innerWidth>document.documentElement.clientWidth,S.addStyle(b._document.body,{overflow:"hidden"}),!ks()&&u&&S.addStyle(b._document.body,{paddingRight:"15px"})),b._focusTrap=new qc(b._wrapper,{event:"keydown",condition:function(t){return "Tab"===t.key}}),b._focusTrap.trap();},t));});}},{key:"_handleInlineClicks",value:function(){var d=this;wc(this._modal,"click mousedown mouseup touchstart touchend contextmenu",".".concat(Zs,", .").concat(Xs),function(t){function e(t){t=f(t),d._hour.textContent=d._setHourOrMinute(t);}function n(t){t=l(t),d._minutes.textContent=d._setHourOrMinute(t);}function r(){e(s+=1);}function o(){n(u+=1);}function i(){e(--s);}function a(){n(--u);}var c=t.target,t=t.type,s=Number(d._hour.textContent),u=Number(d._minutes.textContent),l=function(t){return 59<t?t=0:t<0&&(t=59),t},f=function(t){return 12<t?t=1:t<1&&(t=12),t=12<t?1:t};S.hasClass(c,Zs)?S.hasClass(c.parentNode,Js)?"mousedown"===t||"touchstart"===t?(clearInterval(d._interval),d._interval=setInterval(r,100)):"mouseup"===t||"touchend"===t||"contextmenu"===t?clearInterval(d._interval):r():"mousedown"===t||"touchstart"===t?(clearInterval(d._interval),d._interval=setInterval(o,100)):"mouseup"===t||"touchend"===t||"contextmenu"===t?clearInterval(d._interval):o():S.hasClass(c,Xs)&&(S.hasClass(c.parentNode,Js)?"mousedown"===t||"touchstart"===t?(clearInterval(d._interval),d._interval=setInterval(i,100)):"mouseup"===t||"touchend"===t?clearInterval(d._interval):i():"mousedown"===t||"touchstart"===t?(clearInterval(d._interval),d._interval=setInterval(a,100)):"mouseup"===t||"touchend"===t?clearInterval(d._interval):a());});}},{key:"_handleClose",value:function(){var a=this;_.on(this._modal,"click",".".concat(uu,", .").concat(Ns,", .").concat(Rs),function(t){function e(){S.addStyle(a.elementToggle,{pointerEvents:"auto"}),a._toggleBackdropAnimation(!0),a._removeModal(),a._focusTrap.disable(),a._focusTrap=null,a.elementToggle?a.elementToggle.focus():a.input&&a.input.focus();}var n,r,o,t=t.target,i=a._options.closeModalOnBackdropClick;S.hasClass(t,Rs)?(a.input.value="",S.removeClass(a.input,"active"),o=""===P(a.input)[0]?["12","00","PM"]:P(a.input),n=(o=js(o,3))[0],r=o[1],o=o[2],a._setTipsAndTimesDependOnInputValue("12","00"),a._setActiveClassToTipsOnOpen(n,r,o),a._hour.click()):(S.hasClass(t,Ns)||S.hasClass(t,uu)&&i)&&e();});}},{key:"showValueInput",value:function(){return this.input.value}},{key:"_handleOkButton",value:function(){var o=this;wc(this._modal,"click",".".concat(Bs),function(){var t=o._options,e=t.readOnly,t=t.focusInputAfterApprove,n=o._document.querySelector(".".concat($s,".").concat(M)),r="".concat(o._hour.textContent,":").concat(o._minutes.textContent);S.addClass(o.input,"active"),S.addStyle(o.elementToggle,{pointerEvents:"auto"}),o._isInvalidTimeFormat&&S.removeClass(o.input,"is-invalid"),!e&&t&&o.input.focus(),S.addStyle(o.elementToggle,{pointerEvents:"auto"}),o.input.value=null===n?"".concat(r," PM"):"".concat(r," ").concat(n.textContent),o._toggleBackdropAnimation(!0),o._removeModal(),_.trigger(o.input,"input.mdb.timepicker");});}},{key:"_handleHoverInlineBtn",value:function(){var o=this;wc(this._modal,"mouseover mouseleave",".".concat(Us),function(t){var e=t.type,t=t.target,n=x.find(".".concat(Gs),o._modal),r=x.find(".".concat(Qs),o._modal);"mouseover"===e?S.hasClass(t,Ks)?n.forEach(function(t){return S.addClass(t,M)}):r.forEach(function(t){return S.addClass(t,M)}):S.hasClass(t,Ks)?n.forEach(function(t){return S.removeClass(t,M)}):r.forEach(function(t){return S.removeClass(t,M)});});}},{key:"_handleDocumentClickInline",value:function(){var e=this;_.on(document,"click",function(t){t=t.target;!e._modal||e._modal.contains(t)||S.hasClass(t,"timepicker-icon")||(clearInterval(e._interval),S.addStyle(e.elementToggle,{pointerEvents:"auto"}),e._removeModal());});}},{key:"_handleSwitchHourMinute",value:function(){var t,e,c=this;t="click",e=zs,_.on(document,t,e,function(t){t=t.target;S.hasClass(t,"active")||(document.querySelectorAll(e).forEach(function(t){S.hasClass(t,"active")&&S.removeClass(t,"active");}),S.addClass(t,"active"));}),_.on(this._modal,"click",zs,function(){function e(t,e){r.forEach(function(t){return t.remove()}),n.forEach(function(t){return t.remove()}),S.addClass(c._hand,su),setTimeout(function(){S.removeClass(c._hand,su);},401),c._getAppendClock(t,".".concat(Vs),e),setTimeout(function(){var t,e;t=x.find(".".concat(iu),c._modal),e=x.find(".".concat(I),c._modal),c._addActiveClassToTip(t,i),c._addActiveClassToTip(e,a);},401);}var t=x.find(zs,c._modal),n=x.find(".".concat(I),c._modal),r=x.find(".".concat(iu),c._modal),o=x.find(".".concat(cu),c._modal),i=Number(c._hour.textContent),a=Number(c._minutes.textContent);t.forEach(function(t){S.hasClass(t,M)&&(S.hasClass(t,eu)?(S.addClass(c._hand,su),S.addStyle(c._hand,{transform:"rotateZ(".concat(6*c._minutes.textContent,"deg)"),height:"calc(40% + 1px)"}),0<o.length&&o.forEach(function(t){return t.remove()}),e(c.minutesArray,"".concat(I)),c._hour.style.pointerEvents="",c._minutes.style.pointerEvents="none"):S.hasClass(t,Ks)&&(S.addStyle(c._hand,{transform:"rotateZ(".concat(30*c._hour.textContent,"deg)")}),12<Number(c._hour.textContent)?(S.addStyle(c._hand,{transform:"rotateZ(".concat(30*c._hour.textContent-360,"deg)"),height:"21.5%"}),12<Number(c._hour.textContent)&&S.addStyle(c._hand,{height:"21.5%"})):S.addStyle(c._hand,{height:"calc(40% + 1px)"}),0<o.length&&o.forEach(function(t){return t.remove()}),e(c.hoursArray,"".concat(iu)),S.addStyle(c._hour,{pointerEvents:"none"}),S.addStyle(c._minutes,{pointerEvents:""})));});});}},{key:"_handleSwitchTimeMode",value:function(){_.on(document,"click",".".concat($s),function(t){t=t.target;S.hasClass(t,M)||(x.find(".".concat($s)).forEach(function(t){S.hasClass(t,M)&&S.removeClass(t,M);}),S.addClass(t,M));});}},{key:"_handleClockClick",value:function(){var y=this,m=x.findOne(".".concat(Ws));wc(document,"mousedown mouseup mousemove mouseleave mouseover touchstart touchmove touchend","",function(t){ks()||t.preventDefault();var e=y._options,n=e.maxHour,e=e.minHour,r=t.type,o=t.target,i=y._options,a=i.closeModalOnMinutesClick,i=i.switchHoursToMinutesOnClick,c=null!==x.findOne(".".concat(I),y._modal),s=null!==x.findOne(".".concat(iu),y._modal),u=null!==x.findOne(".".concat(cu),y._modal),l=x.find(".".concat(I),y._modal),f=Os(t,m),d=m.offsetWidth/2,f=Math.atan2(f.y-d,f.x-d),p=(ks()&&(h=Os(t,m,!0),f=Math.atan2(h.y-d,h.x-d)),null);if("mousedown"===r||"mousemove"===r||"touchmove"===r||"touchstart"===r?"mousedown"!==r&&"touchstart"!==r&&"touchmove"!==r||(S.hasClass(o,Ws)||S.hasClass(o,Vs)||S.hasClass(o,I)||S.hasClass(o,Ys)||S.hasClass(o,cu)||S.hasClass(o,iu)||S.hasClass(o,Hs)||S.hasClass(o,qs)||S.hasClass(o,tu)||S.hasClass(o,ou)||S.hasClass(o,au))&&(y._isMouseMove=!0,ks()&&t.touches&&(h=t.touches[0].clientX,d=t.touches[0].clientY,p=document.elementFromPoint(h,d))):"mouseup"!==r&&"touchend"!==r||(y._isMouseMove=!1,(S.hasClass(o,Vs)||S.hasClass(o,Ys)||S.hasClass(o,cu)||S.hasClass(o,iu)||S.hasClass(o,Hs)||S.hasClass(o,qs)||S.hasClass(o,tu)||S.hasClass(o,ou)||S.hasClass(o,au))&&(s||u)&&i&&_.trigger(y._minutes,"click"),c&&a&&(h=x.findOne(".".concat(Bs),y._modal),_.trigger(h,"click"))),c){d=Math.trunc(180*f/Math.PI)+90,r=y._makeMinutesDegrees(d,void 0),i=r.degrees,a=r.minute;if(void 0===y._handlerMaxMinMinutesOptions(i,a))return;var h=y._handlerMaxMinMinutesOptions(i,a),c=h.degrees,d=h.minute;if(y._isMouseMove){if(S.addStyle(y._hand,{transform:"rotateZ(".concat(c,"deg)")}),void 0===d)return;y._minutes.textContent=10<=d||"00"===d?d:"0".concat(d),y._toggleClassActive(y.minutesArray,y._minutes,l),y._toggleBackgroundColorCircle("".concat(I)),y._objWithDataOnChange.degreesMinutes=c,y._objWithDataOnChange.minutes=d;}}if(s||u){var v=Math.trunc(180*f/Math.PI)+90,v=30*Math.round(v/30);if(S.addStyle(y._circle,{backgroundColor:"#1976d2"}),void 0===y._makeHourDegrees(o,v,void 0))return;y._objWithDataOnChange.degreesHours=v,y._handlerMaxMinHoursOptions(v,function(){var t,e;return ks()&&v?(t=(e=y._makeHourDegrees(p,v,void 0)).degrees,e=e.hour,y._handleMoveHand(p,e,t)):(t=(e=y._makeHourDegrees(o,v,void 0)).degrees,e=e.hour,y._handleMoveHand(o,e,t))},n,e);}t.stopPropagation();});}},{key:"_handleMoveHand",value:function(t,e,n){var r=x.find(".".concat(iu),this._modal),o=x.find(".".concat(cu),this._modal);this._isMouseMove&&(S.hasClass(t,Ys)||S.hasClass(t,cu)||S.hasClass(t,au)?S.addStyle(this._hand,{height:"21.5%"}):S.addStyle(this._hand,{height:"calc(40% + 1px)"}),S.addStyle(this._hand,{transform:"rotateZ(".concat(n,"deg)")}),this._hour.textContent=10<=e||"00"===e?e:"0".concat(e),this._toggleClassActive(this.hoursArray,this._hour,r),this._toggleClassActive(this.innerHours,this._hour,o),this._objWithDataOnChange.hour=10<=e||"00"===e?e:"0".concat(e));}},{key:"_handlerMaxMinMinutesOptions",value:function(t,e){var n=this._options,r=n.increment,o=n.maxTime,n=n.minTime,i=P(o,!1)[1],a=P(n,!1)[1],c=P(o,!1)[0],s=P(n,!1)[0],u=P(o,!1)[2],l=P(n,!1)[2],i=""!==i?6*i:"",a=""!==a?6*a:"";if(void 0===u&&void 0===l){if(""!==o&&""!==n){if(t<=i&&a<=t)return t}else if(""!==n&&Number(this._hour.textContent)<=Number(s)){if(t<=a-6)return t}else if(""!==o&&Number(this._hour.textContent)>=Number(c)&&i+6<=t)return t}else if(""!==n){if("PM"===l&&this._isAmEnabled)return;if("PM"===l&&this._isPmEnabled){if(Number(this._hour.textContent)<Number(s))return;if(Number(this._hour.textContent)<=Number(s)&&t<=a-6)return t}else if("AM"===l&&this._isAmEnabled){if(Number(this._hour.textContent)<Number(s))return;if(Number(this._hour.textContent)<=Number(s)&&t<=a-6)return t}}else if(""!==o){if("AM"===u&&this._isPmEnabled)return;if("PM"===u&&this._isPmEnabled){if(Number(this._hour.textContent)>=Number(c)&&i+6<=t)return t}else if("AM"===u&&this._isAmEnabled&&Number(this._hour.textContent)>=Number(c)&&i+6<=t)return t}return (t=r?30*Math.round(t/30):t)<=0?t=360+t:360<=t&&(t=0),{degrees:t,minute:e}}},{key:"_removeModal",value:function(){var t=this;setTimeout(function(){t._modal.remove(),S.addStyle(t._document.body,{overflow:""}),ks()||S.addStyle(t._document.body,{paddingRight:""});},300),Oc(this._document,"click keydown mousedown mouseup mousemove mouseleave mouseover touchmove touchend");}},{key:"_toggleBackdropAnimation",value:function(){0<arguments.length&&void 0!==arguments[0]&&arguments[0]?(S.addClass(this._wrapper,"animation"),S.addClass(this._wrapper,"fade-out"),this._wrapper.style.animationDuration="300ms"):(S.addClass(this._wrapper,"animation"),S.addClass(this._wrapper,"fade-in"),this._wrapper.style.animationDuration="300ms",this._options.inline||S.addClass(this._clock,Fs));}},{key:"_addActiveClassToTip",value:function(t,e){t.forEach(function(t){Number(t.textContent)===Number(e)&&S.addClass(t,M);});}},{key:"_setHourOrMinute",value:function(t){return t<10?"0".concat(t):t}},{key:"_appendTimes",value:function(){this._getAppendClock(this.hoursArray,".".concat(Vs),"".concat(iu));}},{key:"_getConfig",value:function(t){var e=S.getDataAttributes(this._element);return t=Es(Es(Es({},fu),e),t),Ba(m,t,du),t}}])&&Ps(t.prototype,e),n&&Ps(t,n),Object.defineProperty(t,"prototype",{writable:!1}),o}(),t=pu;function hu(t){return (hu="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function vu(e,t){var n,r=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)),r}function yu(r){for(var t=1;t<arguments.length;t++){var o=null!=arguments[t]?arguments[t]:{};t%2?vu(Object(o),!0).forEach(function(t){var e,n;e=r,n=o[t=t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n;}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(o)):vu(Object(o)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(o,t));});}return r}function mu(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r);}}_.on(window,"DOMContentLoaded",function(){x.find(".".concat(m)).forEach(function(t){var e=pu.getInstance(t);e||new pu(t);});});var g="stepper",gu="mdb.stepper",bu=".".concat(gu),_u="horizontal",wu="vertical",Ou={stepperType:"string",stepperLinear:"boolean",stepperNoEditable:"boolean",stepperActive:"string",stepperCompleted:"string",stepperInvalid:"string",stepperDisabled:"string",stepperVerticalBreakpoint:"number",stepperMobileBreakpoint:"number",stepperMobileBarBreakpoint:"number"},ku={stepperType:_u,stepperLinear:!1,stepperNoEditable:!1,stepperActive:"",stepperCompleted:"",stepperInvalid:"",stepperDisabled:"",stepperVerticalBreakpoint:0,stepperMobileBreakpoint:0,stepperMobileBarBreakpoint:4},Cu="mousedown".concat(bu),Su="keydown".concat(bu),xu="keyup".concat(bu),Eu="resize".concat(bu),ju="animationend",Tu="".concat(g,"-step"),w="".concat(g,"-head"),L="".concat(g,"-content"),Au="".concat(g,"-active"),Du="".concat(g,"-completed"),Pu="".concat(g,"-invalid"),Mu="".concat(g,"-disabled"),Iu="".concat(g,"-").concat(wu),Lu="".concat(g,"-content-hide"),Nu="".concat(g,"-").concat(_u),Ru=function(){function n(t,e){if(!(this instanceof n))throw new TypeError("Cannot call a class as a function");this._element=t,this._options=this._getConfig(e),this._elementHeight=0,this._steps=x.find(".".concat(Tu),this._element),this._currentView="",this._activeStepIndex=0,this._verticalStepperStyles=[],this._element&&(v.setData(t,gu,this),this._init());}var t,e,r;return t=n,r=[{key:"NAME",get:function(){return g}},{key:"getInstance",value:function(t){return v.getData(t,gu)}},{key:"getOrCreateInstance",value:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return this.getInstance(t)||new this(t,"object"===hu(e)?e:null)}}],(e=[{key:"activeStep",get:function(){return this._steps[this._activeStepIndex]}},{key:"activeStepIndex",get:function(){return this._activeStepIndex}},{key:"dispose",value:function(){this._steps.forEach(function(t){_.off(t,Cu),_.off(t,Su);}),_.off(window,Eu),v.removeData(this._element,gu),this._element=null;}},{key:"changeStep",value:function(t){this._toggleStep(t);}},{key:"nextStep",value:function(){this._toggleStep(this._activeStepIndex+1);}},{key:"previousStep",value:function(){this._toggleStep(this._activeStepIndex-1);}},{key:"_init",value:function(){var t=x.findOne(".".concat(Au),this._element);t?this._activeStepIndex=this._steps.indexOf(t):this._toggleStepClass(this._activeStepIndex,"add",Au),this._toggleStepClass(this._activeStepIndex,"add",this._options.stepperActive),this._bindMouseDown(),this._bindKeysNavigation(),this._options.stepperType===wu?this._toggleVertical():this._toggleHorizontal(),(this._options.stepperVerticalBreakpoint||this._options.stepperMobileBreakpoint)&&this._toggleStepperView(),this._bindResize();}},{key:"_getConfig",value:function(t){var e=S.getDataAttributes(this._element);return t=yu(yu(yu({},ku),e),t),Ba(g,t,Ou),t}},{key:"_bindMouseDown",value:function(){var n=this;this._steps.forEach(function(t){t=x.findOne(".".concat(w),t);_.on(t,Cu,function(t){var e=x.parents(t.target,".".concat(Tu))[0],e=n._steps.indexOf(e);t.preventDefault(),n._toggleStep(e);});});}},{key:"_bindResize",value:function(){var t=this;_.on(window,Eu,function(){t._currentView===wu&&t._setSingleStepHeight(t.activeStep),t._currentView===_u&&t._setHeight(t.activeStep),(t._options.stepperVerticalBreakpoint||t._options.stepperMobileBreakpoint)&&t._toggleStepperView();});}},{key:"_toggleStepperView",value:function(){var e=this,t=this._options.stepperVerticalBreakpoint<window.innerWidth,n=this._options.stepperVerticalBreakpoint>window.innerWidth,r=this._options.stepperMobileBreakpoint>window.innerWidth;t&&this._currentView!==_u&&this._toggleHorizontal(),n&&!r&&this._currentView!==wu&&(this._steps.forEach(function(t){t=x.findOne(".".concat(L),t);e._resetStepperHeight(),e._showElement(t);}),this._toggleVertical());}},{key:"_toggleStep",value:function(t){this._activeStepIndex!==t&&(this._options.stepperNoEditable&&this._toggleDisabled(),this._showElement(x.findOne(".".concat(L),this._steps[t])),this._toggleActive(t),t>this._activeStepIndex&&this._toggleCompleted(this._activeStepIndex),this._currentView===_u?this._animateHorizontalStep(t):(this._animateVerticalStep(t),this._setSingleStepHeight(this._steps[t])),this._toggleStepTabIndex(x.findOne(".".concat(w),this.activeStep),x.findOne(".".concat(w),this._steps[t])),this._activeStepIndex=t);}},{key:"_resetStepperHeight",value:function(){this._element.style.height="";}},{key:"_setStepsHeight",value:function(){var n=this;this._steps.forEach(function(t){var t=x.findOne(".".concat(L),t),e=window.getComputedStyle(t),e=(n._verticalStepperStyles.push({paddingTop:parseFloat(e.paddingTop),paddingBottom:parseFloat(e.paddingBottom)}),t.scrollHeight);t.style.height="".concat(e,"px");});}},{key:"_setSingleStepHeight",value:function(t){var e=x.findOne(".".concat(L),t),n=this.activeStep===t,t=this._steps.indexOf(t),n=n?(e.style.height="",e.scrollHeight):e.scrollHeight+this._verticalStepperStyles[t].paddingTop+this._verticalStepperStyles[t].paddingBottom;e.style.height="".concat(n,"px");}},{key:"_toggleVertical",value:function(){this._currentView=wu,this._toggleStepperClass(Iu),this._setStepsHeight(),this._hideInactiveSteps();}},{key:"_toggleHorizontal",value:function(){this._currentView=_u,this._toggleStepperClass(Nu),this._setHeight(this.activeStep),this._hideInactiveSteps();}},{key:"_toggleStepperClass",value:function(t){this._element.classList.remove(Nu,Iu),this._element.classList.add(t),t!==Iu&&this._steps.forEach(function(t){x.findOne(".".concat(L),t).classList.remove(Lu);});}},{key:"_toggleStepClass",value:function(t,e,n){n&&this._steps[t].classList[e](n);}},{key:"_bindKeysNavigation",value:function(){var s=this;this._toggleStepTabIndex(!1,x.findOne(".".concat(w),this.activeStep)),this._steps.forEach(function(t){t=x.findOne(".".concat(w),t);_.on(t,Su,function(t){var e=x.parents(t.currentTarget,".".concat(Tu))[0],n=x.next(e,".".concat(Tu))[0],r=x.prev(e,".".concat(Tu))[0],o=x.findOne(".".concat(w),e),i=x.findOne(".".concat(w),s.activeStep),a=null,c=null;n&&(a=x.findOne(".".concat(w),n)),r&&(c=x.findOne(".".concat(w),r)),37===t.keyCode&&s._currentView!==wu&&(c?(s._toggleStepTabIndex(o,c),s._toggleOutlineStyles(o,c),c.focus()):a&&(s._toggleStepTabIndex(o,a),s._toggleOutlineStyles(o,a),a.focus())),39===t.keyCode&&s._currentView!==wu&&(a?(s._toggleStepTabIndex(o,a),s._toggleOutlineStyles(o,a),a.focus()):c&&(s._toggleStepTabIndex(o,c),s._toggleOutlineStyles(o,c),c.focus())),40===t.keyCode&&s._currentView===wu&&(t.preventDefault(),a&&(s._toggleStepTabIndex(o,a),s._toggleOutlineStyles(o,a),a.focus())),38===t.keyCode&&s._currentView===wu&&(t.preventDefault(),c&&(s._toggleStepTabIndex(o,c),s._toggleOutlineStyles(o,c),c.focus())),36===t.keyCode&&(n=x.findOne(".".concat(w),s._steps[0]),s._toggleStepTabIndex(o,n),s._toggleOutlineStyles(o,n),n.focus()),35===t.keyCode&&(r=s._steps[s._steps.length-1],a=x.findOne(".".concat(w),r),s._toggleStepTabIndex(o,a),s._toggleOutlineStyles(o,a),a.focus()),13!==t.keyCode&&32!==t.keyCode||(t.preventDefault(),s.changeStep(s._steps.indexOf(e))),9===t.keyCode&&(s._toggleStepTabIndex(o,i),s._toggleOutlineStyles(o,!1),i.focus());}),_.on(t,xu,function(t){var e=x.parents(t.currentTarget,".".concat(Tu))[0],e=x.findOne(".".concat(w),e),n=x.findOne(".".concat(w),s.activeStep);9===t.keyCode&&(s._toggleStepTabIndex(e,n),s._toggleOutlineStyles(!1,n),n.focus());});});}},{key:"_toggleStepTabIndex",value:function(t,e){t&&t.setAttribute("tabIndex",-1),e&&e.setAttribute("tabIndex",0);}},{key:"_toggleOutlineStyles",value:function(t,e){t&&(t.style.outline=""),e&&(e.style.outline="revert");}},{key:"_toggleDisabled",value:function(){this._toggleStepClass(this._activeStepIndex,"add",Mu),this._toggleStepClass(this._activeStepIndex,"add",this._options.stepperDisabled);}},{key:"_toggleActive",value:function(t){this._toggleStepClass(t,"add",Au),this._toggleStepClass(this._activeStepIndex,"remove",Au),this._toggleStepClass(t,"add",this._options.stepperActive),this._toggleStepClass(this._activeStepIndex,"remove",this._options.stepperActive);}},{key:"_toggleCompleted",value:function(t){this._toggleStepClass(t,"add",Du),this._toggleStepClass(t,"remove",Pu),this._toggleStepClass(t,"add",this._options.stepperCompleted),this._toggleStepClass(t,"remove",this._options.stepperInvalid);}},{key:"_hideInactiveSteps",value:function(){var e=this;this._steps.forEach(function(t){t.classList.contains(Au)||e._hideElement(x.findOne(".".concat(L),t));});}},{key:"_setHeight",value:function(t){var e=x.findOne(".".concat(L),t),n=getComputedStyle(e),t=x.findOne(".".concat(w),t),r=getComputedStyle(t),e=e.offsetHeight+parseFloat(n.marginTop)+parseFloat(n.marginBottom),n=t.offsetHeight+parseFloat(r.marginTop)+parseFloat(r.marginBottom);this._element.style.height="".concat(n+e,"px");}},{key:"_hideElement",value:function(t){x.parents(t,".".concat(Tu))[0].classList.contains(Au)||this._currentView===wu?t.classList.add(Lu):t.style.display="none";}},{key:"_showElement",value:function(t){this._currentView===wu?t.classList.remove(Lu):t.style.display="block";}},{key:"_animateHorizontalStep",value:function(n){var t,r=this,e=n>this._activeStepIndex,o=x.findOne(".".concat(L),this._steps[n]),i=x.findOne(".".concat(L),this.activeStep);this._steps.forEach(function(t,e){t=x.findOne(".".concat(L),t);r._clearStepAnimation(t),e!==n&&e!==r._activeStepIndex&&r._hideElement(t);}),e=e?(t="slide-out-left","slide-in-right"):(t="slide-out-right","slide-in-left"),i.classList.add(t,"animation","fast"),o.classList.add(e,"animation","fast"),this._setHeight(this._steps[n]),_.one(i,ju,function(t){r._clearStepAnimation(t.target),r._hideElement(t.target);}),_.one(o,ju,function(t){r._clearStepAnimation(t.target);});}},{key:"_animateVerticalStep",value:function(t){var t=x.findOne(".".concat(L),this._steps[t]),e=x.findOne(".".concat(L),this.activeStep);this._hideElement(e),this._showElement(t);}},{key:"_clearStepAnimation",value:function(t){t.classList.remove("slide-out-left","slide-in-right","slide-out-right","slide-in-left","animation","fast");}}])&&mu(t.prototype,e),r&&mu(t,r),Object.defineProperty(t,"prototype",{writable:!1}),n}(),bu=(x.find('[data-mdb-stepper="stepper"]').forEach(function(t){return Ru.getInstance(t)||new Ru(t)}),Ru);window.Alert=n,window.Button=R,window.Dropdown=bn,window.Carousel=vo,window.Collapse=jn,window.Offcanvas=r,window.Modal=Io,window.Popover=l,window.ScrollSpy=o,window.Tab=_a,window.Toast=h,window.Tooltip=Ri,window.Ripple=zc,window.Datepicker=ds,window.Timepicker=t,window.Stepper=bu;}]);

    /* src\components\Navbar.svelte generated by Svelte v3.48.0 */

    const file$b = "src\\components\\Navbar.svelte";

    function create_fragment$c(ctx) {
    	let nav;
    	let div;
    	let a;
    	let t1;
    	let hr;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			a = element("a");
    			a.textContent = "USARS Mapping";
    			t1 = space();
    			hr = element("hr");
    			attr_dev(a, "href", "#/");
    			attr_dev(a, "class", "py-4 text-xl ");
    			add_location(a, file$b, 5, 2, 98);
    			attr_dev(div, "class", "flex items-center space-x-4");
    			add_location(div, file$b, 4, 1, 53);
    			attr_dev(nav, "class", "bg-dark px-5 ");
    			add_location(nav, file$b, 3, 0, 23);
    			add_location(hr, file$b, 9, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, a);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\Footer.svelte generated by Svelte v3.48.0 */

    const file$a = "src\\components\\Footer.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (75:3) {#each projectList as item}
    function create_each_block_2(ctx) {
    	let div;
    	let a;
    	let t0_value = /*item*/ ctx[3].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", `#${/*item*/ ctx[3].link}`);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noreferrer");
    			attr_dev(a, "class", "text-sm hover:underline");
    			add_location(a, file$a, 76, 5, 1506);
    			attr_dev(div, "key", /*item*/ ctx[3].id);
    			attr_dev(div, "class", "my-2");
    			add_location(div, file$a, 75, 4, 1467);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(75:3) {#each projectList as item}",
    		ctx
    	});

    	return block;
    }

    // (84:3) {#each applicationToolsList as item}
    function create_each_block_1(ctx) {
    	let div;
    	let a;
    	let t0_value = /*item*/ ctx[3].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", `${/*item*/ ctx[3].link}`);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noreferrer");
    			attr_dev(a, "class", "text-sm hover:underline");
    			add_location(a, file$a, 85, 5, 1810);
    			attr_dev(div, "key", /*item*/ ctx[3].id);
    			attr_dev(div, "class", "my-2");
    			add_location(div, file$a, 84, 4, 1771);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(84:3) {#each applicationToolsList as item}",
    		ctx
    	});

    	return block;
    }

    // (94:3) {#each aboutList as item}
    function create_each_block$2(ctx) {
    	let div;
    	let a;
    	let t0_value = /*item*/ ctx[3].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", `${/*item*/ ctx[3].link}`);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "text-sm hover:underline");
    			attr_dev(a, "rel", "noreferrer");
    			add_location(a, file$a, 95, 5, 2093);
    			attr_dev(div, "key", /*item*/ ctx[3].id);
    			attr_dev(div, "class", "my-2");
    			add_location(div, file$a, 94, 4, 2054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(94:3) {#each aboutList as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let hr;
    	let t0;
    	let footer;
    	let div3;
    	let div0;
    	let p0;
    	let t2;
    	let t3;
    	let div1;
    	let p1;
    	let t5;
    	let t6;
    	let div2;
    	let p2;
    	let t8;
    	let t9;
    	let div7;
    	let div4;
    	let p3;
    	let t11;
    	let p4;
    	let t13;
    	let p5;
    	let t15;
    	let p6;
    	let t17;
    	let div5;
    	let t18;
    	let div6;
    	let p7;
    	let t20;
    	let p8;
    	let each_value_2 = /*projectList*/ ctx[0];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*applicationToolsList*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*aboutList*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t0 = space();
    			footer = element("footer");
    			div3 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Project Details";
    			t2 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t3 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Application Tools";
    			t5 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			div2 = element("div");
    			p2 = element("p");
    			p2.textContent = "About";
    			t8 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div7 = element("div");
    			div4 = element("div");
    			p3 = element("p");
    			p3.textContent = "Disclaimer";
    			t11 = space();
    			p4 = element("p");
    			p4.textContent = "© CAPSTONE API. All rights reserved.";
    			t13 = space();
    			p5 = element("p");
    			p5.textContent = "Website Terms and Policies";
    			t15 = space();
    			p6 = element("p");
    			p6.textContent = "If you require any more information or have any questions about our sites disclaimer, please feel free to contact me by email at alexcanales766@gmail.com. The Disclaimer was generated with the\r\n\t\t\t\thelp of the Disclaimer Generator. All the information on this website - Showcase - is published in good faith and for general information purpose only.";
    			t17 = space();
    			div5 = element("div");
    			t18 = space();
    			div6 = element("div");
    			p7 = element("p");
    			p7.textContent = "License Terms";
    			t20 = space();
    			p8 = element("p");
    			p8.textContent = "Welcome to the CAPSTONE API portal. The objective of this site is to make CAPSTONE data, including imagery, eminently accessible to application developers.";
    			add_location(hr, file$a, 68, 0, 1256);
    			attr_dev(p0, "class", "font-bold");
    			add_location(p0, file$a, 72, 3, 1387);
    			attr_dev(div0, "class", "col-span-1 ");
    			add_location(div0, file$a, 71, 2, 1357);
    			attr_dev(p1, "class", "font-bold");
    			add_location(p1, file$a, 82, 3, 1682);
    			attr_dev(div1, "class", "col-span-1");
    			add_location(div1, file$a, 81, 2, 1653);
    			attr_dev(p2, "class", "font-bold");
    			add_location(p2, file$a, 91, 3, 1986);
    			attr_dev(div2, "class", "col-span-1 ");
    			add_location(div2, file$a, 90, 2, 1956);
    			attr_dev(div3, "class", "grid grid-cols-1 md:grid-cols-3 py-2");
    			add_location(div3, file$a, 70, 1, 1303);
    			attr_dev(p3, "class", "font-bold");
    			add_location(p3, file$a, 103, 3, 2330);
    			attr_dev(p4, "class", "font-bold text-xs my-2");
    			add_location(p4, file$a, 104, 3, 2370);
    			attr_dev(p5, "class", "font-bold text-xs my-2");
    			add_location(p5, file$a, 105, 3, 2449);
    			attr_dev(p6, "class", "text-xs my-2");
    			add_location(p6, file$a, 107, 3, 2520);
    			attr_dev(div4, "class", "col-span-1");
    			add_location(div4, file$a, 102, 2, 2301);
    			attr_dev(div5, "class", "col-span-1 py-2 ");
    			add_location(div5, file$a, 113, 2, 2924);
    			attr_dev(p7, "class", "font-bold");
    			add_location(p7, file$a, 116, 3, 2991);
    			attr_dev(p8, "class", "text-xs my-2");
    			add_location(p8, file$a, 118, 3, 3036);
    			attr_dev(div6, "class", "col-span-1");
    			add_location(div6, file$a, 115, 2, 2962);
    			attr_dev(div7, "class", "grid grid-cols-1 sm:grid-cols-3 mt-8");
    			add_location(div7, file$a, 101, 1, 2247);
    			attr_dev(footer, "class", "bg-smoke py-8 px-5");
    			add_location(footer, file$a, 69, 0, 1264);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div3);
    			append_dev(div3, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t5);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, p2);
    			append_dev(div2, t8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(footer, t9);
    			append_dev(footer, div7);
    			append_dev(div7, div4);
    			append_dev(div4, p3);
    			append_dev(div4, t11);
    			append_dev(div4, p4);
    			append_dev(div4, t13);
    			append_dev(div4, p5);
    			append_dev(div4, t15);
    			append_dev(div4, p6);
    			append_dev(div7, t17);
    			append_dev(div7, div5);
    			append_dev(div7, t18);
    			append_dev(div7, div6);
    			append_dev(div6, p7);
    			append_dev(div6, t20);
    			append_dev(div6, p8);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*projectList*/ 1) {
    				each_value_2 = /*projectList*/ ctx[0];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*applicationToolsList*/ 2) {
    				each_value_1 = /*applicationToolsList*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*aboutList*/ 4) {
    				each_value = /*aboutList*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(footer);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);

    	const projectList = [
    		{
    			id: 0,
    			name: "Mapping UI Github",
    			link: "https://github.com/canaleal/Capstone_Map_Client"
    		},
    		{
    			id: 1,
    			name: "Pothole Object Detection",
    			link: "https://github.com/canaleal/PotholeObjectDetection"
    		},
    		{
    			id: 2,
    			name: "Project Capstone",
    			link: "https://github.com/canaleal/Capstone"
    		}
    	];

    	const applicationToolsList = [
    		{
    			id: 0,
    			name: "Animista",
    			link: "https://animista.net/play/basic"
    		},
    		{
    			id: 1,
    			name: "Developer Icons",
    			link: "https://devicon.dev/"
    		},
    		{
    			id: 2,
    			name: "Color Designer",
    			link: "https://colordesigner.io/tools"
    		},
    		{
    			id: 3,
    			name: "Font Awesome",
    			link: "https://fontawesome.com/"
    		},
    		{
    			id: 4,
    			name: "Cool Backgrounds",
    			link: "https://coolbackgrounds.io/"
    		},
    		{
    			id: 5,
    			name: "Gradient Generator",
    			link: "https://cssgradient.io/"
    		}
    	];

    	const aboutList = [
    		{
    			id: 0,
    			name: "Linkedin",
    			link: "https://www.linkedin.com/in/alex-canales"
    		},
    		{
    			id: 1,
    			name: "Github",
    			link: "https://github.com/canaleal"
    		},
    		{
    			id: 2,
    			name: "Bitbucket",
    			link: "https://bitbucket.org/Canaleal/"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		projectList,
    		applicationToolsList,
    		aboutList
    	});

    	return [projectList, applicationToolsList, aboutList];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    // eslint-disable-next-line func-names
    var kindOf = (function(cache) {
      // eslint-disable-next-line func-names
      return function(thing) {
        var str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
      };
    })(Object.create(null));

    function kindOfTest(type) {
      type = type.toLowerCase();
      return function isKindOf(thing) {
        return kindOf(thing) === type;
      };
    }

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return Array.isArray(val);
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer$1(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    var isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (kindOf(val) !== 'object') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    var isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    var isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction$1(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction$1(val.pipe);
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} thing The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(thing) {
      var pattern = '[object FormData]';
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) ||
        toString.call(thing) === pattern ||
        (isFunction$1(thing.toString) && thing.toString() === pattern)
      );
    }

    /**
     * Determine if a value is a URLSearchParams object
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    var isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     */

    function inherits(constructor, superConstructor, props, descriptors) {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      props && Object.assign(constructor.prototype, props);
    }

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function} [filter]
     * @returns {Object}
     */

    function toFlatObject(sourceObj, destObj, filter) {
      var props;
      var i;
      var prop;
      var merged = {};

      destObj = destObj || {};

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if (!merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = Object.getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    }

    /*
     * determines whether a string ends with the characters of a specified string
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     * @returns {boolean}
     */
    function endsWith(str, searchString, position) {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      var lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }


    /**
     * Returns new array from array like object
     * @param {*} [thing]
     * @returns {Array}
     */
    function toArray(thing) {
      if (!thing) return null;
      var i = thing.length;
      if (isUndefined(i)) return null;
      var arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    }

    // eslint-disable-next-line func-names
    var isTypedArray = (function(TypedArray) {
      // eslint-disable-next-line func-names
      return function(thing) {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer$1,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction$1,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM,
      inherits: inherits,
      toFlatObject: toFlatObject,
      kindOf: kindOf,
      kindOfTest: kindOfTest,
      endsWith: endsWith,
      toArray: toArray,
      isTypedArray: isTypedArray,
      isFileList: isFileList
    };

    function encode$1(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode$1(key) + '=' + encode$1(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);
      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    var prototype = AxiosError.prototype;
    var descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED'
    // eslint-disable-next-line func-names
    ].forEach(function(code) {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = function(error, code, config, request, response, customProps) {
      var axiosError = Object.create(prototype);

      utils.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    var AxiosError_1 = AxiosError;

    var transitional = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    /**
     * Convert a data object to FormData
     * @param {Object} obj
     * @param {?Object} [formData]
     * @returns {Object}
     **/

    function toFormData(obj, formData) {
      // eslint-disable-next-line no-param-reassign
      formData = formData || new FormData();

      var stack = [];

      function convertValue(value) {
        if (value === null) return '';

        if (utils.isDate(value)) {
          return value.toISOString();
        }

        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
          return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      function build(data, parentKey) {
        if (utils.isPlainObject(data) || utils.isArray(data)) {
          if (stack.indexOf(data) !== -1) {
            throw Error('Circular reference detected in ' + parentKey);
          }

          stack.push(data);

          utils.forEach(data, function each(value, key) {
            if (utils.isUndefined(value)) return;
            var fullKey = parentKey ? parentKey + '.' + key : key;
            var arr;

            if (value && !parentKey && typeof value === 'object') {
              if (utils.endsWith(key, '{}')) {
                // eslint-disable-next-line no-param-reassign
                value = JSON.stringify(value);
              } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
                // eslint-disable-next-line func-names
                arr.forEach(function(el) {
                  !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
                });
                return;
              }
            }

            build(value, fullKey);
          });

          stack.pop();
        } else {
          formData.append(parentKey, convertValue(data));
        }
      }

      build(obj);

      return formData;
    }

    var toFormData_1 = toFormData;

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError_1(
          'Request failed with status code ' + response.status,
          [AxiosError_1.ERR_BAD_REQUEST, AxiosError_1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function CanceledError(message) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError_1.call(this, message == null ? 'canceled' : message, AxiosError_1.ERR_CANCELED);
      this.name = 'CanceledError';
    }

    utils.inherits(CanceledError, AxiosError_1, {
      __CANCEL__: true
    });

    var CanceledError_1 = CanceledError;

    var parseProtocol = function parseProtocol(url) {
      var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    };

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError_1('Request aborted', AxiosError_1.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError_1('Network Error', AxiosError_1.ERR_NETWORK, config, request, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          var transitional$1 = config.transitional || transitional;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError_1(
            timeoutErrorMessage,
            transitional$1.clarifyTimeoutError ? AxiosError_1.ETIMEDOUT : AxiosError_1.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || (cancel && cancel.type) ? new CanceledError_1() : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        if (!requestData) {
          requestData = null;
        }

        var protocol = parseProtocol(fullPath);

        if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
          reject(new AxiosError_1('Unsupported protocol ' + protocol + ':', AxiosError_1.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData);
      });
    };

    // eslint-disable-next-line strict
    var _null = null;

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults = {

      transitional: transitional,

      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');

        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }

        var isObjectPayload = utils.isObject(data);
        var contentType = headers && headers['Content-Type'];

        var isFileList;

        if ((isFileList = utils.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
          var _FormData = this.env && this.env.FormData;
          return toFormData_1(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
        } else if (isObjectPayload || contentType === 'application/json') {
          setContentTypeIfUnset(headers, 'application/json');
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError_1.from(e, AxiosError_1.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: _null
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      var context = this || defaults_1;
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError_1();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'beforeRedirect': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

    var data = {
      "version": "0.27.2"
    };

    var VERSION = data.version;


    var validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new AxiosError_1(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError_1.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError_1('options must be an object', AxiosError_1.ERR_BAD_OPTION_VALUE);
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError_1('option ' + opt + ' must be ' + result, AxiosError_1.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError_1('Unknown option ' + opt, AxiosError_1.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions: assertOptions,
      validators: validators$1
    };

    var validators = validator.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      var fullPath = buildFullPath(config.baseURL, config.url);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method: method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url: url,
            data: data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios_1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;

      // eslint-disable-next-line func-names
      this.promise.then(function(cancel) {
        if (!token._listeners) return;

        var i;
        var l = token._listeners.length;

        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = function(onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new CanceledError_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Subscribe to the cancel signal
     */

    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };

    /**
     * Unsubscribe from the cancel signal
     */

    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Expose Cancel & CancelToken
    axios$1.CanceledError = CanceledError_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;
    axios$1.VERSION = data.version;
    axios$1.toFormData = toFormData_1;

    // Expose AxiosError class
    axios$1.AxiosError = AxiosError_1;

    // alias for CanceledError for backward compatibility
    axios$1.Cancel = axios$1.CanceledError;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default$k = axios$1;
    axios_1.default = _default$k;

    var axios = axios_1;

    const getDataWithAxios = async (sourceLink) => {
      const response = await axios.get(
        sourceLink,
      );
      return response.data;
    };

    function getFullWindowPath() {
      if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}`;
      }
      return null;
    }

    const Data = {
      GEOHASH_URL: `${getFullWindowPath()}/data/kingston-neighbourhood.geojson`,
      NEIGHBOURHOODS_URL: `${getFullWindowPath()}/data/neighbourhoods.geojson`,
      TREES_URL: `${getFullWindowPath()}/data/trees.geojson`,
      SIDEWALK_URL: `${getFullWindowPath()}/data/sidewalk.geojson`,
      ROADWORK_URL: `${getFullWindowPath()}/data/roadwork.geojson`,

    };

    const getListOfObjectWhereKeyContainsString = (listOfObjects, key, stringToSearchFor) => {
      const filteredList = listOfObjects.filter((object) => {
        const objectKey = object[key];
        return objectKey.includes(stringToSearchFor);
      });
      return filteredList;
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var mapboxGlDraw = createCommonjsModule(function (module, exports) {
    !function(t,e){module.exports=e();}(commonjsGlobal,(function(){var t=function(t,e){var n={drag:[],click:[],mousemove:[],mousedown:[],mouseup:[],mouseout:[],keydown:[],keyup:[],touchstart:[],touchmove:[],touchend:[],tap:[]},o={on:function(t,e,o){if(void 0===n[t])throw new Error("Invalid event type: "+t);n[t].push({selector:e,fn:o});},render:function(t){e.store.featureChanged(t);}},r=function(t,r){for(var i=n[t],a=i.length;a--;){var s=i[a];if(s.selector(r)){s.fn.call(o,r)||e.store.render(),e.ui.updateMapClasses();break}}};return t.start.call(o),{render:t.render,stop:function(){t.stop&&t.stop();},trash:function(){t.trash&&(t.trash(),e.store.render());},combineFeatures:function(){t.combineFeatures&&t.combineFeatures();},uncombineFeatures:function(){t.uncombineFeatures&&t.uncombineFeatures();},drag:function(t){r("drag",t);},click:function(t){r("click",t);},mousemove:function(t){r("mousemove",t);},mousedown:function(t){r("mousedown",t);},mouseup:function(t){r("mouseup",t);},mouseout:function(t){r("mouseout",t);},keydown:function(t){r("keydown",t);},keyup:function(t){r("keyup",t);},touchstart:function(t){r("touchstart",t);},touchmove:function(t){r("touchmove",t);},touchend:function(t){r("touchend",t);},tap:function(t){r("tap",t);}}},e=6378137;function n(t){var e=0;if(t&&t.length>0){e+=Math.abs(o(t[0]));for(var n=1;n<t.length;n++)e-=Math.abs(o(t[n]));}return e}function o(t){var n,o,i,a,s,u,c=0,l=t.length;if(l>2){for(u=0;u<l;u++)u===l-2?(i=l-2,a=l-1,s=0):u===l-1?(i=l-1,a=0,s=1):(i=u,a=u+1,s=u+2),n=t[i],o=t[a],c+=(r(t[s][0])-r(n[0]))*Math.sin(r(o[1]));c=c*e*e/2;}return c}function r(t){return t*Math.PI/180}var i={geometry:function t(e){var o,r=0;switch(e.type){case"Polygon":return n(e.coordinates);case"MultiPolygon":for(o=0;o<e.coordinates.length;o++)r+=n(e.coordinates[o]);return r;case"Point":case"MultiPoint":case"LineString":case"MultiLineString":return 0;case"GeometryCollection":for(o=0;o<e.geometries.length;o++)r+=t(e.geometries[o]);return r}},ring:o},a="mapboxgl-ctrl",s="mapbox-gl-draw_ctrl-draw-btn",u="mapbox-gl-draw_line",c="mapbox-gl-draw_polygon",l="mapbox-gl-draw_point",d="mapbox-gl-draw_trash",p="mapbox-gl-draw_combine",f="mapbox-gl-draw_uncombine",h="mapboxgl-ctrl-group",g="active",y="mapbox-gl-draw_boxselect",v="mapbox-gl-draw-hot",m="mapbox-gl-draw-cold",b="add",_="move",S="drag",x="pointer",C="none",E={POLYGON:"polygon",LINE:"line_string",POINT:"point"},M="Feature",w="Polygon",I="LineString",L="Point",P="FeatureCollection",F="Multi",O="MultiPoint",k="MultiLineString",T="MultiPolygon",j={DRAW_LINE_STRING:"draw_line_string",DRAW_POLYGON:"draw_polygon",DRAW_POINT:"draw_point",SIMPLE_SELECT:"simple_select",DIRECT_SELECT:"direct_select",STATIC:"static"},A="draw.create",D="draw.delete",N="draw.update",U="draw.selectionchange",R="draw.modechange",B="draw.actionable",V="draw.render",J="draw.combine",G="draw.uncombine",z="move",$="change_coordinates",W="feature",q="midpoint",Y="vertex",Z="true",K="false",X=["scrollZoom","boxZoom","dragRotate","dragPan","keyboard","doubleClickZoom","touchZoomRotate"],H={Point:0,LineString:1,Polygon:2};function Q(t,e){var n=H[t.geometry.type]-H[e.geometry.type];return 0===n&&t.geometry.type===w?t.area-e.area:n}function tt(t){if(this._items={},this._nums={},this._length=t?t.length:0,t)for(var e=0,n=t.length;e<n;e++)this.add(t[e]),void 0!==t[e]&&("string"==typeof t[e]?this._items[t[e]]=e:this._nums[t[e]]=e);}tt.prototype.add=function(t){return this.has(t)||(this._length++,"string"==typeof t?this._items[t]=this._length:this._nums[t]=this._length),this},tt.prototype.delete=function(t){return !1===this.has(t)||(this._length--,delete this._items[t],delete this._nums[t]),this},tt.prototype.has=function(t){return ("string"==typeof t||"number"==typeof t)&&(void 0!==this._items[t]||void 0!==this._nums[t])},tt.prototype.values=function(){var t=this,e=[];return Object.keys(this._items).forEach((function(n){e.push({k:n,v:t._items[n]});})),Object.keys(this._nums).forEach((function(n){e.push({k:JSON.parse(n),v:t._nums[n]});})),e.sort((function(t,e){return t.v-e.v})).map((function(t){return t.k}))},tt.prototype.clear=function(){return this._length=0,this._items={},this._nums={},this};var et=[W,q,Y],nt={click:function(t,e,n){return ot(t,e,n,n.options.clickBuffer)},touch:function(t,e,n){return ot(t,e,n,n.options.touchBuffer)}};function ot(t,e,n,o){if(null===n.map)return [];var r=t?function(t,e){return void 0===e&&(e=0),[[t.point.x-e,t.point.y-e],[t.point.x+e,t.point.y+e]]}(t,o):e,a={};n.options.styles&&(a.layers=n.options.styles.map((function(t){return t.id})));var s=n.map.queryRenderedFeatures(r,a).filter((function(t){return -1!==et.indexOf(t.properties.meta)})),u=new tt,c=[];return s.forEach((function(t){var e=t.properties.id;u.has(e)||(u.add(e),c.push(t));})),function(t){return t.map((function(t){return t.geometry.type===w&&(t.area=i.geometry({type:M,property:{},geometry:t.geometry})),t})).sort(Q).map((function(t){return delete t.area,t}))}(c)}function rt(t,e){var n=nt.click(t,null,e),o={mouse:C};return n[0]&&(o.mouse=n[0].properties.active===Z?_:x,o.feature=n[0].properties.meta),-1!==e.events.currentModeName().indexOf("draw")&&(o.mouse=b),e.ui.queueMapClasses(o),e.ui.updateMapClasses(),n[0]}function it(t,e){var n=t.x-e.x,o=t.y-e.y;return Math.sqrt(n*n+o*o)}function at(t,e,n){void 0===n&&(n={});var o=null!=n.fineTolerance?n.fineTolerance:4,r=null!=n.grossTolerance?n.grossTolerance:12,i=null!=n.interval?n.interval:500;t.point=t.point||e.point,t.time=t.time||e.time;var a=it(t.point,e.point);return a<o||a<r&&e.time-t.time<i}function st(t,e,n){void 0===n&&(n={});var o=null!=n.tolerance?n.tolerance:25,r=null!=n.interval?n.interval:250;return t.point=t.point||e.point,t.time=t.time||e.time,it(t.point,e.point)<o&&e.time-t.time<r}function ut(t,e){return t(e={exports:{}},e.exports),e.exports}var ct=ut((function(t){var e=t.exports=function(t,n){if(n||(n=16),void 0===t&&(t=128),t<=0)return "0";for(var o=Math.log(Math.pow(2,t))/Math.log(n),r=2;o===1/0;r*=2)o=Math.log(Math.pow(2,t/r))/Math.log(n)*r;var i=o-Math.floor(o),a="";for(r=0;r<Math.floor(o);r++){a=Math.floor(Math.random()*n).toString(n)+a;}if(i){var s=Math.pow(n,i);a=Math.floor(Math.random()*s).toString(n)+a;}var u=parseInt(a,n);return u!==1/0&&u>=Math.pow(2,t)?e(t,n):a};e.rack=function(t,n,o){var r=function(r){var a=0;do{if(a++>10){if(!o)throw new Error("too many ID collisions, use more bits");t+=o;}var s=e(t,n);}while(Object.hasOwnProperty.call(i,s));return i[s]=r,s},i=r.hats={};return r.get=function(t){return r.hats[t]},r.set=function(t,e){return r.hats[t]=e,r},r.bits=t||128,r.base=n||16,r};})),lt=function(t,e){this.ctx=t,this.properties=e.properties||{},this.coordinates=e.geometry.coordinates,this.id=e.id||ct(),this.type=e.geometry.type;};lt.prototype.changed=function(){this.ctx.store.featureChanged(this.id);},lt.prototype.incomingCoords=function(t){this.setCoordinates(t);},lt.prototype.setCoordinates=function(t){this.coordinates=t,this.changed();},lt.prototype.getCoordinates=function(){return JSON.parse(JSON.stringify(this.coordinates))},lt.prototype.setProperty=function(t,e){this.properties[t]=e;},lt.prototype.toGeoJSON=function(){return JSON.parse(JSON.stringify({id:this.id,type:M,properties:this.properties,geometry:{coordinates:this.getCoordinates(),type:this.type}}))},lt.prototype.internal=function(t){var e={id:this.id,meta:W,"meta:type":this.type,active:K,mode:t};if(this.ctx.options.userProperties)for(var n in this.properties)e["user_"+n]=this.properties[n];return {type:M,properties:e,geometry:{coordinates:this.getCoordinates(),type:this.type}}};var dt=function(t,e){lt.call(this,t,e);};(dt.prototype=Object.create(lt.prototype)).isValid=function(){return "number"==typeof this.coordinates[0]&&"number"==typeof this.coordinates[1]},dt.prototype.updateCoordinate=function(t,e,n){this.coordinates=3===arguments.length?[e,n]:[t,e],this.changed();},dt.prototype.getCoordinate=function(){return this.getCoordinates()};var pt=function(t,e){lt.call(this,t,e);};(pt.prototype=Object.create(lt.prototype)).isValid=function(){return this.coordinates.length>1},pt.prototype.addCoordinate=function(t,e,n){this.changed();var o=parseInt(t,10);this.coordinates.splice(o,0,[e,n]);},pt.prototype.getCoordinate=function(t){var e=parseInt(t,10);return JSON.parse(JSON.stringify(this.coordinates[e]))},pt.prototype.removeCoordinate=function(t){this.changed(),this.coordinates.splice(parseInt(t,10),1);},pt.prototype.updateCoordinate=function(t,e,n){var o=parseInt(t,10);this.coordinates[o]=[e,n],this.changed();};var ft=function(t,e){lt.call(this,t,e),this.coordinates=this.coordinates.map((function(t){return t.slice(0,-1)}));};(ft.prototype=Object.create(lt.prototype)).isValid=function(){return 0!==this.coordinates.length&&this.coordinates.every((function(t){return t.length>2}))},ft.prototype.incomingCoords=function(t){this.coordinates=t.map((function(t){return t.slice(0,-1)})),this.changed();},ft.prototype.setCoordinates=function(t){this.coordinates=t,this.changed();},ft.prototype.addCoordinate=function(t,e,n){this.changed();var o=t.split(".").map((function(t){return parseInt(t,10)}));this.coordinates[o[0]].splice(o[1],0,[e,n]);},ft.prototype.removeCoordinate=function(t){this.changed();var e=t.split(".").map((function(t){return parseInt(t,10)})),n=this.coordinates[e[0]];n&&(n.splice(e[1],1),n.length<3&&this.coordinates.splice(e[0],1));},ft.prototype.getCoordinate=function(t){var e=t.split(".").map((function(t){return parseInt(t,10)})),n=this.coordinates[e[0]];return JSON.parse(JSON.stringify(n[e[1]]))},ft.prototype.getCoordinates=function(){return this.coordinates.map((function(t){return t.concat([t[0]])}))},ft.prototype.updateCoordinate=function(t,e,n){this.changed();var o=t.split("."),r=parseInt(o[0],10),i=parseInt(o[1],10);void 0===this.coordinates[r]&&(this.coordinates[r]=[]),this.coordinates[r][i]=[e,n];};var ht={MultiPoint:dt,MultiLineString:pt,MultiPolygon:ft},gt=function(t,e,n,o,r){var i=n.split("."),a=parseInt(i[0],10),s=i[1]?i.slice(1).join("."):null;return t[a][e](s,o,r)},yt=function(t,e){if(lt.call(this,t,e),delete this.coordinates,this.model=ht[e.geometry.type],void 0===this.model)throw new TypeError(e.geometry.type+" is not a valid type");this.features=this._coordinatesToFeatures(e.geometry.coordinates);};function vt(t){this.map=t.map,this.drawConfig=JSON.parse(JSON.stringify(t.options||{})),this._ctx=t;}(yt.prototype=Object.create(lt.prototype))._coordinatesToFeatures=function(t){var e=this,n=this.model.bind(this);return t.map((function(t){return new n(e.ctx,{id:ct(),type:M,properties:{},geometry:{coordinates:t,type:e.type.replace("Multi","")}})}))},yt.prototype.isValid=function(){return this.features.every((function(t){return t.isValid()}))},yt.prototype.setCoordinates=function(t){this.features=this._coordinatesToFeatures(t),this.changed();},yt.prototype.getCoordinate=function(t){return gt(this.features,"getCoordinate",t)},yt.prototype.getCoordinates=function(){return JSON.parse(JSON.stringify(this.features.map((function(t){return t.type===w?t.getCoordinates():t.coordinates}))))},yt.prototype.updateCoordinate=function(t,e,n){gt(this.features,"updateCoordinate",t,e,n),this.changed();},yt.prototype.addCoordinate=function(t,e,n){gt(this.features,"addCoordinate",t,e,n),this.changed();},yt.prototype.removeCoordinate=function(t){gt(this.features,"removeCoordinate",t),this.changed();},yt.prototype.getFeatures=function(){return this.features},vt.prototype.setSelected=function(t){return this._ctx.store.setSelected(t)},vt.prototype.setSelectedCoordinates=function(t){var e=this;this._ctx.store.setSelectedCoordinates(t),t.reduce((function(t,n){return void 0===t[n.feature_id]&&(t[n.feature_id]=!0,e._ctx.store.get(n.feature_id).changed()),t}),{});},vt.prototype.getSelected=function(){return this._ctx.store.getSelected()},vt.prototype.getSelectedIds=function(){return this._ctx.store.getSelectedIds()},vt.prototype.isSelected=function(t){return this._ctx.store.isSelected(t)},vt.prototype.getFeature=function(t){return this._ctx.store.get(t)},vt.prototype.select=function(t){return this._ctx.store.select(t)},vt.prototype.deselect=function(t){return this._ctx.store.deselect(t)},vt.prototype.deleteFeature=function(t,e){return void 0===e&&(e={}),this._ctx.store.delete(t,e)},vt.prototype.addFeature=function(t){return this._ctx.store.add(t)},vt.prototype.clearSelectedFeatures=function(){return this._ctx.store.clearSelected()},vt.prototype.clearSelectedCoordinates=function(){return this._ctx.store.clearSelectedCoordinates()},vt.prototype.setActionableState=function(t){void 0===t&&(t={});var e={trash:t.trash||!1,combineFeatures:t.combineFeatures||!1,uncombineFeatures:t.uncombineFeatures||!1};return this._ctx.events.actionable(e)},vt.prototype.changeMode=function(t,e,n){return void 0===e&&(e={}),void 0===n&&(n={}),this._ctx.events.changeMode(t,e,n)},vt.prototype.updateUIClasses=function(t){return this._ctx.ui.queueMapClasses(t)},vt.prototype.activateUIButton=function(t){return this._ctx.ui.setActiveButton(t)},vt.prototype.featuresAt=function(t,e,n){if(void 0===n&&(n="click"),"click"!==n&&"touch"!==n)throw new Error("invalid buffer type");return nt[n](t,e,this._ctx)},vt.prototype.newFeature=function(t){var e=t.geometry.type;return e===L?new dt(this._ctx,t):e===I?new pt(this._ctx,t):e===w?new ft(this._ctx,t):new yt(this._ctx,t)},vt.prototype.isInstanceOf=function(t,e){if(t===L)return e instanceof dt;if(t===I)return e instanceof pt;if(t===w)return e instanceof ft;if("MultiFeature"===t)return e instanceof yt;throw new Error("Unknown feature class: "+t)},vt.prototype.doRender=function(t){return this._ctx.store.featureChanged(t)},vt.prototype.onSetup=function(){},vt.prototype.onDrag=function(){},vt.prototype.onClick=function(){},vt.prototype.onMouseMove=function(){},vt.prototype.onMouseDown=function(){},vt.prototype.onMouseUp=function(){},vt.prototype.onMouseOut=function(){},vt.prototype.onKeyUp=function(){},vt.prototype.onKeyDown=function(){},vt.prototype.onTouchStart=function(){},vt.prototype.onTouchMove=function(){},vt.prototype.onTouchEnd=function(){},vt.prototype.onTap=function(){},vt.prototype.onStop=function(){},vt.prototype.onTrash=function(){},vt.prototype.onCombineFeature=function(){},vt.prototype.onUncombineFeature=function(){},vt.prototype.toDisplayFeatures=function(){throw new Error("You must overwrite toDisplayFeatures")};var mt={drag:"onDrag",click:"onClick",mousemove:"onMouseMove",mousedown:"onMouseDown",mouseup:"onMouseUp",mouseout:"onMouseOut",keyup:"onKeyUp",keydown:"onKeyDown",touchstart:"onTouchStart",touchmove:"onTouchMove",touchend:"onTouchEnd",tap:"onTap"},bt=Object.keys(mt);function _t(t){var e=Object.keys(t);return function(n,o){void 0===o&&(o={});var r={},i=e.reduce((function(e,n){return e[n]=t[n],e}),new vt(n));return {start:function(){var e=this;r=i.onSetup(o),bt.forEach((function(n){var o,a=mt[n],s=function(){return !1};t[a]&&(s=function(){return !0}),e.on(n,s,(o=a,function(t){return i[o](r,t)}));}));},stop:function(){i.onStop(r);},trash:function(){i.onTrash(r);},combineFeatures:function(){i.onCombineFeatures(r);},uncombineFeatures:function(){i.onUncombineFeatures(r);},render:function(t,e){i.toDisplayFeatures(r,t,e);}}}}function St(t){return [].concat(t).filter((function(t){return void 0!==t}))}function xt(){var t=this;if(!(t.ctx.map&&void 0!==t.ctx.map.getSource(v)))return u();var e=t.ctx.events.currentModeName();t.ctx.ui.queueMapClasses({mode:e});var n=[],o=[];t.isDirty?o=t.getAllIds():(n=t.getChangedIds().filter((function(e){return void 0!==t.get(e)})),o=t.sources.hot.filter((function(e){return e.properties.id&&-1===n.indexOf(e.properties.id)&&void 0!==t.get(e.properties.id)})).map((function(t){return t.properties.id}))),t.sources.hot=[];var r=t.sources.cold.length;t.sources.cold=t.isDirty?[]:t.sources.cold.filter((function(t){var e=t.properties.id||t.properties.parent;return -1===n.indexOf(e)}));var i=r!==t.sources.cold.length||o.length>0;function a(n,o){var r=t.get(n).internal(e);t.ctx.events.currentModeRender(r,(function(e){t.sources[o].push(e);}));}if(n.forEach((function(t){return a(t,"hot")})),o.forEach((function(t){return a(t,"cold")})),i&&t.ctx.map.getSource(m).setData({type:P,features:t.sources.cold}),t.ctx.map.getSource(v).setData({type:P,features:t.sources.hot}),t._emitSelectionChange&&(t.ctx.map.fire(U,{features:t.getSelected().map((function(t){return t.toGeoJSON()})),points:t.getSelectedCoordinates().map((function(t){return {type:M,properties:{},geometry:{type:L,coordinates:t.coordinates}}}))}),t._emitSelectionChange=!1),t._deletedFeaturesToEmit.length){var s=t._deletedFeaturesToEmit.map((function(t){return t.toGeoJSON()}));t._deletedFeaturesToEmit=[],t.ctx.map.fire(D,{features:s});}function u(){t.isDirty=!1,t.clearChangedIds();}u(),t.ctx.map.fire(V,{});}function Ct(t){var e,n=this;this._features={},this._featureIds=new tt,this._selectedFeatureIds=new tt,this._selectedCoordinates=[],this._changedFeatureIds=new tt,this._deletedFeaturesToEmit=[],this._emitSelectionChange=!1,this._mapInitialConfig={},this.ctx=t,this.sources={hot:[],cold:[]},this.render=function(){e||(e=requestAnimationFrame((function(){e=null,xt.call(n);})));},this.isDirty=!1;}function Et(t,e){var n=t._selectedCoordinates.filter((function(e){return t._selectedFeatureIds.has(e.feature_id)}));t._selectedCoordinates.length===n.length||e.silent||(t._emitSelectionChange=!0),t._selectedCoordinates=n;}Ct.prototype.createRenderBatch=function(){var t=this,e=this.render,n=0;return this.render=function(){n++;},function(){t.render=e,n>0&&t.render();}},Ct.prototype.setDirty=function(){return this.isDirty=!0,this},Ct.prototype.featureChanged=function(t){return this._changedFeatureIds.add(t),this},Ct.prototype.getChangedIds=function(){return this._changedFeatureIds.values()},Ct.prototype.clearChangedIds=function(){return this._changedFeatureIds.clear(),this},Ct.prototype.getAllIds=function(){return this._featureIds.values()},Ct.prototype.add=function(t){return this.featureChanged(t.id),this._features[t.id]=t,this._featureIds.add(t.id),this},Ct.prototype.delete=function(t,e){var n=this;return void 0===e&&(e={}),St(t).forEach((function(t){n._featureIds.has(t)&&(n._featureIds.delete(t),n._selectedFeatureIds.delete(t),e.silent||-1===n._deletedFeaturesToEmit.indexOf(n._features[t])&&n._deletedFeaturesToEmit.push(n._features[t]),delete n._features[t],n.isDirty=!0);})),Et(this,e),this},Ct.prototype.get=function(t){return this._features[t]},Ct.prototype.getAll=function(){var t=this;return Object.keys(this._features).map((function(e){return t._features[e]}))},Ct.prototype.select=function(t,e){var n=this;return void 0===e&&(e={}),St(t).forEach((function(t){n._selectedFeatureIds.has(t)||(n._selectedFeatureIds.add(t),n._changedFeatureIds.add(t),e.silent||(n._emitSelectionChange=!0));})),this},Ct.prototype.deselect=function(t,e){var n=this;return void 0===e&&(e={}),St(t).forEach((function(t){n._selectedFeatureIds.has(t)&&(n._selectedFeatureIds.delete(t),n._changedFeatureIds.add(t),e.silent||(n._emitSelectionChange=!0));})),Et(this,e),this},Ct.prototype.clearSelected=function(t){return void 0===t&&(t={}),this.deselect(this._selectedFeatureIds.values(),{silent:t.silent}),this},Ct.prototype.setSelected=function(t,e){var n=this;return void 0===e&&(e={}),t=St(t),this.deselect(this._selectedFeatureIds.values().filter((function(e){return -1===t.indexOf(e)})),{silent:e.silent}),this.select(t.filter((function(t){return !n._selectedFeatureIds.has(t)})),{silent:e.silent}),this},Ct.prototype.setSelectedCoordinates=function(t){return this._selectedCoordinates=t,this._emitSelectionChange=!0,this},Ct.prototype.clearSelectedCoordinates=function(){return this._selectedCoordinates=[],this._emitSelectionChange=!0,this},Ct.prototype.getSelectedIds=function(){return this._selectedFeatureIds.values()},Ct.prototype.getSelected=function(){var t=this;return this._selectedFeatureIds.values().map((function(e){return t.get(e)}))},Ct.prototype.getSelectedCoordinates=function(){var t=this;return this._selectedCoordinates.map((function(e){return {coordinates:t.get(e.feature_id).getCoordinate(e.coord_path)}}))},Ct.prototype.isSelected=function(t){return this._selectedFeatureIds.has(t)},Ct.prototype.setFeatureProperty=function(t,e,n){this.get(t).setProperty(e,n),this.featureChanged(t);},Ct.prototype.storeMapConfig=function(){var t=this;X.forEach((function(e){t.ctx.map[e]&&(t._mapInitialConfig[e]=t.ctx.map[e].isEnabled());}));},Ct.prototype.restoreMapConfig=function(){var t=this;Object.keys(this._mapInitialConfig).forEach((function(e){t._mapInitialConfig[e]?t.ctx.map[e].enable():t.ctx.map[e].disable();}));},Ct.prototype.getInitialConfigValue=function(t){return void 0===this._mapInitialConfig[t]||this._mapInitialConfig[t]};var Mt=function(){for(var t=arguments,e={},n=0;n<arguments.length;n++){var o=t[n];for(var r in o)wt.call(o,r)&&(e[r]=o[r]);}return e},wt=Object.prototype.hasOwnProperty;var It=["mode","feature","mouse"];function Lt(e){var n=null,o=null,r={onRemove:function(){return e.map.off("load",r.connect),clearInterval(o),r.removeLayers(),e.store.restoreMapConfig(),e.ui.removeButtons(),e.events.removeEventListeners(),e.ui.clearMapClasses(),e.map=null,e.container=null,e.store=null,n&&n.parentNode&&n.parentNode.removeChild(n),n=null,this},connect:function(){e.map.off("load",r.connect),clearInterval(o),r.addLayers(),e.store.storeMapConfig(),e.events.addEventListeners();},onAdd:function(i){var y=i.fire;return i.fire=function(t,e){var n=arguments;return 1===y.length&&1!==arguments.length&&(n=[Mt({},{type:t},e)]),y.apply(i,n)},e.map=i,e.events=function(e){var n=Object.keys(e.options.modes).reduce((function(t,n){return t[n]=_t(e.options.modes[n]),t}),{}),o={},r={},i={},a=null,s=null;i.drag=function(t,n){n({point:t.point,time:(new Date).getTime()})?(e.ui.queueMapClasses({mouse:S}),s.drag(t)):t.originalEvent.stopPropagation();},i.mousedrag=function(t){i.drag(t,(function(t){return !at(o,t)}));},i.touchdrag=function(t){i.drag(t,(function(t){return !st(r,t)}));},i.mousemove=function(t){if(1===(void 0!==t.originalEvent.buttons?t.originalEvent.buttons:t.originalEvent.which))return i.mousedrag(t);var n=rt(t,e);t.featureTarget=n,s.mousemove(t);},i.mousedown=function(t){o={time:(new Date).getTime(),point:t.point};var n=rt(t,e);t.featureTarget=n,s.mousedown(t);},i.mouseup=function(t){var n=rt(t,e);t.featureTarget=n,at(o,{point:t.point,time:(new Date).getTime()})?s.click(t):s.mouseup(t);},i.mouseout=function(t){s.mouseout(t);},i.touchstart=function(t){if(t.originalEvent.preventDefault(),e.options.touchEnabled){r={time:(new Date).getTime(),point:t.point};var n=nt.touch(t,null,e)[0];t.featureTarget=n,s.touchstart(t);}},i.touchmove=function(t){if(t.originalEvent.preventDefault(),e.options.touchEnabled)return s.touchmove(t),i.touchdrag(t)},i.touchend=function(t){if(t.originalEvent.preventDefault(),e.options.touchEnabled){var n=nt.touch(t,null,e)[0];t.featureTarget=n,st(r,{time:(new Date).getTime(),point:t.point})?s.tap(t):s.touchend(t);}};var u=function(t){return !(8===t||46===t||t>=48&&t<=57)};function c(o,r,i){void 0===i&&(i={}),s.stop();var u=n[o];if(void 0===u)throw new Error(o+" is not valid");a=o;var c=u(e,r);s=t(c,e),i.silent||e.map.fire(R,{mode:o}),e.store.setDirty(),e.store.render();}i.keydown=function(t){"mapboxgl-canvas"===(t.srcElement||t.target).classList[0]&&(8!==t.keyCode&&46!==t.keyCode||!e.options.controls.trash?u(t.keyCode)?s.keydown(t):49===t.keyCode&&e.options.controls.point?c(j.DRAW_POINT):50===t.keyCode&&e.options.controls.line_string?c(j.DRAW_LINE_STRING):51===t.keyCode&&e.options.controls.polygon&&c(j.DRAW_POLYGON):(t.preventDefault(),s.trash()));},i.keyup=function(t){u(t.keyCode)&&s.keyup(t);},i.zoomend=function(){e.store.changeZoom();},i.data=function(t){if("style"===t.dataType){var n=e.setup,o=e.map,r=e.options,i=e.store;r.styles.some((function(t){return o.getLayer(t.id)}))||(n.addLayers(),i.setDirty(),i.render());}};var l={trash:!1,combineFeatures:!1,uncombineFeatures:!1};return {start:function(){a=e.options.defaultMode,s=t(n[a](e),e);},changeMode:c,actionable:function(t){var n=!1;Object.keys(t).forEach((function(e){if(void 0===l[e])throw new Error("Invalid action type");l[e]!==t[e]&&(n=!0),l[e]=t[e];})),n&&e.map.fire(B,{actions:l});},currentModeName:function(){return a},currentModeRender:function(t,e){return s.render(t,e)},fire:function(t,e){i[t]&&i[t](e);},addEventListeners:function(){e.map.on("mousemove",i.mousemove),e.map.on("mousedown",i.mousedown),e.map.on("mouseup",i.mouseup),e.map.on("data",i.data),e.map.on("touchmove",i.touchmove),e.map.on("touchstart",i.touchstart),e.map.on("touchend",i.touchend),e.container.addEventListener("mouseout",i.mouseout),e.options.keybindings&&(e.container.addEventListener("keydown",i.keydown),e.container.addEventListener("keyup",i.keyup));},removeEventListeners:function(){e.map.off("mousemove",i.mousemove),e.map.off("mousedown",i.mousedown),e.map.off("mouseup",i.mouseup),e.map.off("data",i.data),e.map.off("touchmove",i.touchmove),e.map.off("touchstart",i.touchstart),e.map.off("touchend",i.touchend),e.container.removeEventListener("mouseout",i.mouseout),e.options.keybindings&&(e.container.removeEventListener("keydown",i.keydown),e.container.removeEventListener("keyup",i.keyup));},trash:function(t){s.trash(t);},combineFeatures:function(){s.combineFeatures();},uncombineFeatures:function(){s.uncombineFeatures();},getMode:function(){return a}}}(e),e.ui=function(t){var e={},n=null,o={mode:null,feature:null,mouse:null},r={mode:null,feature:null,mouse:null};function i(t){r=Mt(r,t);}function y(){var e,n;if(t.container){var i=[],a=[];It.forEach((function(t){r[t]!==o[t]&&(i.push(t+"-"+o[t]),null!==r[t]&&a.push(t+"-"+r[t]));})),i.length>0&&(e=t.container.classList).remove.apply(e,i),a.length>0&&(n=t.container.classList).add.apply(n,a),o=Mt(o,r);}}function v(t,e){void 0===e&&(e={});var o=document.createElement("button");return o.className=s+" "+e.className,o.setAttribute("title",e.title),e.container.appendChild(o),o.addEventListener("click",(function(o){if(o.preventDefault(),o.stopPropagation(),o.target===n)return m(),void e.onDeactivate();b(t),e.onActivate();}),!0),o}function m(){n&&(n.classList.remove(g),n=null);}function b(t){m();var o=e[t];o&&o&&"trash"!==t&&(o.classList.add(g),n=o);}return {setActiveButton:b,queueMapClasses:i,updateMapClasses:y,clearMapClasses:function(){i({mode:null,feature:null,mouse:null}),y();},addButtons:function(){var n=t.options.controls,o=document.createElement("div");return o.className=h+" "+a,n?(n[E.LINE]&&(e[E.LINE]=v(E.LINE,{container:o,className:u,title:"LineString tool "+(t.options.keybindings?"(l)":""),onActivate:function(){return t.events.changeMode(j.DRAW_LINE_STRING)},onDeactivate:function(){return t.events.trash()}})),n[E.POLYGON]&&(e[E.POLYGON]=v(E.POLYGON,{container:o,className:c,title:"Polygon tool "+(t.options.keybindings?"(p)":""),onActivate:function(){return t.events.changeMode(j.DRAW_POLYGON)},onDeactivate:function(){return t.events.trash()}})),n[E.POINT]&&(e[E.POINT]=v(E.POINT,{container:o,className:l,title:"Marker tool "+(t.options.keybindings?"(m)":""),onActivate:function(){return t.events.changeMode(j.DRAW_POINT)},onDeactivate:function(){return t.events.trash()}})),n.trash&&(e.trash=v("trash",{container:o,className:d,title:"Delete",onActivate:function(){t.events.trash();}})),n.combine_features&&(e.combine_features=v("combineFeatures",{container:o,className:p,title:"Combine",onActivate:function(){t.events.combineFeatures();}})),n.uncombine_features&&(e.uncombine_features=v("uncombineFeatures",{container:o,className:f,title:"Uncombine",onActivate:function(){t.events.uncombineFeatures();}})),o):o},removeButtons:function(){Object.keys(e).forEach((function(t){var n=e[t];n.parentNode&&n.parentNode.removeChild(n),delete e[t];}));}}}(e),e.container=i.getContainer(),e.store=new Ct(e),n=e.ui.addButtons(),e.options.boxSelect&&(i.boxZoom.disable(),i.dragPan.disable(),i.dragPan.enable()),i.loaded()?r.connect():(i.on("load",r.connect),o=setInterval((function(){i.loaded()&&r.connect();}),16)),e.events.start(),n},addLayers:function(){e.map.addSource(m,{data:{type:P,features:[]},type:"geojson"}),e.map.addSource(v,{data:{type:P,features:[]},type:"geojson"}),e.options.styles.forEach((function(t){e.map.addLayer(t);})),e.store.setDirty(!0),e.store.render();},removeLayers:function(){e.options.styles.forEach((function(t){e.map.getLayer(t.id)&&e.map.removeLayer(t.id);})),e.map.getSource(m)&&e.map.removeSource(m),e.map.getSource(v)&&e.map.removeSource(v);}};return e.setup=r,r}function Pt(t){return function(e){var n=e.featureTarget;return !!n&&(!!n.properties&&n.properties.meta===t)}}function Ft(t){return !!t.featureTarget&&(!!t.featureTarget.properties&&(t.featureTarget.properties.active===Z&&t.featureTarget.properties.meta===W))}function Ot(t){return !!t.featureTarget&&(!!t.featureTarget.properties&&(t.featureTarget.properties.active===K&&t.featureTarget.properties.meta===W))}function kt(t){return void 0===t.featureTarget}function Tt(t){var e=t.featureTarget;return !!e&&(!!e.properties&&e.properties.meta===Y)}function jt(t){return !!t.originalEvent&&!0===t.originalEvent.shiftKey}function At(t){return 27===t.keyCode}function Dt(t){return 13===t.keyCode}var Nt=Ut;function Ut(t,e){this.x=t,this.y=e;}function Rt(t,e){var n=e.getBoundingClientRect();return new Nt(t.clientX-n.left-(e.clientLeft||0),t.clientY-n.top-(e.clientTop||0))}function Bt(t,e,n,o){return {type:M,properties:{meta:Y,parent:t,coord_path:n,active:o?Z:K},geometry:{type:L,coordinates:e}}}function Vt(t,e,n){void 0===e&&(e={}),void 0===n&&(n=null);var o,r=t.geometry,i=r.type,a=r.coordinates,s=t.properties&&t.properties.id,u=[];function c(t,n){var o="",r=null;t.forEach((function(t,i){var a=null!=n?n+"."+i:String(i),c=Bt(s,t,a,l(a));if(e.midpoints&&r){var d=function(t,e,n){var o=e.geometry.coordinates,r=n.geometry.coordinates;if(o[1]>85||o[1]<-85||r[1]>85||r[1]<-85)return null;var i={lng:(o[0]+r[0])/2,lat:(o[1]+r[1])/2};return {type:M,properties:{meta:q,parent:t,lng:i.lng,lat:i.lat,coord_path:n.properties.coord_path},geometry:{type:L,coordinates:[i.lng,i.lat]}}}(s,r,c);d&&u.push(d);}r=c;var p=JSON.stringify(t);o!==p&&u.push(c),0===i&&(o=p);}));}function l(t){return !!e.selectedPaths&&-1!==e.selectedPaths.indexOf(t)}return i===L?u.push(Bt(s,a,n,l(n))):i===w?a.forEach((function(t,e){c(t,null!==n?n+"."+e:String(e));})):i===I?c(a,n):0===i.indexOf(F)&&(o=i.replace(F,""),a.forEach((function(n,r){var i={type:M,properties:t.properties,geometry:{type:o,coordinates:n}};u=u.concat(Vt(i,e,r));}))),u}Ut.prototype={clone:function(){return new Ut(this.x,this.y)},add:function(t){return this.clone()._add(t)},sub:function(t){return this.clone()._sub(t)},multByPoint:function(t){return this.clone()._multByPoint(t)},divByPoint:function(t){return this.clone()._divByPoint(t)},mult:function(t){return this.clone()._mult(t)},div:function(t){return this.clone()._div(t)},rotate:function(t){return this.clone()._rotate(t)},rotateAround:function(t,e){return this.clone()._rotateAround(t,e)},matMult:function(t){return this.clone()._matMult(t)},unit:function(){return this.clone()._unit()},perp:function(){return this.clone()._perp()},round:function(){return this.clone()._round()},mag:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals:function(t){return this.x===t.x&&this.y===t.y},dist:function(t){return Math.sqrt(this.distSqr(t))},distSqr:function(t){var e=t.x-this.x,n=t.y-this.y;return e*e+n*n},angle:function(){return Math.atan2(this.y,this.x)},angleTo:function(t){return Math.atan2(this.y-t.y,this.x-t.x)},angleWith:function(t){return this.angleWithSep(t.x,t.y)},angleWithSep:function(t,e){return Math.atan2(this.x*e-this.y*t,this.x*t+this.y*e)},_matMult:function(t){var e=t[0]*this.x+t[1]*this.y,n=t[2]*this.x+t[3]*this.y;return this.x=e,this.y=n,this},_add:function(t){return this.x+=t.x,this.y+=t.y,this},_sub:function(t){return this.x-=t.x,this.y-=t.y,this},_mult:function(t){return this.x*=t,this.y*=t,this},_div:function(t){return this.x/=t,this.y/=t,this},_multByPoint:function(t){return this.x*=t.x,this.y*=t.y,this},_divByPoint:function(t){return this.x/=t.x,this.y/=t.y,this},_unit:function(){return this._div(this.mag()),this},_perp:function(){var t=this.y;return this.y=this.x,this.x=-t,this},_rotate:function(t){var e=Math.cos(t),n=Math.sin(t),o=e*this.x-n*this.y,r=n*this.x+e*this.y;return this.x=o,this.y=r,this},_rotateAround:function(t,e){var n=Math.cos(t),o=Math.sin(t),r=e.x+n*(this.x-e.x)-o*(this.y-e.y),i=e.y+o*(this.x-e.x)+n*(this.y-e.y);return this.x=r,this.y=i,this},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}},Ut.convert=function(t){return t instanceof Ut?t:Array.isArray(t)?new Ut(t[0],t[1]):t};var Jt=function(t){setTimeout((function(){t.map&&t.map.doubleClickZoom&&t._ctx&&t._ctx.store&&t._ctx.store.getInitialConfigValue&&t._ctx.store.getInitialConfigValue("doubleClickZoom")&&t.map.doubleClickZoom.enable();}),0);},Gt=function(t){setTimeout((function(){t.map&&t.map.doubleClickZoom&&t.map.doubleClickZoom.disable();}),0);},zt=function(t){if(!t||!t.type)return null;var e=$t[t.type];if(!e)return null;if("geometry"===e)return {type:"FeatureCollection",features:[{type:"Feature",properties:{},geometry:t}]};if("feature"===e)return {type:"FeatureCollection",features:[t]};if("featurecollection"===e)return t},$t={Point:"geometry",MultiPoint:"geometry",LineString:"geometry",MultiLineString:"geometry",Polygon:"geometry",MultiPolygon:"geometry",GeometryCollection:"geometry",Feature:"feature",FeatureCollection:"featurecollection"};function Wt(t){switch(t&&t.type||null){case"FeatureCollection":return t.features=t.features.reduce((function(t,e){return t.concat(Wt(e))}),[]),t;case"Feature":return t.geometry?Wt(t.geometry).map((function(e){var n={type:"Feature",properties:JSON.parse(JSON.stringify(t.properties)),geometry:e};return void 0!==t.id&&(n.id=t.id),n})):[t];case"MultiPoint":return t.coordinates.map((function(t){return {type:"Point",coordinates:t}}));case"MultiPolygon":return t.coordinates.map((function(t){return {type:"Polygon",coordinates:t}}));case"MultiLineString":return t.coordinates.map((function(t){return {type:"LineString",coordinates:t}}));case"GeometryCollection":return t.geometries.map(Wt).reduce((function(t,e){return t.concat(e)}),[]);case"Point":case"Polygon":case"LineString":return [t]}}var qt=function(t){if(!t)return [];var e=Wt(zt(t)),n=[];return e.features.forEach((function(t){t.geometry&&(n=n.concat(function t(e){return Array.isArray(e)&&e.length&&"number"==typeof e[0]?[e]:e.reduce((function(e,n){return Array.isArray(n)&&Array.isArray(n[0])?e.concat(t(n)):(e.push(n),e)}),[])}(t.geometry.coordinates)));})),n},Yt=ut((function(t){var e=t.exports=function(t){return new n(t)};function n(t){this.value=t;}function o(t,e,n){var o=[],a=[],l=!0;return function t(d){var p=n?r(d):d,f={},h=!0,g={node:p,node_:d,path:[].concat(o),parent:a[a.length-1],parents:a,key:o.slice(-1)[0],isRoot:0===o.length,level:o.length,circular:null,update:function(t,e){g.isRoot||(g.parent.node[g.key]=t),g.node=t,e&&(h=!1);},delete:function(t){delete g.parent.node[g.key],t&&(h=!1);},remove:function(t){s(g.parent.node)?g.parent.node.splice(g.key,1):delete g.parent.node[g.key],t&&(h=!1);},keys:null,before:function(t){f.before=t;},after:function(t){f.after=t;},pre:function(t){f.pre=t;},post:function(t){f.post=t;},stop:function(){l=!1;},block:function(){h=!1;}};if(!l)return g;function y(){if("object"==typeof g.node&&null!==g.node){g.keys&&g.node_===g.node||(g.keys=i(g.node)),g.isLeaf=0==g.keys.length;for(var t=0;t<a.length;t++)if(a[t].node_===d){g.circular=a[t];break}}else g.isLeaf=!0,g.keys=null;g.notLeaf=!g.isLeaf,g.notRoot=!g.isRoot;}y();var v=e.call(g,g.node);return void 0!==v&&g.update&&g.update(v),f.before&&f.before.call(g,g.node),h?("object"!=typeof g.node||null===g.node||g.circular||(a.push(g),y(),u(g.keys,(function(e,r){o.push(e),f.pre&&f.pre.call(g,g.node[e],e);var i=t(g.node[e]);n&&c.call(g.node,e)&&(g.node[e]=i.node),i.isLast=r==g.keys.length-1,i.isFirst=0==r,f.post&&f.post.call(g,i),o.pop();})),a.pop()),f.after&&f.after.call(g,g.node),g):g}(t).node}function r(t){if("object"==typeof t&&null!==t){var e;if(s(t))e=[];else if("[object Date]"===a(t))e=new Date(t.getTime?t.getTime():t);else if(function(t){return "[object RegExp]"===a(t)}(t))e=new RegExp(t);else if(function(t){return "[object Error]"===a(t)}(t))e={message:t.message};else if(function(t){return "[object Boolean]"===a(t)}(t))e=new Boolean(t);else if(function(t){return "[object Number]"===a(t)}(t))e=new Number(t);else if(function(t){return "[object String]"===a(t)}(t))e=new String(t);else if(Object.create&&Object.getPrototypeOf)e=Object.create(Object.getPrototypeOf(t));else if(t.constructor===Object)e={};else {var n=t.constructor&&t.constructor.prototype||t.__proto__||{},o=function(){};o.prototype=n,e=new o;}return u(i(t),(function(n){e[n]=t[n];})),e}return t}n.prototype.get=function(t){for(var e=this.value,n=0;n<t.length;n++){var o=t[n];if(!e||!c.call(e,o)){e=void 0;break}e=e[o];}return e},n.prototype.has=function(t){for(var e=this.value,n=0;n<t.length;n++){var o=t[n];if(!e||!c.call(e,o))return !1;e=e[o];}return !0},n.prototype.set=function(t,e){for(var n=this.value,o=0;o<t.length-1;o++){var r=t[o];c.call(n,r)||(n[r]={}),n=n[r];}return n[t[o]]=e,e},n.prototype.map=function(t){return o(this.value,t,!0)},n.prototype.forEach=function(t){return this.value=o(this.value,t,!1),this.value},n.prototype.reduce=function(t,e){var n=1===arguments.length,o=n?this.value:e;return this.forEach((function(e){this.isRoot&&n||(o=t.call(this,o,e));})),o},n.prototype.paths=function(){var t=[];return this.forEach((function(e){t.push(this.path);})),t},n.prototype.nodes=function(){var t=[];return this.forEach((function(e){t.push(this.node);})),t},n.prototype.clone=function(){var t=[],e=[];return function n(o){for(var a=0;a<t.length;a++)if(t[a]===o)return e[a];if("object"==typeof o&&null!==o){var s=r(o);return t.push(o),e.push(s),u(i(o),(function(t){s[t]=n(o[t]);})),t.pop(),e.pop(),s}return o}(this.value)};var i=Object.keys||function(t){var e=[];for(var n in t)e.push(n);return e};function a(t){return Object.prototype.toString.call(t)}var s=Array.isArray||function(t){return "[object Array]"===Object.prototype.toString.call(t)},u=function(t,e){if(t.forEach)return t.forEach(e);for(var n=0;n<t.length;n++)e(t[n],n,t);};u(i(n.prototype),(function(t){e[t]=function(e){var o=[].slice.call(arguments,1),r=new n(e);return r[t].apply(r,o)};}));var c=Object.hasOwnProperty||function(t,e){return e in t};})),Zt=Kt;function Kt(t){if(!(this instanceof Kt))return new Kt(t);this._bbox=t||[1/0,1/0,-1/0,-1/0],this._valid=!!t;}Kt.prototype.include=function(t){return this._valid=!0,this._bbox[0]=Math.min(this._bbox[0],t[0]),this._bbox[1]=Math.min(this._bbox[1],t[1]),this._bbox[2]=Math.max(this._bbox[2],t[0]),this._bbox[3]=Math.max(this._bbox[3],t[1]),this},Kt.prototype.equals=function(t){var e;return e=t instanceof Kt?t.bbox():t,this._bbox[0]==e[0]&&this._bbox[1]==e[1]&&this._bbox[2]==e[2]&&this._bbox[3]==e[3]},Kt.prototype.center=function(t){return this._valid?[(this._bbox[0]+this._bbox[2])/2,(this._bbox[1]+this._bbox[3])/2]:null},Kt.prototype.union=function(t){var e;return this._valid=!0,e=t instanceof Kt?t.bbox():t,this._bbox[0]=Math.min(this._bbox[0],e[0]),this._bbox[1]=Math.min(this._bbox[1],e[1]),this._bbox[2]=Math.max(this._bbox[2],e[2]),this._bbox[3]=Math.max(this._bbox[3],e[3]),this},Kt.prototype.bbox=function(){return this._valid?this._bbox:null},Kt.prototype.contains=function(t){if(!t)return this._fastContains();if(!this._valid)return null;var e=t[0],n=t[1];return this._bbox[0]<=e&&this._bbox[1]<=n&&this._bbox[2]>=e&&this._bbox[3]>=n},Kt.prototype.intersect=function(t){return this._valid?(e=t instanceof Kt?t.bbox():t,!(this._bbox[0]>e[2]||this._bbox[2]<e[0]||this._bbox[3]<e[1]||this._bbox[1]>e[3])):null;var e;},Kt.prototype._fastContains=function(){if(!this._valid)return new Function("return null;");var t="return "+this._bbox[0]+"<= ll[0] &&"+this._bbox[1]+"<= ll[1] &&"+this._bbox[2]+">= ll[0] &&"+this._bbox[3]+">= ll[1]";return new Function("ll",t)},Kt.prototype.polygon=function(){return this._valid?{type:"Polygon",coordinates:[[[this._bbox[0],this._bbox[1]],[this._bbox[2],this._bbox[1]],[this._bbox[2],this._bbox[3]],[this._bbox[0],this._bbox[3]],[this._bbox[0],this._bbox[1]]]]}:null};var Xt={features:["FeatureCollection"],coordinates:["Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon"],geometry:["Feature"],geometries:["GeometryCollection"]},Ht=Object.keys(Xt),Qt=function(t){return te(t).bbox()};function te(t){for(var e=Zt(),n=qt(t),o=0;o<n.length;o++)e.include(n[o]);return e}Qt.polygon=function(t){return te(t).polygon()},Qt.bboxify=function(t){return Yt(t).map((function(t){t&&(Ht.some((function(e){return !!t[e]&&-1!==Xt[e].indexOf(t.type)}))&&(t.bbox=te(t).bbox(),this.update(t)));}))};function ee(t,e){var n=-90,o=90,r=-90,i=90,a=270,s=-270;t.forEach((function(t){var e=Qt(t),u=e[1],c=e[3],l=e[0],d=e[2];u>n&&(n=u),c<o&&(o=c),c>r&&(r=c),u<i&&(i=u),l<a&&(a=l),d>s&&(s=d);}));var u=e;return n+u.lat>85&&(u.lat=85-n),r+u.lat>90&&(u.lat=90-r),o+u.lat<-85&&(u.lat=-85-o),i+u.lat<-90&&(u.lat=-90-i),a+u.lng<=-270&&(u.lng+=360*Math.ceil(Math.abs(u.lng)/360)),s+u.lng>=270&&(u.lng-=360*Math.ceil(Math.abs(u.lng)/360)),u}function ne(t,e){var n=ee(t.map((function(t){return t.toGeoJSON()})),e);t.forEach((function(t){var e,o=t.getCoordinates(),r=function(t){var e={lng:t[0]+n.lng,lat:t[1]+n.lat};return [e.lng,e.lat]},i=function(t){return t.map((function(t){return r(t)}))};t.type===L?e=r(o):t.type===I||t.type===O?e=o.map(r):t.type===w||t.type===k?e=o.map(i):t.type===T&&(e=o.map((function(t){return t.map((function(t){return i(t)}))}))),t.incomingCoords(e);}));}var oe={onSetup:function(t){var e=this,n={dragMoveLocation:null,boxSelectStartLocation:null,boxSelectElement:void 0,boxSelecting:!1,canBoxSelect:!1,dragMoving:!1,canDragMove:!1,initiallySelectedFeatureIds:t.featureIds||[]};return this.setSelected(n.initiallySelectedFeatureIds.filter((function(t){return void 0!==e.getFeature(t)}))),this.fireActionable(),this.setActionableState({combineFeatures:!0,uncombineFeatures:!0,trash:!0}),n},fireUpdate:function(){this.map.fire(N,{action:z,features:this.getSelected().map((function(t){return t.toGeoJSON()}))});},fireActionable:function(){var t=this,e=this.getSelected(),n=e.filter((function(e){return t.isInstanceOf("MultiFeature",e)})),o=!1;if(e.length>1){o=!0;var r=e[0].type.replace("Multi","");e.forEach((function(t){t.type.replace("Multi","")!==r&&(o=!1);}));}var i=n.length>0,a=e.length>0;this.setActionableState({combineFeatures:o,uncombineFeatures:i,trash:a});},getUniqueIds:function(t){return t.length?t.map((function(t){return t.properties.id})).filter((function(t){return void 0!==t})).reduce((function(t,e){return t.add(e),t}),new tt).values():[]},stopExtendedInteractions:function(t){t.boxSelectElement&&(t.boxSelectElement.parentNode&&t.boxSelectElement.parentNode.removeChild(t.boxSelectElement),t.boxSelectElement=null),this.map.dragPan.enable(),t.boxSelecting=!1,t.canBoxSelect=!1,t.dragMoving=!1,t.canDragMove=!1;},onStop:function(){Jt(this);},onMouseMove:function(t){return this.stopExtendedInteractions(t),!0},onMouseOut:function(t){return !t.dragMoving||this.fireUpdate()}};oe.onTap=oe.onClick=function(t,e){return kt(e)?this.clickAnywhere(t,e):Pt(Y)(e)?this.clickOnVertex(t,e):function(t){return !!t.featureTarget&&(!!t.featureTarget.properties&&t.featureTarget.properties.meta===W)}(e)?this.clickOnFeature(t,e):void 0},oe.clickAnywhere=function(t){var e=this,n=this.getSelectedIds();n.length&&(this.clearSelectedFeatures(),n.forEach((function(t){return e.doRender(t)}))),Jt(this),this.stopExtendedInteractions(t);},oe.clickOnVertex=function(t,e){this.changeMode(j.DIRECT_SELECT,{featureId:e.featureTarget.properties.parent,coordPath:e.featureTarget.properties.coord_path,startPos:e.lngLat}),this.updateUIClasses({mouse:_});},oe.startOnActiveFeature=function(t,e){this.stopExtendedInteractions(t),this.map.dragPan.disable(),this.doRender(e.featureTarget.properties.id),t.canDragMove=!0,t.dragMoveLocation=e.lngLat;},oe.clickOnFeature=function(t,e){var n=this;Gt(this),this.stopExtendedInteractions(t);var o=jt(e),r=this.getSelectedIds(),i=e.featureTarget.properties.id,a=this.isSelected(i);if(!o&&a&&this.getFeature(i).type!==L)return this.changeMode(j.DIRECT_SELECT,{featureId:i});a&&o?(this.deselect(i),this.updateUIClasses({mouse:x}),1===r.length&&Jt(this)):!a&&o?(this.select(i),this.updateUIClasses({mouse:_})):a||o||(r.forEach((function(t){return n.doRender(t)})),this.setSelected(i),this.updateUIClasses({mouse:_})),this.doRender(i);},oe.onMouseDown=function(t,e){return Ft(e)?this.startOnActiveFeature(t,e):this.drawConfig.boxSelect&&function(t){return !!t.originalEvent&&(!!t.originalEvent.shiftKey&&0===t.originalEvent.button)}(e)?this.startBoxSelect(t,e):void 0},oe.startBoxSelect=function(t,e){this.stopExtendedInteractions(t),this.map.dragPan.disable(),t.boxSelectStartLocation=Rt(e.originalEvent,this.map.getContainer()),t.canBoxSelect=!0;},oe.onTouchStart=function(t,e){if(Ft(e))return this.startOnActiveFeature(t,e)},oe.onDrag=function(t,e){return t.canDragMove?this.dragMove(t,e):this.drawConfig.boxSelect&&t.canBoxSelect?this.whileBoxSelect(t,e):void 0},oe.whileBoxSelect=function(t,e){t.boxSelecting=!0,this.updateUIClasses({mouse:b}),t.boxSelectElement||(t.boxSelectElement=document.createElement("div"),t.boxSelectElement.classList.add(y),this.map.getContainer().appendChild(t.boxSelectElement));var n=Rt(e.originalEvent,this.map.getContainer()),o=Math.min(t.boxSelectStartLocation.x,n.x),r=Math.max(t.boxSelectStartLocation.x,n.x),i=Math.min(t.boxSelectStartLocation.y,n.y),a=Math.max(t.boxSelectStartLocation.y,n.y),s="translate("+o+"px, "+i+"px)";t.boxSelectElement.style.transform=s,t.boxSelectElement.style.WebkitTransform=s,t.boxSelectElement.style.width=r-o+"px",t.boxSelectElement.style.height=a-i+"px";},oe.dragMove=function(t,e){t.dragMoving=!0,e.originalEvent.stopPropagation();var n={lng:e.lngLat.lng-t.dragMoveLocation.lng,lat:e.lngLat.lat-t.dragMoveLocation.lat};ne(this.getSelected(),n),t.dragMoveLocation=e.lngLat;},oe.onMouseUp=function(t,e){var n=this;if(t.dragMoving)this.fireUpdate();else if(t.boxSelecting){var o=[t.boxSelectStartLocation,Rt(e.originalEvent,this.map.getContainer())],r=this.featuresAt(null,o,"click"),i=this.getUniqueIds(r).filter((function(t){return !n.isSelected(t)}));i.length&&(this.select(i),i.forEach((function(t){return n.doRender(t)})),this.updateUIClasses({mouse:_}));}this.stopExtendedInteractions(t);},oe.toDisplayFeatures=function(t,e,n){e.properties.active=this.isSelected(e.properties.id)?Z:K,n(e),this.fireActionable(),e.properties.active===Z&&e.geometry.type!==L&&Vt(e).forEach(n);},oe.onTrash=function(){this.deleteFeature(this.getSelectedIds()),this.fireActionable();},oe.onCombineFeatures=function(){var t=this.getSelected();if(!(0===t.length||t.length<2)){for(var e=[],n=[],o=t[0].type.replace("Multi",""),r=0;r<t.length;r++){var i=t[r];if(i.type.replace("Multi","")!==o)return;i.type.includes("Multi")?i.getCoordinates().forEach((function(t){e.push(t);})):e.push(i.getCoordinates()),n.push(i.toGeoJSON());}if(n.length>1){var a=this.newFeature({type:M,properties:n[0].properties,geometry:{type:"Multi"+o,coordinates:e}});this.addFeature(a),this.deleteFeature(this.getSelectedIds(),{silent:!0}),this.setSelected([a.id]),this.map.fire(J,{createdFeatures:[a.toGeoJSON()],deletedFeatures:n});}this.fireActionable();}},oe.onUncombineFeatures=function(){var t=this,e=this.getSelected();if(0!==e.length){for(var n=[],o=[],r=function(r){var i=e[r];t.isInstanceOf("MultiFeature",i)&&(i.getFeatures().forEach((function(e){t.addFeature(e),e.properties=i.properties,n.push(e.toGeoJSON()),t.select([e.id]);})),t.deleteFeature(i.id,{silent:!0}),o.push(i.toGeoJSON()));},i=0;i<e.length;i++)r(i);n.length>1&&this.map.fire(G,{createdFeatures:n,deletedFeatures:o}),this.fireActionable();}};var re=Pt(Y),ie=Pt(q),ae={fireUpdate:function(){this.map.fire(N,{action:$,features:this.getSelected().map((function(t){return t.toGeoJSON()}))});},fireActionable:function(t){this.setActionableState({combineFeatures:!1,uncombineFeatures:!1,trash:t.selectedCoordPaths.length>0});},startDragging:function(t,e){this.map.dragPan.disable(),t.canDragMove=!0,t.dragMoveLocation=e.lngLat;},stopDragging:function(t){this.map.dragPan.enable(),t.dragMoving=!1,t.canDragMove=!1,t.dragMoveLocation=null;},onVertex:function(t,e){this.startDragging(t,e);var n=e.featureTarget.properties,o=t.selectedCoordPaths.indexOf(n.coord_path);jt(e)||-1!==o?jt(e)&&-1===o&&t.selectedCoordPaths.push(n.coord_path):t.selectedCoordPaths=[n.coord_path];var r=this.pathsToCoordinates(t.featureId,t.selectedCoordPaths);this.setSelectedCoordinates(r);},onMidpoint:function(t,e){this.startDragging(t,e);var n=e.featureTarget.properties;t.feature.addCoordinate(n.coord_path,n.lng,n.lat),this.fireUpdate(),t.selectedCoordPaths=[n.coord_path];},pathsToCoordinates:function(t,e){return e.map((function(e){return {feature_id:t,coord_path:e}}))},onFeature:function(t,e){0===t.selectedCoordPaths.length?this.startDragging(t,e):this.stopDragging(t);},dragFeature:function(t,e,n){ne(this.getSelected(),n),t.dragMoveLocation=e.lngLat;},dragVertex:function(t,e,n){for(var o=t.selectedCoordPaths.map((function(e){return t.feature.getCoordinate(e)})),r=ee(o.map((function(t){return {type:M,properties:{},geometry:{type:L,coordinates:t}}})),n),i=0;i<o.length;i++){var a=o[i];t.feature.updateCoordinate(t.selectedCoordPaths[i],a[0]+r.lng,a[1]+r.lat);}},clickNoTarget:function(){this.changeMode(j.SIMPLE_SELECT);},clickInactive:function(){this.changeMode(j.SIMPLE_SELECT);},clickActiveFeature:function(t){t.selectedCoordPaths=[],this.clearSelectedCoordinates(),t.feature.changed();},onSetup:function(t){var e=t.featureId,n=this.getFeature(e);if(!n)throw new Error("You must provide a featureId to enter direct_select mode");if(n.type===L)throw new TypeError("direct_select mode doesn't handle point features");var o={featureId:e,feature:n,dragMoveLocation:t.startPos||null,dragMoving:!1,canDragMove:!1,selectedCoordPaths:t.coordPath?[t.coordPath]:[]};return this.setSelectedCoordinates(this.pathsToCoordinates(e,o.selectedCoordPaths)),this.setSelected(e),Gt(this),this.setActionableState({trash:!0}),o},onStop:function(){Jt(this),this.clearSelectedCoordinates();},toDisplayFeatures:function(t,e,n){t.featureId===e.properties.id?(e.properties.active=Z,n(e),Vt(e,{map:this.map,midpoints:!0,selectedPaths:t.selectedCoordPaths}).forEach(n)):(e.properties.active=K,n(e)),this.fireActionable(t);},onTrash:function(t){t.selectedCoordPaths.sort((function(t,e){return e.localeCompare(t,"en",{numeric:!0})})).forEach((function(e){return t.feature.removeCoordinate(e)})),this.fireUpdate(),t.selectedCoordPaths=[],this.clearSelectedCoordinates(),this.fireActionable(t),!1===t.feature.isValid()&&(this.deleteFeature([t.featureId]),this.changeMode(j.SIMPLE_SELECT,{}));},onMouseMove:function(t,e){var n=Ft(e),o=re(e),r=0===t.selectedCoordPaths.length;return n&&r||o&&!r?this.updateUIClasses({mouse:_}):this.updateUIClasses({mouse:C}),this.stopDragging(t),!0},onMouseOut:function(t){return t.dragMoving&&this.fireUpdate(),!0}};ae.onTouchStart=ae.onMouseDown=function(t,e){return re(e)?this.onVertex(t,e):Ft(e)?this.onFeature(t,e):ie(e)?this.onMidpoint(t,e):void 0},ae.onDrag=function(t,e){if(!0===t.canDragMove){t.dragMoving=!0,e.originalEvent.stopPropagation();var n={lng:e.lngLat.lng-t.dragMoveLocation.lng,lat:e.lngLat.lat-t.dragMoveLocation.lat};t.selectedCoordPaths.length>0?this.dragVertex(t,e,n):this.dragFeature(t,e,n),t.dragMoveLocation=e.lngLat;}},ae.onClick=function(t,e){return kt(e)?this.clickNoTarget(t,e):Ft(e)?this.clickActiveFeature(t,e):Ot(e)?this.clickInactive(t,e):void this.stopDragging(t)},ae.onTap=function(t,e){return kt(e)?this.clickNoTarget(t,e):Ft(e)?this.clickActiveFeature(t,e):Ot(e)?this.clickInactive(t,e):void 0},ae.onTouchEnd=ae.onMouseUp=function(t){t.dragMoving&&this.fireUpdate(),this.stopDragging(t);};var se={};function ue(t,e){return !!t.lngLat&&(t.lngLat.lng===e[0]&&t.lngLat.lat===e[1])}se.onSetup=function(){var t=this.newFeature({type:M,properties:{},geometry:{type:L,coordinates:[]}});return this.addFeature(t),this.clearSelectedFeatures(),this.updateUIClasses({mouse:b}),this.activateUIButton(E.POINT),this.setActionableState({trash:!0}),{point:t}},se.stopDrawingAndRemove=function(t){this.deleteFeature([t.point.id],{silent:!0}),this.changeMode(j.SIMPLE_SELECT);},se.onTap=se.onClick=function(t,e){this.updateUIClasses({mouse:_}),t.point.updateCoordinate("",e.lngLat.lng,e.lngLat.lat),this.map.fire(A,{features:[t.point.toGeoJSON()]}),this.changeMode(j.SIMPLE_SELECT,{featureIds:[t.point.id]});},se.onStop=function(t){this.activateUIButton(),t.point.getCoordinate().length||this.deleteFeature([t.point.id],{silent:!0});},se.toDisplayFeatures=function(t,e,n){var o=e.properties.id===t.point.id;if(e.properties.active=o?Z:K,!o)return n(e)},se.onTrash=se.stopDrawingAndRemove,se.onKeyUp=function(t,e){if(At(e)||Dt(e))return this.stopDrawingAndRemove(t,e)};var ce={onSetup:function(){var t=this.newFeature({type:M,properties:{},geometry:{type:w,coordinates:[[]]}});return this.addFeature(t),this.clearSelectedFeatures(),Gt(this),this.updateUIClasses({mouse:b}),this.activateUIButton(E.POLYGON),this.setActionableState({trash:!0}),{polygon:t,currentVertexPosition:0}},clickAnywhere:function(t,e){if(t.currentVertexPosition>0&&ue(e,t.polygon.coordinates[0][t.currentVertexPosition-1]))return this.changeMode(j.SIMPLE_SELECT,{featureIds:[t.polygon.id]});this.updateUIClasses({mouse:b}),t.polygon.updateCoordinate("0."+t.currentVertexPosition,e.lngLat.lng,e.lngLat.lat),t.currentVertexPosition++,t.polygon.updateCoordinate("0."+t.currentVertexPosition,e.lngLat.lng,e.lngLat.lat);},clickOnVertex:function(t){return this.changeMode(j.SIMPLE_SELECT,{featureIds:[t.polygon.id]})},onMouseMove:function(t,e){t.polygon.updateCoordinate("0."+t.currentVertexPosition,e.lngLat.lng,e.lngLat.lat),Tt(e)&&this.updateUIClasses({mouse:x});}};ce.onTap=ce.onClick=function(t,e){return Tt(e)?this.clickOnVertex(t,e):this.clickAnywhere(t,e)},ce.onKeyUp=function(t,e){At(e)?(this.deleteFeature([t.polygon.id],{silent:!0}),this.changeMode(j.SIMPLE_SELECT)):Dt(e)&&this.changeMode(j.SIMPLE_SELECT,{featureIds:[t.polygon.id]});},ce.onStop=function(t){this.updateUIClasses({mouse:C}),Jt(this),this.activateUIButton(),void 0!==this.getFeature(t.polygon.id)&&(t.polygon.removeCoordinate("0."+t.currentVertexPosition),t.polygon.isValid()?this.map.fire(A,{features:[t.polygon.toGeoJSON()]}):(this.deleteFeature([t.polygon.id],{silent:!0}),this.changeMode(j.SIMPLE_SELECT,{},{silent:!0})));},ce.toDisplayFeatures=function(t,e,n){var o=e.properties.id===t.polygon.id;if(e.properties.active=o?Z:K,!o)return n(e);if(0!==e.geometry.coordinates.length){var r=e.geometry.coordinates[0].length;if(!(r<3)){if(e.properties.meta=W,n(Bt(t.polygon.id,e.geometry.coordinates[0][0],"0.0",!1)),r>3){var i=e.geometry.coordinates[0].length-3;n(Bt(t.polygon.id,e.geometry.coordinates[0][i],"0."+i,!1));}if(r<=4){var a=[[e.geometry.coordinates[0][0][0],e.geometry.coordinates[0][0][1]],[e.geometry.coordinates[0][1][0],e.geometry.coordinates[0][1][1]]];if(n({type:M,properties:e.properties,geometry:{coordinates:a,type:I}}),3===r)return}return n(e)}}},ce.onTrash=function(t){this.deleteFeature([t.polygon.id],{silent:!0}),this.changeMode(j.SIMPLE_SELECT);};var le={onSetup:function(t){var e,n,o=(t=t||{}).featureId,r="forward";if(o){if(!(e=this.getFeature(o)))throw new Error("Could not find a feature with the provided featureId");var i=t.from;if(i&&"Feature"===i.type&&i.geometry&&"Point"===i.geometry.type&&(i=i.geometry),i&&"Point"===i.type&&i.coordinates&&2===i.coordinates.length&&(i=i.coordinates),!i||!Array.isArray(i))throw new Error("Please use the `from` property to indicate which point to continue the line from");var a=e.coordinates.length-1;if(e.coordinates[a][0]===i[0]&&e.coordinates[a][1]===i[1])n=a+1,e.addCoordinate.apply(e,[n].concat(e.coordinates[a]));else {if(e.coordinates[0][0]!==i[0]||e.coordinates[0][1]!==i[1])throw new Error("`from` should match the point at either the start or the end of the provided LineString");r="backwards",n=0,e.addCoordinate.apply(e,[n].concat(e.coordinates[0]));}}else e=this.newFeature({type:M,properties:{},geometry:{type:I,coordinates:[]}}),n=0,this.addFeature(e);return this.clearSelectedFeatures(),Gt(this),this.updateUIClasses({mouse:b}),this.activateUIButton(E.LINE),this.setActionableState({trash:!0}),{line:e,currentVertexPosition:n,direction:r}},clickAnywhere:function(t,e){if(t.currentVertexPosition>0&&ue(e,t.line.coordinates[t.currentVertexPosition-1])||"backwards"===t.direction&&ue(e,t.line.coordinates[t.currentVertexPosition+1]))return this.changeMode(j.SIMPLE_SELECT,{featureIds:[t.line.id]});this.updateUIClasses({mouse:b}),t.line.updateCoordinate(t.currentVertexPosition,e.lngLat.lng,e.lngLat.lat),"forward"===t.direction?(t.currentVertexPosition++,t.line.updateCoordinate(t.currentVertexPosition,e.lngLat.lng,e.lngLat.lat)):t.line.addCoordinate(0,e.lngLat.lng,e.lngLat.lat);},clickOnVertex:function(t){return this.changeMode(j.SIMPLE_SELECT,{featureIds:[t.line.id]})},onMouseMove:function(t,e){t.line.updateCoordinate(t.currentVertexPosition,e.lngLat.lng,e.lngLat.lat),Tt(e)&&this.updateUIClasses({mouse:x});}};le.onTap=le.onClick=function(t,e){if(Tt(e))return this.clickOnVertex(t,e);this.clickAnywhere(t,e);},le.onKeyUp=function(t,e){Dt(e)?this.changeMode(j.SIMPLE_SELECT,{featureIds:[t.line.id]}):At(e)&&(this.deleteFeature([t.line.id],{silent:!0}),this.changeMode(j.SIMPLE_SELECT));},le.onStop=function(t){Jt(this),this.activateUIButton(),void 0!==this.getFeature(t.line.id)&&(t.line.removeCoordinate(""+t.currentVertexPosition),t.line.isValid()?this.map.fire(A,{features:[t.line.toGeoJSON()]}):(this.deleteFeature([t.line.id],{silent:!0}),this.changeMode(j.SIMPLE_SELECT,{},{silent:!0})));},le.onTrash=function(t){this.deleteFeature([t.line.id],{silent:!0}),this.changeMode(j.SIMPLE_SELECT);},le.toDisplayFeatures=function(t,e,n){var o=e.properties.id===t.line.id;if(e.properties.active=o?Z:K,!o)return n(e);e.geometry.coordinates.length<2||(e.properties.meta=W,n(Bt(t.line.id,e.geometry.coordinates["forward"===t.direction?e.geometry.coordinates.length-2:1],""+("forward"===t.direction?e.geometry.coordinates.length-2:1),!1)),n(e));};var de={simple_select:oe,direct_select:ae,draw_point:se,draw_polygon:ce,draw_line_string:le},pe={defaultMode:j.SIMPLE_SELECT,keybindings:!0,touchEnabled:!0,clickBuffer:2,touchBuffer:25,boxSelect:!0,displayControlsDefault:!0,styles:[{id:"gl-draw-polygon-fill-inactive",type:"fill",filter:["all",["==","active","false"],["==","$type","Polygon"],["!=","mode","static"]],paint:{"fill-color":"#3bb2d0","fill-outline-color":"#3bb2d0","fill-opacity":.1}},{id:"gl-draw-polygon-fill-active",type:"fill",filter:["all",["==","active","true"],["==","$type","Polygon"]],paint:{"fill-color":"#fbb03b","fill-outline-color":"#fbb03b","fill-opacity":.1}},{id:"gl-draw-polygon-midpoint",type:"circle",filter:["all",["==","$type","Point"],["==","meta","midpoint"]],paint:{"circle-radius":3,"circle-color":"#fbb03b"}},{id:"gl-draw-polygon-stroke-inactive",type:"line",filter:["all",["==","active","false"],["==","$type","Polygon"],["!=","mode","static"]],layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#3bb2d0","line-width":2}},{id:"gl-draw-polygon-stroke-active",type:"line",filter:["all",["==","active","true"],["==","$type","Polygon"]],layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#fbb03b","line-dasharray":[.2,2],"line-width":2}},{id:"gl-draw-line-inactive",type:"line",filter:["all",["==","active","false"],["==","$type","LineString"],["!=","mode","static"]],layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#3bb2d0","line-width":2}},{id:"gl-draw-line-active",type:"line",filter:["all",["==","$type","LineString"],["==","active","true"]],layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#fbb03b","line-dasharray":[.2,2],"line-width":2}},{id:"gl-draw-polygon-and-line-vertex-stroke-inactive",type:"circle",filter:["all",["==","meta","vertex"],["==","$type","Point"],["!=","mode","static"]],paint:{"circle-radius":5,"circle-color":"#fff"}},{id:"gl-draw-polygon-and-line-vertex-inactive",type:"circle",filter:["all",["==","meta","vertex"],["==","$type","Point"],["!=","mode","static"]],paint:{"circle-radius":3,"circle-color":"#fbb03b"}},{id:"gl-draw-point-point-stroke-inactive",type:"circle",filter:["all",["==","active","false"],["==","$type","Point"],["==","meta","feature"],["!=","mode","static"]],paint:{"circle-radius":5,"circle-opacity":1,"circle-color":"#fff"}},{id:"gl-draw-point-inactive",type:"circle",filter:["all",["==","active","false"],["==","$type","Point"],["==","meta","feature"],["!=","mode","static"]],paint:{"circle-radius":3,"circle-color":"#3bb2d0"}},{id:"gl-draw-point-stroke-active",type:"circle",filter:["all",["==","$type","Point"],["==","active","true"],["!=","meta","midpoint"]],paint:{"circle-radius":7,"circle-color":"#fff"}},{id:"gl-draw-point-active",type:"circle",filter:["all",["==","$type","Point"],["!=","meta","midpoint"],["==","active","true"]],paint:{"circle-radius":5,"circle-color":"#fbb03b"}},{id:"gl-draw-polygon-fill-static",type:"fill",filter:["all",["==","mode","static"],["==","$type","Polygon"]],paint:{"fill-color":"#404040","fill-outline-color":"#404040","fill-opacity":.1}},{id:"gl-draw-polygon-stroke-static",type:"line",filter:["all",["==","mode","static"],["==","$type","Polygon"]],layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#404040","line-width":2}},{id:"gl-draw-line-static",type:"line",filter:["all",["==","mode","static"],["==","$type","LineString"]],layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#404040","line-width":2}},{id:"gl-draw-point-static",type:"circle",filter:["all",["==","mode","static"],["==","$type","Point"]],paint:{"circle-radius":5,"circle-color":"#404040"}}],modes:de,controls:{},userProperties:!1},fe={point:!0,line_string:!0,polygon:!0,trash:!0,combine_features:!0,uncombine_features:!0},he={point:!1,line_string:!1,polygon:!1,trash:!1,combine_features:!1,uncombine_features:!1};function ge(t,e){return t.map((function(t){return t.source?t:Mt(t,{id:t.id+"."+e,source:"hot"===e?v:m})}))}var ye=ut((function(t,e){var n="[object Arguments]",o="[object Map]",r="[object Object]",i="[object Set]",a=/^\[object .+?Constructor\]$/,s=/^(?:0|[1-9]\d*)$/,u={};u["[object Float32Array]"]=u["[object Float64Array]"]=u["[object Int8Array]"]=u["[object Int16Array]"]=u["[object Int32Array]"]=u["[object Uint8Array]"]=u["[object Uint8ClampedArray]"]=u["[object Uint16Array]"]=u["[object Uint32Array]"]=!0,u[n]=u["[object Array]"]=u["[object ArrayBuffer]"]=u["[object Boolean]"]=u["[object DataView]"]=u["[object Date]"]=u["[object Error]"]=u["[object Function]"]=u[o]=u["[object Number]"]=u[r]=u["[object RegExp]"]=u[i]=u["[object String]"]=u["[object WeakMap]"]=!1;var c="object"==typeof commonjsGlobal&&commonjsGlobal&&commonjsGlobal.Object===Object&&commonjsGlobal,l="object"==typeof self&&self&&self.Object===Object&&self,d=c||l||Function("return this")(),p=e&&!e.nodeType&&e,f=p&&t&&!t.nodeType&&t,h=f&&f.exports===p,g=h&&c.process,y=function(){try{return g&&g.binding&&g.binding("util")}catch(t){}}(),v=y&&y.isTypedArray;function m(t,e){for(var n=-1,o=null==t?0:t.length;++n<o;)if(e(t[n],n,t))return !0;return !1}function b(t){var e=-1,n=Array(t.size);return t.forEach((function(t,o){n[++e]=[o,t];})),n}function _(t){var e=-1,n=Array(t.size);return t.forEach((function(t){n[++e]=t;})),n}var S,x,C,E=Array.prototype,M=Function.prototype,w=Object.prototype,I=d["__core-js_shared__"],L=M.toString,P=w.hasOwnProperty,F=(S=/[^.]+$/.exec(I&&I.keys&&I.keys.IE_PROTO||""))?"Symbol(src)_1."+S:"",O=w.toString,k=RegExp("^"+L.call(P).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),T=h?d.Buffer:void 0,j=d.Symbol,A=d.Uint8Array,D=w.propertyIsEnumerable,N=E.splice,U=j?j.toStringTag:void 0,R=Object.getOwnPropertySymbols,B=T?T.isBuffer:void 0,V=(x=Object.keys,C=Object,function(t){return x(C(t))}),J=yt(d,"DataView"),G=yt(d,"Map"),z=yt(d,"Promise"),$=yt(d,"Set"),W=yt(d,"WeakMap"),q=yt(Object,"create"),Y=_t(J),Z=_t(G),K=_t(z),X=_t($),H=_t(W),Q=j?j.prototype:void 0,tt=Q?Q.valueOf:void 0;function et(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var o=t[e];this.set(o[0],o[1]);}}function nt(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var o=t[e];this.set(o[0],o[1]);}}function ot(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var o=t[e];this.set(o[0],o[1]);}}function rt(t){var e=-1,n=null==t?0:t.length;for(this.__data__=new ot;++e<n;)this.add(t[e]);}function it(t){var e=this.__data__=new nt(t);this.size=e.size;}function at(t,e){var n=Ct(t),o=!n&&xt(t),r=!n&&!o&&Et(t),i=!n&&!o&&!r&&Pt(t),a=n||o||r||i,s=a?function(t,e){for(var n=-1,o=Array(t);++n<t;)o[n]=e(n);return o}(t.length,String):[],u=s.length;for(var c in t)!e&&!P.call(t,c)||a&&("length"==c||r&&("offset"==c||"parent"==c)||i&&("buffer"==c||"byteLength"==c||"byteOffset"==c)||bt(c,u))||s.push(c);return s}function st(t,e){for(var n=t.length;n--;)if(St(t[n][0],e))return n;return -1}function ut(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":U&&U in Object(t)?function(t){var e=P.call(t,U),n=t[U];try{t[U]=void 0;var o=!0;}catch(t){}var r=O.call(t);o&&(e?t[U]=n:delete t[U]);return r}(t):function(t){return O.call(t)}(t)}function ct(t){return Lt(t)&&ut(t)==n}function lt(t,e,a,s,u){return t===e||(null==t||null==e||!Lt(t)&&!Lt(e)?t!=t&&e!=e:function(t,e,a,s,u,c){var l=Ct(t),d=Ct(e),p=l?"[object Array]":mt(t),f=d?"[object Array]":mt(e),h=(p=p==n?r:p)==r,g=(f=f==n?r:f)==r,y=p==f;if(y&&Et(t)){if(!Et(e))return !1;l=!0,h=!1;}if(y&&!h)return c||(c=new it),l||Pt(t)?ft(t,e,a,s,u,c):function(t,e,n,r,a,s,u){switch(n){case"[object DataView]":if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return !1;t=t.buffer,e=e.buffer;case"[object ArrayBuffer]":return !(t.byteLength!=e.byteLength||!s(new A(t),new A(e)));case"[object Boolean]":case"[object Date]":case"[object Number]":return St(+t,+e);case"[object Error]":return t.name==e.name&&t.message==e.message;case"[object RegExp]":case"[object String]":return t==e+"";case o:var c=b;case i:var l=1&r;if(c||(c=_),t.size!=e.size&&!l)return !1;var d=u.get(t);if(d)return d==e;r|=2,u.set(t,e);var p=ft(c(t),c(e),r,a,s,u);return u.delete(t),p;case"[object Symbol]":if(tt)return tt.call(t)==tt.call(e)}return !1}(t,e,p,a,s,u,c);if(!(1&a)){var v=h&&P.call(t,"__wrapped__"),m=g&&P.call(e,"__wrapped__");if(v||m){var S=v?t.value():t,x=m?e.value():e;return c||(c=new it),u(S,x,a,s,c)}}if(!y)return !1;return c||(c=new it),function(t,e,n,o,r,i){var a=1&n,s=ht(t),u=s.length,c=ht(e).length;if(u!=c&&!a)return !1;var l=u;for(;l--;){var d=s[l];if(!(a?d in e:P.call(e,d)))return !1}var p=i.get(t);if(p&&i.get(e))return p==e;var f=!0;i.set(t,e),i.set(e,t);var h=a;for(;++l<u;){d=s[l];var g=t[d],y=e[d];if(o)var v=a?o(y,g,d,e,t,i):o(g,y,d,t,e,i);if(!(void 0===v?g===y||r(g,y,n,o,i):v)){f=!1;break}h||(h="constructor"==d);}if(f&&!h){var m=t.constructor,b=e.constructor;m==b||!("constructor"in t)||!("constructor"in e)||"function"==typeof m&&m instanceof m&&"function"==typeof b&&b instanceof b||(f=!1);}return i.delete(t),i.delete(e),f}(t,e,a,s,u,c)}(t,e,a,s,lt,u))}function dt(t){return !(!It(t)||function(t){return !!F&&F in t}(t))&&(Mt(t)?k:a).test(_t(t))}function pt(t){if(n=(e=t)&&e.constructor,o="function"==typeof n&&n.prototype||w,e!==o)return V(t);var e,n,o,r=[];for(var i in Object(t))P.call(t,i)&&"constructor"!=i&&r.push(i);return r}function ft(t,e,n,o,r,i){var a=1&n,s=t.length,u=e.length;if(s!=u&&!(a&&u>s))return !1;var c=i.get(t);if(c&&i.get(e))return c==e;var l=-1,d=!0,p=2&n?new rt:void 0;for(i.set(t,e),i.set(e,t);++l<s;){var f=t[l],h=e[l];if(o)var g=a?o(h,f,l,e,t,i):o(f,h,l,t,e,i);if(void 0!==g){if(g)continue;d=!1;break}if(p){if(!m(e,(function(t,e){if(a=e,!p.has(a)&&(f===t||r(f,t,n,o,i)))return p.push(e);var a;}))){d=!1;break}}else if(f!==h&&!r(f,h,n,o,i)){d=!1;break}}return i.delete(t),i.delete(e),d}function ht(t){return function(t,e,n){var o=e(t);return Ct(t)?o:function(t,e){for(var n=-1,o=e.length,r=t.length;++n<o;)t[r+n]=e[n];return t}(o,n(t))}(t,Ft,vt)}function gt(t,e){var n,o,r=t.__data__;return ("string"==(o=typeof(n=e))||"number"==o||"symbol"==o||"boolean"==o?"__proto__"!==n:null===n)?r["string"==typeof e?"string":"hash"]:r.map}function yt(t,e){var n=function(t,e){return null==t?void 0:t[e]}(t,e);return dt(n)?n:void 0}et.prototype.clear=function(){this.__data__=q?q(null):{},this.size=0;},et.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},et.prototype.get=function(t){var e=this.__data__;if(q){var n=e[t];return "__lodash_hash_undefined__"===n?void 0:n}return P.call(e,t)?e[t]:void 0},et.prototype.has=function(t){var e=this.__data__;return q?void 0!==e[t]:P.call(e,t)},et.prototype.set=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=q&&void 0===e?"__lodash_hash_undefined__":e,this},nt.prototype.clear=function(){this.__data__=[],this.size=0;},nt.prototype.delete=function(t){var e=this.__data__,n=st(e,t);return !(n<0)&&(n==e.length-1?e.pop():N.call(e,n,1),--this.size,!0)},nt.prototype.get=function(t){var e=this.__data__,n=st(e,t);return n<0?void 0:e[n][1]},nt.prototype.has=function(t){return st(this.__data__,t)>-1},nt.prototype.set=function(t,e){var n=this.__data__,o=st(n,t);return o<0?(++this.size,n.push([t,e])):n[o][1]=e,this},ot.prototype.clear=function(){this.size=0,this.__data__={hash:new et,map:new(G||nt),string:new et};},ot.prototype.delete=function(t){var e=gt(this,t).delete(t);return this.size-=e?1:0,e},ot.prototype.get=function(t){return gt(this,t).get(t)},ot.prototype.has=function(t){return gt(this,t).has(t)},ot.prototype.set=function(t,e){var n=gt(this,t),o=n.size;return n.set(t,e),this.size+=n.size==o?0:1,this},rt.prototype.add=rt.prototype.push=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},rt.prototype.has=function(t){return this.__data__.has(t)},it.prototype.clear=function(){this.__data__=new nt,this.size=0;},it.prototype.delete=function(t){var e=this.__data__,n=e.delete(t);return this.size=e.size,n},it.prototype.get=function(t){return this.__data__.get(t)},it.prototype.has=function(t){return this.__data__.has(t)},it.prototype.set=function(t,e){var n=this.__data__;if(n instanceof nt){var o=n.__data__;if(!G||o.length<199)return o.push([t,e]),this.size=++n.size,this;n=this.__data__=new ot(o);}return n.set(t,e),this.size=n.size,this};var vt=R?function(t){return null==t?[]:(t=Object(t),function(t,e){for(var n=-1,o=null==t?0:t.length,r=0,i=[];++n<o;){var a=t[n];e(a,n,t)&&(i[r++]=a);}return i}(R(t),(function(e){return D.call(t,e)})))}:function(){return []},mt=ut;function bt(t,e){return !!(e=null==e?9007199254740991:e)&&("number"==typeof t||s.test(t))&&t>-1&&t%1==0&&t<e}function _t(t){if(null!=t){try{return L.call(t)}catch(t){}try{return t+""}catch(t){}}return ""}function St(t,e){return t===e||t!=t&&e!=e}(J&&"[object DataView]"!=mt(new J(new ArrayBuffer(1)))||G&&mt(new G)!=o||z&&"[object Promise]"!=mt(z.resolve())||$&&mt(new $)!=i||W&&"[object WeakMap]"!=mt(new W))&&(mt=function(t){var e=ut(t),n=e==r?t.constructor:void 0,a=n?_t(n):"";if(a)switch(a){case Y:return "[object DataView]";case Z:return o;case K:return "[object Promise]";case X:return i;case H:return "[object WeakMap]"}return e});var xt=ct(function(){return arguments}())?ct:function(t){return Lt(t)&&P.call(t,"callee")&&!D.call(t,"callee")},Ct=Array.isArray;var Et=B||function(){return !1};function Mt(t){if(!It(t))return !1;var e=ut(t);return "[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e}function wt(t){return "number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991}function It(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}function Lt(t){return null!=t&&"object"==typeof t}var Pt=v?function(t){return function(e){return t(e)}}(v):function(t){return Lt(t)&&wt(t.length)&&!!u[ut(t)]};function Ft(t){return null!=(e=t)&&wt(e.length)&&!Mt(e)?at(t):pt(t);var e;}t.exports=function(t,e){return lt(t,e)};}));var ve={Polygon:ft,LineString:pt,Point:dt,MultiPolygon:yt,MultiLineString:yt,MultiPoint:yt};function me(t,e){return e.modes=j,e.getFeatureIdsAt=function(e){return nt.click({point:e},null,t).map((function(t){return t.properties.id}))},e.getSelectedIds=function(){return t.store.getSelectedIds()},e.getSelected=function(){return {type:P,features:t.store.getSelectedIds().map((function(e){return t.store.get(e)})).map((function(t){return t.toGeoJSON()}))}},e.getSelectedPoints=function(){return {type:P,features:t.store.getSelectedCoordinates().map((function(t){return {type:M,properties:{},geometry:{type:L,coordinates:t.coordinates}}}))}},e.set=function(n){if(void 0===n.type||n.type!==P||!Array.isArray(n.features))throw new Error("Invalid FeatureCollection");var o=t.store.createRenderBatch(),r=t.store.getAllIds().slice(),i=e.add(n),a=new tt(i);return (r=r.filter((function(t){return !a.has(t)}))).length&&e.delete(r),o(),i},e.add=function(e){var n=JSON.parse(JSON.stringify(zt(e))).features.map((function(e){if(e.id=e.id||ct(),null===e.geometry)throw new Error("Invalid geometry: null");if(void 0===t.store.get(e.id)||t.store.get(e.id).type!==e.geometry.type){var n=ve[e.geometry.type];if(void 0===n)throw new Error("Invalid geometry type: "+e.geometry.type+".");var o=new n(t,e);t.store.add(o);}else {var r=t.store.get(e.id);r.properties=e.properties,ye(r.getCoordinates(),e.geometry.coordinates)||r.incomingCoords(e.geometry.coordinates);}return e.id}));return t.store.render(),n},e.get=function(e){var n=t.store.get(e);if(n)return n.toGeoJSON()},e.getAll=function(){return {type:P,features:t.store.getAll().map((function(t){return t.toGeoJSON()}))}},e.delete=function(n){return t.store.delete(n,{silent:!0}),e.getMode()!==j.DIRECT_SELECT||t.store.getSelectedIds().length?t.store.render():t.events.changeMode(j.SIMPLE_SELECT,void 0,{silent:!0}),e},e.deleteAll=function(){return t.store.delete(t.store.getAllIds(),{silent:!0}),e.getMode()===j.DIRECT_SELECT?t.events.changeMode(j.SIMPLE_SELECT,void 0,{silent:!0}):t.store.render(),e},e.changeMode=function(n,o){return void 0===o&&(o={}),n===j.SIMPLE_SELECT&&e.getMode()===j.SIMPLE_SELECT?(r=o.featureIds||[],i=t.store.getSelectedIds(),r.length===i.length&&JSON.stringify(r.map((function(t){return t})).sort())===JSON.stringify(i.map((function(t){return t})).sort())||(t.store.setSelected(o.featureIds,{silent:!0}),t.store.render()),e):(n===j.DIRECT_SELECT&&e.getMode()===j.DIRECT_SELECT&&o.featureId===t.store.getSelectedIds()[0]||t.events.changeMode(n,o,{silent:!0}),e);var r,i;},e.getMode=function(){return t.events.getMode()},e.trash=function(){return t.events.trash({silent:!0}),e},e.combineFeatures=function(){return t.events.combineFeatures({silent:!0}),e},e.uncombineFeatures=function(){return t.events.uncombineFeatures({silent:!0}),e},e.setFeatureProperty=function(n,o,r){return t.store.setFeatureProperty(n,o,r),e},e}var be=function(t,e){var n={options:t=function(t){void 0===t&&(t={});var e=Mt(t);return t.controls||(e.controls={}),!1===t.displayControlsDefault?e.controls=Mt(he,t.controls):e.controls=Mt(fe,t.controls),(e=Mt(pe,e)).styles=ge(e.styles,"cold").concat(ge(e.styles,"hot")),e}(t)};e=me(n,e),n.api=e;var o=Lt(n);return e.onAdd=o.onAdd,e.onRemove=o.onRemove,e.types=E,e.options=t,e};function _e(t){be(t,this);}return _e.modes=de,_e}));

    });

    var js$l = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @module helpers
     */
    /**
     * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
     *
     * @memberof helpers
     * @type {number}
     */
    exports.earthRadius = 6371008.8;
    /**
     * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
     *
     * @memberof helpers
     * @type {Object}
     */
    exports.factors = {
        centimeters: exports.earthRadius * 100,
        centimetres: exports.earthRadius * 100,
        degrees: exports.earthRadius / 111325,
        feet: exports.earthRadius * 3.28084,
        inches: exports.earthRadius * 39.37,
        kilometers: exports.earthRadius / 1000,
        kilometres: exports.earthRadius / 1000,
        meters: exports.earthRadius,
        metres: exports.earthRadius,
        miles: exports.earthRadius / 1609.344,
        millimeters: exports.earthRadius * 1000,
        millimetres: exports.earthRadius * 1000,
        nauticalmiles: exports.earthRadius / 1852,
        radians: 1,
        yards: exports.earthRadius * 1.0936,
    };
    /**
     * Units of measurement factors based on 1 meter.
     *
     * @memberof helpers
     * @type {Object}
     */
    exports.unitsFactors = {
        centimeters: 100,
        centimetres: 100,
        degrees: 1 / 111325,
        feet: 3.28084,
        inches: 39.37,
        kilometers: 1 / 1000,
        kilometres: 1 / 1000,
        meters: 1,
        metres: 1,
        miles: 1 / 1609.344,
        millimeters: 1000,
        millimetres: 1000,
        nauticalmiles: 1 / 1852,
        radians: 1 / exports.earthRadius,
        yards: 1.0936133,
    };
    /**
     * Area of measurement factors based on 1 square meter.
     *
     * @memberof helpers
     * @type {Object}
     */
    exports.areaFactors = {
        acres: 0.000247105,
        centimeters: 10000,
        centimetres: 10000,
        feet: 10.763910417,
        hectares: 0.0001,
        inches: 1550.003100006,
        kilometers: 0.000001,
        kilometres: 0.000001,
        meters: 1,
        metres: 1,
        miles: 3.86e-7,
        millimeters: 1000000,
        millimetres: 1000000,
        yards: 1.195990046,
    };
    /**
     * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
     *
     * @name feature
     * @param {Geometry} geometry input geometry
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature} a GeoJSON Feature
     * @example
     * var geometry = {
     *   "type": "Point",
     *   "coordinates": [110, 50]
     * };
     *
     * var feature = turf.feature(geometry);
     *
     * //=feature
     */
    function feature(geom, properties, options) {
        if (options === void 0) { options = {}; }
        var feat = { type: "Feature" };
        if (options.id === 0 || options.id) {
            feat.id = options.id;
        }
        if (options.bbox) {
            feat.bbox = options.bbox;
        }
        feat.properties = properties || {};
        feat.geometry = geom;
        return feat;
    }
    exports.feature = feature;
    /**
     * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
     * For GeometryCollection type use `helpers.geometryCollection`
     *
     * @name geometry
     * @param {string} type Geometry Type
     * @param {Array<any>} coordinates Coordinates
     * @param {Object} [options={}] Optional Parameters
     * @returns {Geometry} a GeoJSON Geometry
     * @example
     * var type = "Point";
     * var coordinates = [110, 50];
     * var geometry = turf.geometry(type, coordinates);
     * // => geometry
     */
    function geometry(type, coordinates, _options) {
        switch (type) {
            case "Point":
                return point(coordinates).geometry;
            case "LineString":
                return lineString(coordinates).geometry;
            case "Polygon":
                return polygon(coordinates).geometry;
            case "MultiPoint":
                return multiPoint(coordinates).geometry;
            case "MultiLineString":
                return multiLineString(coordinates).geometry;
            case "MultiPolygon":
                return multiPolygon(coordinates).geometry;
            default:
                throw new Error(type + " is invalid");
        }
    }
    exports.geometry = geometry;
    /**
     * Creates a {@link Point} {@link Feature} from a Position.
     *
     * @name point
     * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<Point>} a Point feature
     * @example
     * var point = turf.point([-75.343, 39.984]);
     *
     * //=point
     */
    function point(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        if (!coordinates) {
            throw new Error("coordinates is required");
        }
        if (!Array.isArray(coordinates)) {
            throw new Error("coordinates must be an Array");
        }
        if (coordinates.length < 2) {
            throw new Error("coordinates must be at least 2 numbers long");
        }
        if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) {
            throw new Error("coordinates must contain numbers");
        }
        var geom = {
            type: "Point",
            coordinates: coordinates,
        };
        return feature(geom, properties, options);
    }
    exports.point = point;
    /**
     * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
     *
     * @name points
     * @param {Array<Array<number>>} coordinates an array of Points
     * @param {Object} [properties={}] Translate these properties to each Feature
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
     * associated with the FeatureCollection
     * @param {string|number} [options.id] Identifier associated with the FeatureCollection
     * @returns {FeatureCollection<Point>} Point Feature
     * @example
     * var points = turf.points([
     *   [-75, 39],
     *   [-80, 45],
     *   [-78, 50]
     * ]);
     *
     * //=points
     */
    function points(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        return featureCollection(coordinates.map(function (coords) {
            return point(coords, properties);
        }), options);
    }
    exports.points = points;
    /**
     * Creates a {@link Polygon} {@link Feature} from an Array of LinearRings.
     *
     * @name polygon
     * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<Polygon>} Polygon Feature
     * @example
     * var polygon = turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
     *
     * //=polygon
     */
    function polygon(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
            var ring = coordinates_1[_i];
            if (ring.length < 4) {
                throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
            }
            for (var j = 0; j < ring[ring.length - 1].length; j++) {
                // Check if first point of Polygon contains two numbers
                if (ring[ring.length - 1][j] !== ring[0][j]) {
                    throw new Error("First and last Position are not equivalent.");
                }
            }
        }
        var geom = {
            type: "Polygon",
            coordinates: coordinates,
        };
        return feature(geom, properties, options);
    }
    exports.polygon = polygon;
    /**
     * Creates a {@link Polygon} {@link FeatureCollection} from an Array of Polygon coordinates.
     *
     * @name polygons
     * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygon coordinates
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the FeatureCollection
     * @returns {FeatureCollection<Polygon>} Polygon FeatureCollection
     * @example
     * var polygons = turf.polygons([
     *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
     *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
     * ]);
     *
     * //=polygons
     */
    function polygons(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        return featureCollection(coordinates.map(function (coords) {
            return polygon(coords, properties);
        }), options);
    }
    exports.polygons = polygons;
    /**
     * Creates a {@link LineString} {@link Feature} from an Array of Positions.
     *
     * @name lineString
     * @param {Array<Array<number>>} coordinates an array of Positions
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<LineString>} LineString Feature
     * @example
     * var linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
     * var linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
     *
     * //=linestring1
     * //=linestring2
     */
    function lineString(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        if (coordinates.length < 2) {
            throw new Error("coordinates must be an array of two or more positions");
        }
        var geom = {
            type: "LineString",
            coordinates: coordinates,
        };
        return feature(geom, properties, options);
    }
    exports.lineString = lineString;
    /**
     * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
     *
     * @name lineStrings
     * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
     * associated with the FeatureCollection
     * @param {string|number} [options.id] Identifier associated with the FeatureCollection
     * @returns {FeatureCollection<LineString>} LineString FeatureCollection
     * @example
     * var linestrings = turf.lineStrings([
     *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
     *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
     * ]);
     *
     * //=linestrings
     */
    function lineStrings(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        return featureCollection(coordinates.map(function (coords) {
            return lineString(coords, properties);
        }), options);
    }
    exports.lineStrings = lineStrings;
    /**
     * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
     *
     * @name featureCollection
     * @param {Feature[]} features input features
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {FeatureCollection} FeatureCollection of Features
     * @example
     * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
     * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
     * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
     *
     * var collection = turf.featureCollection([
     *   locationA,
     *   locationB,
     *   locationC
     * ]);
     *
     * //=collection
     */
    function featureCollection(features, options) {
        if (options === void 0) { options = {}; }
        var fc = { type: "FeatureCollection" };
        if (options.id) {
            fc.id = options.id;
        }
        if (options.bbox) {
            fc.bbox = options.bbox;
        }
        fc.features = features;
        return fc;
    }
    exports.featureCollection = featureCollection;
    /**
     * Creates a {@link Feature<MultiLineString>} based on a
     * coordinate array. Properties can be added optionally.
     *
     * @name multiLineString
     * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<MultiLineString>} a MultiLineString feature
     * @throws {Error} if no coordinates are passed
     * @example
     * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
     *
     * //=multiLine
     */
    function multiLineString(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        var geom = {
            type: "MultiLineString",
            coordinates: coordinates,
        };
        return feature(geom, properties, options);
    }
    exports.multiLineString = multiLineString;
    /**
     * Creates a {@link Feature<MultiPoint>} based on a
     * coordinate array. Properties can be added optionally.
     *
     * @name multiPoint
     * @param {Array<Array<number>>} coordinates an array of Positions
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<MultiPoint>} a MultiPoint feature
     * @throws {Error} if no coordinates are passed
     * @example
     * var multiPt = turf.multiPoint([[0,0],[10,10]]);
     *
     * //=multiPt
     */
    function multiPoint(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        var geom = {
            type: "MultiPoint",
            coordinates: coordinates,
        };
        return feature(geom, properties, options);
    }
    exports.multiPoint = multiPoint;
    /**
     * Creates a {@link Feature<MultiPolygon>} based on a
     * coordinate array. Properties can be added optionally.
     *
     * @name multiPolygon
     * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<MultiPolygon>} a multipolygon feature
     * @throws {Error} if no coordinates are passed
     * @example
     * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
     *
     * //=multiPoly
     *
     */
    function multiPolygon(coordinates, properties, options) {
        if (options === void 0) { options = {}; }
        var geom = {
            type: "MultiPolygon",
            coordinates: coordinates,
        };
        return feature(geom, properties, options);
    }
    exports.multiPolygon = multiPolygon;
    /**
     * Creates a {@link Feature<GeometryCollection>} based on a
     * coordinate array. Properties can be added optionally.
     *
     * @name geometryCollection
     * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
     * @param {Object} [properties={}] an Object of key-value pairs to add as properties
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
     * @example
     * var pt = turf.geometry("Point", [100, 0]);
     * var line = turf.geometry("LineString", [[101, 0], [102, 1]]);
     * var collection = turf.geometryCollection([pt, line]);
     *
     * // => collection
     */
    function geometryCollection(geometries, properties, options) {
        if (options === void 0) { options = {}; }
        var geom = {
            type: "GeometryCollection",
            geometries: geometries,
        };
        return feature(geom, properties, options);
    }
    exports.geometryCollection = geometryCollection;
    /**
     * Round number to precision
     *
     * @param {number} num Number
     * @param {number} [precision=0] Precision
     * @returns {number} rounded number
     * @example
     * turf.round(120.4321)
     * //=120
     *
     * turf.round(120.4321, 2)
     * //=120.43
     */
    function round(num, precision) {
        if (precision === void 0) { precision = 0; }
        if (precision && !(precision >= 0)) {
            throw new Error("precision must be a positive number");
        }
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(num * multiplier) / multiplier;
    }
    exports.round = round;
    /**
     * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
     * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
     *
     * @name radiansToLength
     * @param {number} radians in radians across the sphere
     * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
     * meters, kilometres, kilometers.
     * @returns {number} distance
     */
    function radiansToLength(radians, units) {
        if (units === void 0) { units = "kilometers"; }
        var factor = exports.factors[units];
        if (!factor) {
            throw new Error(units + " units is invalid");
        }
        return radians * factor;
    }
    exports.radiansToLength = radiansToLength;
    /**
     * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
     * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
     *
     * @name lengthToRadians
     * @param {number} distance in real units
     * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
     * meters, kilometres, kilometers.
     * @returns {number} radians
     */
    function lengthToRadians(distance, units) {
        if (units === void 0) { units = "kilometers"; }
        var factor = exports.factors[units];
        if (!factor) {
            throw new Error(units + " units is invalid");
        }
        return distance / factor;
    }
    exports.lengthToRadians = lengthToRadians;
    /**
     * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
     * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
     *
     * @name lengthToDegrees
     * @param {number} distance in real units
     * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
     * meters, kilometres, kilometers.
     * @returns {number} degrees
     */
    function lengthToDegrees(distance, units) {
        return radiansToDegrees(lengthToRadians(distance, units));
    }
    exports.lengthToDegrees = lengthToDegrees;
    /**
     * Converts any bearing angle from the north line direction (positive clockwise)
     * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
     *
     * @name bearingToAzimuth
     * @param {number} bearing angle, between -180 and +180 degrees
     * @returns {number} angle between 0 and 360 degrees
     */
    function bearingToAzimuth(bearing) {
        var angle = bearing % 360;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }
    exports.bearingToAzimuth = bearingToAzimuth;
    /**
     * Converts an angle in radians to degrees
     *
     * @name radiansToDegrees
     * @param {number} radians angle in radians
     * @returns {number} degrees between 0 and 360 degrees
     */
    function radiansToDegrees(radians) {
        var degrees = radians % (2 * Math.PI);
        return (degrees * 180) / Math.PI;
    }
    exports.radiansToDegrees = radiansToDegrees;
    /**
     * Converts an angle in degrees to radians
     *
     * @name degreesToRadians
     * @param {number} degrees angle between 0 and 360 degrees
     * @returns {number} angle in radians
     */
    function degreesToRadians(degrees) {
        var radians = degrees % 360;
        return (radians * Math.PI) / 180;
    }
    exports.degreesToRadians = degreesToRadians;
    /**
     * Converts a length to the requested unit.
     * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
     *
     * @param {number} length to be converted
     * @param {Units} [originalUnit="kilometers"] of the length
     * @param {Units} [finalUnit="kilometers"] returned unit
     * @returns {number} the converted length
     */
    function convertLength(length, originalUnit, finalUnit) {
        if (originalUnit === void 0) { originalUnit = "kilometers"; }
        if (finalUnit === void 0) { finalUnit = "kilometers"; }
        if (!(length >= 0)) {
            throw new Error("length must be a positive number");
        }
        return radiansToLength(lengthToRadians(length, originalUnit), finalUnit);
    }
    exports.convertLength = convertLength;
    /**
     * Converts a area to the requested unit.
     * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeters, acres, miles, yards, feet, inches, hectares
     * @param {number} area to be converted
     * @param {Units} [originalUnit="meters"] of the distance
     * @param {Units} [finalUnit="kilometers"] returned unit
     * @returns {number} the converted area
     */
    function convertArea(area, originalUnit, finalUnit) {
        if (originalUnit === void 0) { originalUnit = "meters"; }
        if (finalUnit === void 0) { finalUnit = "kilometers"; }
        if (!(area >= 0)) {
            throw new Error("area must be a positive number");
        }
        var startFactor = exports.areaFactors[originalUnit];
        if (!startFactor) {
            throw new Error("invalid original units");
        }
        var finalFactor = exports.areaFactors[finalUnit];
        if (!finalFactor) {
            throw new Error("invalid final units");
        }
        return (area / startFactor) * finalFactor;
    }
    exports.convertArea = convertArea;
    /**
     * isNumber
     *
     * @param {*} num Number to validate
     * @returns {boolean} true/false
     * @example
     * turf.isNumber(123)
     * //=true
     * turf.isNumber('foo')
     * //=false
     */
    function isNumber(num) {
        return !isNaN(num) && num !== null && !Array.isArray(num);
    }
    exports.isNumber = isNumber;
    /**
     * isObject
     *
     * @param {*} input variable to validate
     * @returns {boolean} true/false
     * @example
     * turf.isObject({elevation: 10})
     * //=true
     * turf.isObject('foo')
     * //=false
     */
    function isObject(input) {
        return !!input && input.constructor === Object;
    }
    exports.isObject = isObject;
    /**
     * Validate BBox
     *
     * @private
     * @param {Array<number>} bbox BBox to validate
     * @returns {void}
     * @throws Error if BBox is not valid
     * @example
     * validateBBox([-180, -40, 110, 50])
     * //=OK
     * validateBBox([-180, -40])
     * //=Error
     * validateBBox('Foo')
     * //=Error
     * validateBBox(5)
     * //=Error
     * validateBBox(null)
     * //=Error
     * validateBBox(undefined)
     * //=Error
     */
    function validateBBox(bbox) {
        if (!bbox) {
            throw new Error("bbox is required");
        }
        if (!Array.isArray(bbox)) {
            throw new Error("bbox must be an Array");
        }
        if (bbox.length !== 4 && bbox.length !== 6) {
            throw new Error("bbox must be an Array of 4 or 6 numbers");
        }
        bbox.forEach(function (num) {
            if (!isNumber(num)) {
                throw new Error("bbox must only contain numbers");
            }
        });
    }
    exports.validateBBox = validateBBox;
    /**
     * Validate Id
     *
     * @private
     * @param {string|number} id Id to validate
     * @returns {void}
     * @throws Error if Id is not valid
     * @example
     * validateId([-180, -40, 110, 50])
     * //=Error
     * validateId([-180, -40])
     * //=Error
     * validateId('Foo')
     * //=OK
     * validateId(5)
     * //=OK
     * validateId(null)
     * //=Error
     * validateId(undefined)
     * //=Error
     */
    function validateId(id) {
        if (!id) {
            throw new Error("id is required");
        }
        if (["string", "number"].indexOf(typeof id) === -1) {
            throw new Error("id must be a number or a string");
        }
    }
    exports.validateId = validateId;
    });

    var require$$0$3 = js$l;

    /**
     * Takes a bbox and returns an equivalent {@link Polygon|polygon}.
     *
     * @name bboxPolygon
     * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
     * @param {Object} [options={}] Optional parameters
     * @param {Properties} [options.properties={}] Translate properties to Polygon
     * @param {string|number} [options.id={}] Translate Id to Polygon
     * @returns {Feature<Polygon>} a Polygon representation of the bounding box
     * @example
     * var bbox = [0, 0, 10, 10];
     *
     * var poly = turf.bboxPolygon(bbox);
     *
     * //addToMap
     * var addToMap = [poly]
     */
    function bboxPolygon(bbox, options) {
        if (options === void 0) { options = {}; }
        // Convert BBox positions to Numbers
        // No performance loss for including Number()
        // https://github.com/Turfjs/turf/issues/1119
        var west = Number(bbox[0]);
        var south = Number(bbox[1]);
        var east = Number(bbox[2]);
        var north = Number(bbox[3]);
        if (bbox.length === 6) {
            throw new Error("@turf/bbox-polygon does not support BBox with 6 positions");
        }
        var lowLeft = [west, south];
        var topLeft = [west, north];
        var topRight = [east, north];
        var lowRight = [east, south];
        return require$$0$3.polygon([[lowLeft, lowRight, topRight, topLeft, lowLeft]], options.properties, { bbox: bbox, id: options.id });
    }
    var _default$j = bboxPolygon;

    var js$k = /*#__PURE__*/Object.defineProperty({
    	default: _default$j
    }, '__esModule', {value: true});

    /**
     * Callback for coordEach
     *
     * @callback coordEachCallback
     * @param {Array<number>} currentCoord The current coordinate being processed.
     * @param {number} coordIndex The current index of the coordinate being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     * @param {number} geometryIndex The current index of the Geometry being processed.
     */

    /**
     * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
     *
     * @name coordEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, multiFeatureIndex)
     * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {"foo": "bar"}),
     *   turf.point([36, 53], {"hello": "world"})
     * ]);
     *
     * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
     *   //=currentCoord
     *   //=coordIndex
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     * });
     */
    function coordEach(geojson, callback, excludeWrapCoord) {
      // Handles null Geometry -- Skips this GeoJSON
      if (geojson === null) return;
      var j,
        k,
        l,
        geometry,
        stopG,
        coords,
        geometryMaybeCollection,
        wrapShrink = 0,
        coordIndex = 0,
        isGeometryCollection,
        type = geojson.type,
        isFeatureCollection = type === "FeatureCollection",
        isFeature = type === "Feature",
        stop = isFeatureCollection ? geojson.features.length : 1;

      // This logic may look a little weird. The reason why it is that way
      // is because it's trying to be fast. GeoJSON supports multiple kinds
      // of objects at its root: FeatureCollection, Features, Geometries.
      // This function has the responsibility of handling all of them, and that
      // means that some of the `for` loops you see below actually just don't apply
      // to certain inputs. For instance, if you give this just a
      // Point geometry, then both loops are short-circuited and all we do
      // is gradually rename the input until it's called 'geometry'.
      //
      // This also aims to allocate as few resources as possible: just a
      // few numbers and booleans, rather than any temporary arrays as would
      // be required with the normalization approach.
      for (var featureIndex = 0; featureIndex < stop; featureIndex++) {
        geometryMaybeCollection = isFeatureCollection
          ? geojson.features[featureIndex].geometry
          : isFeature
          ? geojson.geometry
          : geojson;
        isGeometryCollection = geometryMaybeCollection
          ? geometryMaybeCollection.type === "GeometryCollection"
          : false;
        stopG = isGeometryCollection
          ? geometryMaybeCollection.geometries.length
          : 1;

        for (var geomIndex = 0; geomIndex < stopG; geomIndex++) {
          var multiFeatureIndex = 0;
          var geometryIndex = 0;
          geometry = isGeometryCollection
            ? geometryMaybeCollection.geometries[geomIndex]
            : geometryMaybeCollection;

          // Handles null Geometry -- Skips this geometry
          if (geometry === null) continue;
          coords = geometry.coordinates;
          var geomType = geometry.type;

          wrapShrink =
            excludeWrapCoord &&
            (geomType === "Polygon" || geomType === "MultiPolygon")
              ? 1
              : 0;

          switch (geomType) {
            case null:
              break;
            case "Point":
              if (
                callback(
                  coords,
                  coordIndex,
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex
                ) === false
              )
                return false;
              coordIndex++;
              multiFeatureIndex++;
              break;
            case "LineString":
            case "MultiPoint":
              for (j = 0; j < coords.length; j++) {
                if (
                  callback(
                    coords[j],
                    coordIndex,
                    featureIndex,
                    multiFeatureIndex,
                    geometryIndex
                  ) === false
                )
                  return false;
                coordIndex++;
                if (geomType === "MultiPoint") multiFeatureIndex++;
              }
              if (geomType === "LineString") multiFeatureIndex++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (j = 0; j < coords.length; j++) {
                for (k = 0; k < coords[j].length - wrapShrink; k++) {
                  if (
                    callback(
                      coords[j][k],
                      coordIndex,
                      featureIndex,
                      multiFeatureIndex,
                      geometryIndex
                    ) === false
                  )
                    return false;
                  coordIndex++;
                }
                if (geomType === "MultiLineString") multiFeatureIndex++;
                if (geomType === "Polygon") geometryIndex++;
              }
              if (geomType === "Polygon") multiFeatureIndex++;
              break;
            case "MultiPolygon":
              for (j = 0; j < coords.length; j++) {
                geometryIndex = 0;
                for (k = 0; k < coords[j].length; k++) {
                  for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                    if (
                      callback(
                        coords[j][k][l],
                        coordIndex,
                        featureIndex,
                        multiFeatureIndex,
                        geometryIndex
                      ) === false
                    )
                      return false;
                    coordIndex++;
                  }
                  geometryIndex++;
                }
                multiFeatureIndex++;
              }
              break;
            case "GeometryCollection":
              for (j = 0; j < geometry.geometries.length; j++)
                if (
                  coordEach(geometry.geometries[j], callback, excludeWrapCoord) ===
                  false
                )
                  return false;
              break;
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
      }
    }

    /**
     * Callback for coordReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback coordReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Array<number>} currentCoord The current coordinate being processed.
     * @param {number} coordIndex The current index of the coordinate being processed.
     * Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     * @param {number} geometryIndex The current index of the Geometry being processed.
     */

    /**
     * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
     *
     * @name coordReduce
     * @param {FeatureCollection|Geometry|Feature} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentCoord, coordIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {"foo": "bar"}),
     *   turf.point([36, 53], {"hello": "world"})
     * ]);
     *
     * turf.coordReduce(features, function (previousValue, currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
     *   //=previousValue
     *   //=currentCoord
     *   //=coordIndex
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     *   return currentCoord;
     * });
     */
    function coordReduce(geojson, callback, initialValue, excludeWrapCoord) {
      var previousValue = initialValue;
      coordEach(
        geojson,
        function (
          currentCoord,
          coordIndex,
          featureIndex,
          multiFeatureIndex,
          geometryIndex
        ) {
          if (coordIndex === 0 && initialValue === undefined)
            previousValue = currentCoord;
          else
            previousValue = callback(
              previousValue,
              currentCoord,
              coordIndex,
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            );
        },
        excludeWrapCoord
      );
      return previousValue;
    }

    /**
     * Callback for propEach
     *
     * @callback propEachCallback
     * @param {Object} currentProperties The current Properties being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Iterate over properties in any GeoJSON object, similar to Array.forEach()
     *
     * @name propEach
     * @param {FeatureCollection|Feature} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentProperties, featureIndex)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.propEach(features, function (currentProperties, featureIndex) {
     *   //=currentProperties
     *   //=featureIndex
     * });
     */
    function propEach(geojson, callback) {
      var i;
      switch (geojson.type) {
        case "FeatureCollection":
          for (i = 0; i < geojson.features.length; i++) {
            if (callback(geojson.features[i].properties, i) === false) break;
          }
          break;
        case "Feature":
          callback(geojson.properties, 0);
          break;
      }
    }

    /**
     * Callback for propReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback propReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {*} currentProperties The current Properties being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Reduce properties in any GeoJSON object into a single value,
     * similar to how Array.reduce works. However, in this case we lazily run
     * the reduction, so an array of all properties is unnecessary.
     *
     * @name propReduce
     * @param {FeatureCollection|Feature} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentProperties, featureIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.propReduce(features, function (previousValue, currentProperties, featureIndex) {
     *   //=previousValue
     *   //=currentProperties
     *   //=featureIndex
     *   return currentProperties
     * });
     */
    function propReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      propEach(geojson, function (currentProperties, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined)
          previousValue = currentProperties;
        else
          previousValue = callback(previousValue, currentProperties, featureIndex);
      });
      return previousValue;
    }

    /**
     * Callback for featureEach
     *
     * @callback featureEachCallback
     * @param {Feature<any>} currentFeature The current Feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Iterate over features in any GeoJSON object, similar to
     * Array.forEach.
     *
     * @name featureEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentFeature, featureIndex)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {foo: 'bar'}),
     *   turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.featureEach(features, function (currentFeature, featureIndex) {
     *   //=currentFeature
     *   //=featureIndex
     * });
     */
    function featureEach$1(geojson, callback) {
      if (geojson.type === "Feature") {
        callback(geojson, 0);
      } else if (geojson.type === "FeatureCollection") {
        for (var i = 0; i < geojson.features.length; i++) {
          if (callback(geojson.features[i], i) === false) break;
        }
      }
    }

    /**
     * Callback for featureReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback featureReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Feature} currentFeature The current Feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Reduce features in any GeoJSON object, similar to Array.reduce().
     *
     * @name featureReduce
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {"foo": "bar"}),
     *   turf.point([36, 53], {"hello": "world"})
     * ]);
     *
     * turf.featureReduce(features, function (previousValue, currentFeature, featureIndex) {
     *   //=previousValue
     *   //=currentFeature
     *   //=featureIndex
     *   return currentFeature
     * });
     */
    function featureReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      featureEach$1(geojson, function (currentFeature, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined)
          previousValue = currentFeature;
        else previousValue = callback(previousValue, currentFeature, featureIndex);
      });
      return previousValue;
    }

    /**
     * Get all coordinates from any GeoJSON object.
     *
     * @name coordAll
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @returns {Array<Array<number>>} coordinate position array
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {foo: 'bar'}),
     *   turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * var coords = turf.coordAll(features);
     * //= [[26, 37], [36, 53]]
     */
    function coordAll(geojson) {
      var coords = [];
      coordEach(geojson, function (coord) {
        coords.push(coord);
      });
      return coords;
    }

    /**
     * Callback for geomEach
     *
     * @callback geomEachCallback
     * @param {Geometry} currentGeometry The current Geometry being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {Object} featureProperties The current Feature Properties being processed.
     * @param {Array<number>} featureBBox The current Feature BBox being processed.
     * @param {number|string} featureId The current Feature Id being processed.
     */

    /**
     * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
     *
     * @name geomEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.geomEach(features, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
     *   //=currentGeometry
     *   //=featureIndex
     *   //=featureProperties
     *   //=featureBBox
     *   //=featureId
     * });
     */
    function geomEach(geojson, callback) {
      var i,
        j,
        g,
        geometry,
        stopG,
        geometryMaybeCollection,
        isGeometryCollection,
        featureProperties,
        featureBBox,
        featureId,
        featureIndex = 0,
        isFeatureCollection = geojson.type === "FeatureCollection",
        isFeature = geojson.type === "Feature",
        stop = isFeatureCollection ? geojson.features.length : 1;

      // This logic may look a little weird. The reason why it is that way
      // is because it's trying to be fast. GeoJSON supports multiple kinds
      // of objects at its root: FeatureCollection, Features, Geometries.
      // This function has the responsibility of handling all of them, and that
      // means that some of the `for` loops you see below actually just don't apply
      // to certain inputs. For instance, if you give this just a
      // Point geometry, then both loops are short-circuited and all we do
      // is gradually rename the input until it's called 'geometry'.
      //
      // This also aims to allocate as few resources as possible: just a
      // few numbers and booleans, rather than any temporary arrays as would
      // be required with the normalization approach.
      for (i = 0; i < stop; i++) {
        geometryMaybeCollection = isFeatureCollection
          ? geojson.features[i].geometry
          : isFeature
          ? geojson.geometry
          : geojson;
        featureProperties = isFeatureCollection
          ? geojson.features[i].properties
          : isFeature
          ? geojson.properties
          : {};
        featureBBox = isFeatureCollection
          ? geojson.features[i].bbox
          : isFeature
          ? geojson.bbox
          : undefined;
        featureId = isFeatureCollection
          ? geojson.features[i].id
          : isFeature
          ? geojson.id
          : undefined;
        isGeometryCollection = geometryMaybeCollection
          ? geometryMaybeCollection.type === "GeometryCollection"
          : false;
        stopG = isGeometryCollection
          ? geometryMaybeCollection.geometries.length
          : 1;

        for (g = 0; g < stopG; g++) {
          geometry = isGeometryCollection
            ? geometryMaybeCollection.geometries[g]
            : geometryMaybeCollection;

          // Handle null Geometry
          if (geometry === null) {
            if (
              callback(
                null,
                featureIndex,
                featureProperties,
                featureBBox,
                featureId
              ) === false
            )
              return false;
            continue;
          }
          switch (geometry.type) {
            case "Point":
            case "LineString":
            case "MultiPoint":
            case "Polygon":
            case "MultiLineString":
            case "MultiPolygon": {
              if (
                callback(
                  geometry,
                  featureIndex,
                  featureProperties,
                  featureBBox,
                  featureId
                ) === false
              )
                return false;
              break;
            }
            case "GeometryCollection": {
              for (j = 0; j < geometry.geometries.length; j++) {
                if (
                  callback(
                    geometry.geometries[j],
                    featureIndex,
                    featureProperties,
                    featureBBox,
                    featureId
                  ) === false
                )
                  return false;
              }
              break;
            }
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
        // Only increase `featureIndex` per each feature
        featureIndex++;
      }
    }

    /**
     * Callback for geomReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback geomReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Geometry} currentGeometry The current Geometry being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {Object} featureProperties The current Feature Properties being processed.
     * @param {Array<number>} featureBBox The current Feature BBox being processed.
     * @param {number|string} featureId The current Feature Id being processed.
     */

    /**
     * Reduce geometry in any GeoJSON object, similar to Array.reduce().
     *
     * @name geomReduce
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.geomReduce(features, function (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
     *   //=previousValue
     *   //=currentGeometry
     *   //=featureIndex
     *   //=featureProperties
     *   //=featureBBox
     *   //=featureId
     *   return currentGeometry
     * });
     */
    function geomReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      geomEach(
        geojson,
        function (
          currentGeometry,
          featureIndex,
          featureProperties,
          featureBBox,
          featureId
        ) {
          if (featureIndex === 0 && initialValue === undefined)
            previousValue = currentGeometry;
          else
            previousValue = callback(
              previousValue,
              currentGeometry,
              featureIndex,
              featureProperties,
              featureBBox,
              featureId
            );
        }
      );
      return previousValue;
    }

    /**
     * Callback for flattenEach
     *
     * @callback flattenEachCallback
     * @param {Feature} currentFeature The current flattened feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     */

    /**
     * Iterate over flattened features in any GeoJSON object, similar to
     * Array.forEach.
     *
     * @name flattenEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentFeature, featureIndex, multiFeatureIndex)
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
     * ]);
     *
     * turf.flattenEach(features, function (currentFeature, featureIndex, multiFeatureIndex) {
     *   //=currentFeature
     *   //=featureIndex
     *   //=multiFeatureIndex
     * });
     */
    function flattenEach(geojson, callback) {
      geomEach(geojson, function (geometry, featureIndex, properties, bbox, id) {
        // Callback for single geometry
        var type = geometry === null ? null : geometry.type;
        switch (type) {
          case null:
          case "Point":
          case "LineString":
          case "Polygon":
            if (
              callback(
                require$$0$3.feature(geometry, properties, { bbox: bbox, id: id }),
                featureIndex,
                0
              ) === false
            )
              return false;
            return;
        }

        var geomType;

        // Callback for multi-geometry
        switch (type) {
          case "MultiPoint":
            geomType = "Point";
            break;
          case "MultiLineString":
            geomType = "LineString";
            break;
          case "MultiPolygon":
            geomType = "Polygon";
            break;
        }

        for (
          var multiFeatureIndex = 0;
          multiFeatureIndex < geometry.coordinates.length;
          multiFeatureIndex++
        ) {
          var coordinate = geometry.coordinates[multiFeatureIndex];
          var geom = {
            type: geomType,
            coordinates: coordinate,
          };
          if (
            callback(require$$0$3.feature(geom, properties), featureIndex, multiFeatureIndex) ===
            false
          )
            return false;
        }
      });
    }

    /**
     * Callback for flattenReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback flattenReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Feature} currentFeature The current Feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     */

    /**
     * Reduce flattened features in any GeoJSON object, similar to Array.reduce().
     *
     * @name flattenReduce
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex, multiFeatureIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
     * ]);
     *
     * turf.flattenReduce(features, function (previousValue, currentFeature, featureIndex, multiFeatureIndex) {
     *   //=previousValue
     *   //=currentFeature
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   return currentFeature
     * });
     */
    function flattenReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      flattenEach(
        geojson,
        function (currentFeature, featureIndex, multiFeatureIndex) {
          if (
            featureIndex === 0 &&
            multiFeatureIndex === 0 &&
            initialValue === undefined
          )
            previousValue = currentFeature;
          else
            previousValue = callback(
              previousValue,
              currentFeature,
              featureIndex,
              multiFeatureIndex
            );
        }
      );
      return previousValue;
    }

    /**
     * Callback for segmentEach
     *
     * @callback segmentEachCallback
     * @param {Feature<LineString>} currentSegment The current Segment being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     * @param {number} geometryIndex The current index of the Geometry being processed.
     * @param {number} segmentIndex The current index of the Segment being processed.
     * @returns {void}
     */

    /**
     * Iterate over 2-vertex line segment in any GeoJSON object, similar to Array.forEach()
     * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
     *
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
     * @param {Function} callback a method that takes (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex)
     * @returns {void}
     * @example
     * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
     *
     * // Iterate over GeoJSON by 2-vertex segments
     * turf.segmentEach(polygon, function (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
     *   //=currentSegment
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     *   //=segmentIndex
     * });
     *
     * // Calculate the total number of segments
     * var total = 0;
     * turf.segmentEach(polygon, function () {
     *     total++;
     * });
     */
    function segmentEach(geojson, callback) {
      flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
        var segmentIndex = 0;

        // Exclude null Geometries
        if (!feature.geometry) return;
        // (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
        var type = feature.geometry.type;
        if (type === "Point" || type === "MultiPoint") return;

        // Generate 2-vertex line segments
        var previousCoords;
        var previousFeatureIndex = 0;
        var previousMultiIndex = 0;
        var prevGeomIndex = 0;
        if (
          coordEach(
            feature,
            function (
              currentCoord,
              coordIndex,
              featureIndexCoord,
              multiPartIndexCoord,
              geometryIndex
            ) {
              // Simulating a meta.coordReduce() since `reduce` operations cannot be stopped by returning `false`
              if (
                previousCoords === undefined ||
                featureIndex > previousFeatureIndex ||
                multiPartIndexCoord > previousMultiIndex ||
                geometryIndex > prevGeomIndex
              ) {
                previousCoords = currentCoord;
                previousFeatureIndex = featureIndex;
                previousMultiIndex = multiPartIndexCoord;
                prevGeomIndex = geometryIndex;
                segmentIndex = 0;
                return;
              }
              var currentSegment = require$$0$3.lineString(
                [previousCoords, currentCoord],
                feature.properties
              );
              if (
                callback(
                  currentSegment,
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex,
                  segmentIndex
                ) === false
              )
                return false;
              segmentIndex++;
              previousCoords = currentCoord;
            }
          ) === false
        )
          return false;
      });
    }

    /**
     * Callback for segmentReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback segmentReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Feature<LineString>} currentSegment The current Segment being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
     * @param {number} geometryIndex The current index of the Geometry being processed.
     * @param {number} segmentIndex The current index of the Segment being processed.
     */

    /**
     * Reduce 2-vertex line segment in any GeoJSON object, similar to Array.reduce()
     * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
     *
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
     * @param {Function} callback a method that takes (previousValue, currentSegment, currentIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {void}
     * @example
     * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
     *
     * // Iterate over GeoJSON by 2-vertex segments
     * turf.segmentReduce(polygon, function (previousSegment, currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
     *   //= previousSegment
     *   //= currentSegment
     *   //= featureIndex
     *   //= multiFeatureIndex
     *   //= geometryIndex
     *   //= segmentIndex
     *   return currentSegment
     * });
     *
     * // Calculate the total number of segments
     * var initialValue = 0
     * var total = turf.segmentReduce(polygon, function (previousValue) {
     *     previousValue++;
     *     return previousValue;
     * }, initialValue);
     */
    function segmentReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      var started = false;
      segmentEach(
        geojson,
        function (
          currentSegment,
          featureIndex,
          multiFeatureIndex,
          geometryIndex,
          segmentIndex
        ) {
          if (started === false && initialValue === undefined)
            previousValue = currentSegment;
          else
            previousValue = callback(
              previousValue,
              currentSegment,
              featureIndex,
              multiFeatureIndex,
              geometryIndex,
              segmentIndex
            );
          started = true;
        }
      );
      return previousValue;
    }

    /**
     * Callback for lineEach
     *
     * @callback lineEachCallback
     * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed
     * @param {number} featureIndex The current index of the Feature being processed
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
     * @param {number} geometryIndex The current index of the Geometry being processed
     */

    /**
     * Iterate over line or ring coordinates in LineString, Polygon, MultiLineString, MultiPolygon Features or Geometries,
     * similar to Array.forEach.
     *
     * @name lineEach
     * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
     * @param {Function} callback a method that takes (currentLine, featureIndex, multiFeatureIndex, geometryIndex)
     * @example
     * var multiLine = turf.multiLineString([
     *   [[26, 37], [35, 45]],
     *   [[36, 53], [38, 50], [41, 55]]
     * ]);
     *
     * turf.lineEach(multiLine, function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
     *   //=currentLine
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     * });
     */
    function lineEach(geojson, callback) {
      // validation
      if (!geojson) throw new Error("geojson is required");

      flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
        if (feature.geometry === null) return;
        var type = feature.geometry.type;
        var coords = feature.geometry.coordinates;
        switch (type) {
          case "LineString":
            if (callback(feature, featureIndex, multiFeatureIndex, 0, 0) === false)
              return false;
            break;
          case "Polygon":
            for (
              var geometryIndex = 0;
              geometryIndex < coords.length;
              geometryIndex++
            ) {
              if (
                callback(
                  require$$0$3.lineString(coords[geometryIndex], feature.properties),
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex
                ) === false
              )
                return false;
            }
            break;
        }
      });
    }

    /**
     * Callback for lineReduce
     *
     * The first time the callback function is called, the values provided as arguments depend
     * on whether the reduce method has an initialValue argument.
     *
     * If an initialValue is provided to the reduce method:
     *  - The previousValue argument is initialValue.
     *  - The currentValue argument is the value of the first element present in the array.
     *
     * If an initialValue is not provided:
     *  - The previousValue argument is the value of the first element present in the array.
     *  - The currentValue argument is the value of the second element present in the array.
     *
     * @callback lineReduceCallback
     * @param {*} previousValue The accumulated value previously returned in the last invocation
     * of the callback, or initialValue, if supplied.
     * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
     * @param {number} featureIndex The current index of the Feature being processed
     * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
     * @param {number} geometryIndex The current index of the Geometry being processed
     */

    /**
     * Reduce features in any GeoJSON object, similar to Array.reduce().
     *
     * @name lineReduce
     * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
     * @param {Function} callback a method that takes (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex)
     * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
     * @returns {*} The value that results from the reduction.
     * @example
     * var multiPoly = turf.multiPolygon([
     *   turf.polygon([[[12,48],[2,41],[24,38],[12,48]], [[9,44],[13,41],[13,45],[9,44]]]),
     *   turf.polygon([[[5, 5], [0, 0], [2, 2], [4, 4], [5, 5]]])
     * ]);
     *
     * turf.lineReduce(multiPoly, function (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
     *   //=previousValue
     *   //=currentLine
     *   //=featureIndex
     *   //=multiFeatureIndex
     *   //=geometryIndex
     *   return currentLine
     * });
     */
    function lineReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      lineEach(
        geojson,
        function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
          if (featureIndex === 0 && initialValue === undefined)
            previousValue = currentLine;
          else
            previousValue = callback(
              previousValue,
              currentLine,
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            );
        }
      );
      return previousValue;
    }

    /**
     * Finds a particular 2-vertex LineString Segment from a GeoJSON using `@turf/meta` indexes.
     *
     * Negative indexes are permitted.
     * Point & MultiPoint will always return null.
     *
     * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
     * @param {Object} [options={}] Optional parameters
     * @param {number} [options.featureIndex=0] Feature Index
     * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
     * @param {number} [options.geometryIndex=0] Geometry Index
     * @param {number} [options.segmentIndex=0] Segment Index
     * @param {Object} [options.properties={}] Translate Properties to output LineString
     * @param {BBox} [options.bbox={}] Translate BBox to output LineString
     * @param {number|string} [options.id={}] Translate Id to output LineString
     * @returns {Feature<LineString>} 2-vertex GeoJSON Feature LineString
     * @example
     * var multiLine = turf.multiLineString([
     *     [[10, 10], [50, 30], [30, 40]],
     *     [[-10, -10], [-50, -30], [-30, -40]]
     * ]);
     *
     * // First Segment (defaults are 0)
     * turf.findSegment(multiLine);
     * // => Feature<LineString<[[10, 10], [50, 30]]>>
     *
     * // First Segment of 2nd Multi Feature
     * turf.findSegment(multiLine, {multiFeatureIndex: 1});
     * // => Feature<LineString<[[-10, -10], [-50, -30]]>>
     *
     * // Last Segment of Last Multi Feature
     * turf.findSegment(multiLine, {multiFeatureIndex: -1, segmentIndex: -1});
     * // => Feature<LineString<[[-50, -30], [-30, -40]]>>
     */
    function findSegment(geojson, options) {
      // Optional Parameters
      options = options || {};
      if (!require$$0$3.isObject(options)) throw new Error("options is invalid");
      var featureIndex = options.featureIndex || 0;
      var multiFeatureIndex = options.multiFeatureIndex || 0;
      var geometryIndex = options.geometryIndex || 0;
      var segmentIndex = options.segmentIndex || 0;

      // Find FeatureIndex
      var properties = options.properties;
      var geometry;

      switch (geojson.type) {
        case "FeatureCollection":
          if (featureIndex < 0)
            featureIndex = geojson.features.length + featureIndex;
          properties = properties || geojson.features[featureIndex].properties;
          geometry = geojson.features[featureIndex].geometry;
          break;
        case "Feature":
          properties = properties || geojson.properties;
          geometry = geojson.geometry;
          break;
        case "Point":
        case "MultiPoint":
          return null;
        case "LineString":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon":
          geometry = geojson;
          break;
        default:
          throw new Error("geojson is invalid");
      }

      // Find SegmentIndex
      if (geometry === null) return null;
      var coords = geometry.coordinates;
      switch (geometry.type) {
        case "Point":
        case "MultiPoint":
          return null;
        case "LineString":
          if (segmentIndex < 0) segmentIndex = coords.length + segmentIndex - 1;
          return require$$0$3.lineString(
            [coords[segmentIndex], coords[segmentIndex + 1]],
            properties,
            options
          );
        case "Polygon":
          if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
          if (segmentIndex < 0)
            segmentIndex = coords[geometryIndex].length + segmentIndex - 1;
          return require$$0$3.lineString(
            [
              coords[geometryIndex][segmentIndex],
              coords[geometryIndex][segmentIndex + 1],
            ],
            properties,
            options
          );
        case "MultiLineString":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          if (segmentIndex < 0)
            segmentIndex = coords[multiFeatureIndex].length + segmentIndex - 1;
          return require$$0$3.lineString(
            [
              coords[multiFeatureIndex][segmentIndex],
              coords[multiFeatureIndex][segmentIndex + 1],
            ],
            properties,
            options
          );
        case "MultiPolygon":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          if (geometryIndex < 0)
            geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
          if (segmentIndex < 0)
            segmentIndex =
              coords[multiFeatureIndex][geometryIndex].length - segmentIndex - 1;
          return require$$0$3.lineString(
            [
              coords[multiFeatureIndex][geometryIndex][segmentIndex],
              coords[multiFeatureIndex][geometryIndex][segmentIndex + 1],
            ],
            properties,
            options
          );
      }
      throw new Error("geojson is invalid");
    }

    /**
     * Finds a particular Point from a GeoJSON using `@turf/meta` indexes.
     *
     * Negative indexes are permitted.
     *
     * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
     * @param {Object} [options={}] Optional parameters
     * @param {number} [options.featureIndex=0] Feature Index
     * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
     * @param {number} [options.geometryIndex=0] Geometry Index
     * @param {number} [options.coordIndex=0] Coord Index
     * @param {Object} [options.properties={}] Translate Properties to output Point
     * @param {BBox} [options.bbox={}] Translate BBox to output Point
     * @param {number|string} [options.id={}] Translate Id to output Point
     * @returns {Feature<Point>} 2-vertex GeoJSON Feature Point
     * @example
     * var multiLine = turf.multiLineString([
     *     [[10, 10], [50, 30], [30, 40]],
     *     [[-10, -10], [-50, -30], [-30, -40]]
     * ]);
     *
     * // First Segment (defaults are 0)
     * turf.findPoint(multiLine);
     * // => Feature<Point<[10, 10]>>
     *
     * // First Segment of the 2nd Multi-Feature
     * turf.findPoint(multiLine, {multiFeatureIndex: 1});
     * // => Feature<Point<[-10, -10]>>
     *
     * // Last Segment of last Multi-Feature
     * turf.findPoint(multiLine, {multiFeatureIndex: -1, coordIndex: -1});
     * // => Feature<Point<[-30, -40]>>
     */
    function findPoint(geojson, options) {
      // Optional Parameters
      options = options || {};
      if (!require$$0$3.isObject(options)) throw new Error("options is invalid");
      var featureIndex = options.featureIndex || 0;
      var multiFeatureIndex = options.multiFeatureIndex || 0;
      var geometryIndex = options.geometryIndex || 0;
      var coordIndex = options.coordIndex || 0;

      // Find FeatureIndex
      var properties = options.properties;
      var geometry;

      switch (geojson.type) {
        case "FeatureCollection":
          if (featureIndex < 0)
            featureIndex = geojson.features.length + featureIndex;
          properties = properties || geojson.features[featureIndex].properties;
          geometry = geojson.features[featureIndex].geometry;
          break;
        case "Feature":
          properties = properties || geojson.properties;
          geometry = geojson.geometry;
          break;
        case "Point":
        case "MultiPoint":
          return null;
        case "LineString":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon":
          geometry = geojson;
          break;
        default:
          throw new Error("geojson is invalid");
      }

      // Find Coord Index
      if (geometry === null) return null;
      var coords = geometry.coordinates;
      switch (geometry.type) {
        case "Point":
          return require$$0$3.point(coords, properties, options);
        case "MultiPoint":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          return require$$0$3.point(coords[multiFeatureIndex], properties, options);
        case "LineString":
          if (coordIndex < 0) coordIndex = coords.length + coordIndex;
          return require$$0$3.point(coords[coordIndex], properties, options);
        case "Polygon":
          if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
          if (coordIndex < 0)
            coordIndex = coords[geometryIndex].length + coordIndex;
          return require$$0$3.point(coords[geometryIndex][coordIndex], properties, options);
        case "MultiLineString":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          if (coordIndex < 0)
            coordIndex = coords[multiFeatureIndex].length + coordIndex;
          return require$$0$3.point(coords[multiFeatureIndex][coordIndex], properties, options);
        case "MultiPolygon":
          if (multiFeatureIndex < 0)
            multiFeatureIndex = coords.length + multiFeatureIndex;
          if (geometryIndex < 0)
            geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
          if (coordIndex < 0)
            coordIndex =
              coords[multiFeatureIndex][geometryIndex].length - coordIndex;
          return require$$0$3.point(
            coords[multiFeatureIndex][geometryIndex][coordIndex],
            properties,
            options
          );
      }
      throw new Error("geojson is invalid");
    }

    var coordAll_1 = coordAll;
    var coordEach_1 = coordEach;
    var coordReduce_1 = coordReduce;
    var featureEach_1 = featureEach$1;
    var featureReduce_1 = featureReduce;
    var findPoint_1 = findPoint;
    var findSegment_1 = findSegment;
    var flattenEach_1 = flattenEach;
    var flattenReduce_1 = flattenReduce;
    var geomEach_1 = geomEach;
    var geomReduce_1 = geomReduce;
    var lineEach_1 = lineEach;
    var lineReduce_1 = lineReduce;
    var propEach_1 = propEach;
    var propReduce_1 = propReduce;
    var segmentEach_1 = segmentEach;
    var segmentReduce_1 = segmentReduce;

    var js$j = /*#__PURE__*/Object.defineProperty({
    	coordAll: coordAll_1,
    	coordEach: coordEach_1,
    	coordReduce: coordReduce_1,
    	featureEach: featureEach_1,
    	featureReduce: featureReduce_1,
    	findPoint: findPoint_1,
    	findSegment: findSegment_1,
    	flattenEach: flattenEach_1,
    	flattenReduce: flattenReduce_1,
    	geomEach: geomEach_1,
    	geomReduce: geomReduce_1,
    	lineEach: lineEach_1,
    	lineReduce: lineReduce_1,
    	propEach: propEach_1,
    	propReduce: propReduce_1,
    	segmentEach: segmentEach_1,
    	segmentReduce: segmentReduce_1
    }, '__esModule', {value: true});

    var meta_1 = js$j;

    /**
     * Takes a set of features, calculates the bbox of all input features, and returns a bounding box.
     *
     * @name bbox
     * @param {GeoJSON} geojson any GeoJSON object
     * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
     * @example
     * var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]]);
     * var bbox = turf.bbox(line);
     * var bboxPolygon = turf.bboxPolygon(bbox);
     *
     * //addToMap
     * var addToMap = [line, bboxPolygon]
     */
    function bbox$1(geojson) {
        var result = [Infinity, Infinity, -Infinity, -Infinity];
        meta_1.coordEach(geojson, function (coord) {
            if (result[0] > coord[0]) {
                result[0] = coord[0];
            }
            if (result[1] > coord[1]) {
                result[1] = coord[1];
            }
            if (result[2] < coord[0]) {
                result[2] = coord[0];
            }
            if (result[3] < coord[1]) {
                result[3] = coord[1];
            }
        });
        return result;
    }
    bbox$1["default"] = bbox$1;
    var _default$i = bbox$1;

    var js$i = /*#__PURE__*/Object.defineProperty({
    	default: _default$i
    }, '__esModule', {value: true});

    var require$$2$1 = js$i;

    var require$$1$1 = js$k;

    function _interopDefaultLegacy$3 (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var bbox__default$1 = /*#__PURE__*/_interopDefaultLegacy$3(require$$2$1);
    var bboxPolygon__default = /*#__PURE__*/_interopDefaultLegacy$3(require$$1$1);

    /**
     * Takes any number of features and returns a rectangular {@link Polygon} that encompasses all vertices.
     *
     * @name envelope
     * @param {GeoJSON} geojson input features
     * @returns {Feature<Polygon>} a rectangular Polygon feature that encompasses all vertices
     * @example
     * var features = turf.featureCollection([
     *   turf.point([-75.343, 39.984], {"name": "Location A"}),
     *   turf.point([-75.833, 39.284], {"name": "Location B"}),
     *   turf.point([-75.534, 39.123], {"name": "Location C"})
     * ]);
     *
     * var enveloped = turf.envelope(features);
     *
     * //addToMap
     * var addToMap = [features, enveloped];
     */
    function envelope(geojson) {
      return bboxPolygon__default['default'](bbox__default$1['default'](geojson));
    }

    var js$h = envelope;
    var _default$h = envelope;
    js$h.default = _default$h;

    /**
     * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
     *
     * @name getCoord
     * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
     * @returns {Array<number>} coordinates
     * @example
     * var pt = turf.point([10, 10]);
     *
     * var coord = turf.getCoord(pt);
     * //= [10, 10]
     */
    function getCoord(coord) {
        if (!coord) {
            throw new Error("coord is required");
        }
        if (!Array.isArray(coord)) {
            if (coord.type === "Feature" &&
                coord.geometry !== null &&
                coord.geometry.type === "Point") {
                return coord.geometry.coordinates;
            }
            if (coord.type === "Point") {
                return coord.coordinates;
            }
        }
        if (Array.isArray(coord) &&
            coord.length >= 2 &&
            !Array.isArray(coord[0]) &&
            !Array.isArray(coord[1])) {
            return coord;
        }
        throw new Error("coord must be GeoJSON Point or an Array of numbers");
    }
    var getCoord_1 = getCoord;
    /**
     * Unwrap coordinates from a Feature, Geometry Object or an Array
     *
     * @name getCoords
     * @param {Array<any>|Geometry|Feature} coords Feature, Geometry Object or an Array
     * @returns {Array<any>} coordinates
     * @example
     * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
     *
     * var coords = turf.getCoords(poly);
     * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
     */
    function getCoords(coords) {
        if (Array.isArray(coords)) {
            return coords;
        }
        // Feature
        if (coords.type === "Feature") {
            if (coords.geometry !== null) {
                return coords.geometry.coordinates;
            }
        }
        else {
            // Geometry
            if (coords.coordinates) {
                return coords.coordinates;
            }
        }
        throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array");
    }
    var getCoords_1 = getCoords;
    /**
     * Checks if coordinates contains a number
     *
     * @name containsNumber
     * @param {Array<any>} coordinates GeoJSON Coordinates
     * @returns {boolean} true if Array contains a number
     */
    function containsNumber(coordinates) {
        if (coordinates.length > 1 &&
            require$$0$3.isNumber(coordinates[0]) &&
            require$$0$3.isNumber(coordinates[1])) {
            return true;
        }
        if (Array.isArray(coordinates[0]) && coordinates[0].length) {
            return containsNumber(coordinates[0]);
        }
        throw new Error("coordinates must only contain numbers");
    }
    var containsNumber_1 = containsNumber;
    /**
     * Enforce expectations about types of GeoJSON objects for Turf.
     *
     * @name geojsonType
     * @param {GeoJSON} value any GeoJSON object
     * @param {string} type expected GeoJSON type
     * @param {string} name name of calling function
     * @throws {Error} if value is not the expected type.
     */
    function geojsonType(value, type, name) {
        if (!type || !name) {
            throw new Error("type and name required");
        }
        if (!value || value.type !== type) {
            throw new Error("Invalid input to " +
                name +
                ": must be a " +
                type +
                ", given " +
                value.type);
        }
    }
    var geojsonType_1 = geojsonType;
    /**
     * Enforce expectations about types of {@link Feature} inputs for Turf.
     * Internally this uses {@link geojsonType} to judge geometry types.
     *
     * @name featureOf
     * @param {Feature} feature a feature with an expected geometry type
     * @param {string} type expected GeoJSON type
     * @param {string} name name of calling function
     * @throws {Error} error if value is not the expected type.
     */
    function featureOf(feature, type, name) {
        if (!feature) {
            throw new Error("No feature passed");
        }
        if (!name) {
            throw new Error(".featureOf() requires a name");
        }
        if (!feature || feature.type !== "Feature" || !feature.geometry) {
            throw new Error("Invalid input to " + name + ", Feature with geometry required");
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error("Invalid input to " +
                name +
                ": must be a " +
                type +
                ", given " +
                feature.geometry.type);
        }
    }
    var featureOf_1 = featureOf;
    /**
     * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
     * Internally this uses {@link geojsonType} to judge geometry types.
     *
     * @name collectionOf
     * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
     * @param {string} type expected GeoJSON type
     * @param {string} name name of calling function
     * @throws {Error} if value is not the expected type.
     */
    function collectionOf(featureCollection, type, name) {
        if (!featureCollection) {
            throw new Error("No featureCollection passed");
        }
        if (!name) {
            throw new Error(".collectionOf() requires a name");
        }
        if (!featureCollection || featureCollection.type !== "FeatureCollection") {
            throw new Error("Invalid input to " + name + ", FeatureCollection required");
        }
        for (var _i = 0, _a = featureCollection.features; _i < _a.length; _i++) {
            var feature = _a[_i];
            if (!feature || feature.type !== "Feature" || !feature.geometry) {
                throw new Error("Invalid input to " + name + ", Feature with geometry required");
            }
            if (!feature.geometry || feature.geometry.type !== type) {
                throw new Error("Invalid input to " +
                    name +
                    ": must be a " +
                    type +
                    ", given " +
                    feature.geometry.type);
            }
        }
    }
    var collectionOf_1 = collectionOf;
    /**
     * Get Geometry from Feature or Geometry Object
     *
     * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
     * @returns {Geometry|null} GeoJSON Geometry Object
     * @throws {Error} if geojson is not a Feature or Geometry Object
     * @example
     * var point = {
     *   "type": "Feature",
     *   "properties": {},
     *   "geometry": {
     *     "type": "Point",
     *     "coordinates": [110, 40]
     *   }
     * }
     * var geom = turf.getGeom(point)
     * //={"type": "Point", "coordinates": [110, 40]}
     */
    function getGeom(geojson) {
        if (geojson.type === "Feature") {
            return geojson.geometry;
        }
        return geojson;
    }
    var getGeom_1 = getGeom;
    /**
     * Get GeoJSON object's type, Geometry type is prioritize.
     *
     * @param {GeoJSON} geojson GeoJSON object
     * @param {string} [name="geojson"] name of the variable to display in error message (unused)
     * @returns {string} GeoJSON type
     * @example
     * var point = {
     *   "type": "Feature",
     *   "properties": {},
     *   "geometry": {
     *     "type": "Point",
     *     "coordinates": [110, 40]
     *   }
     * }
     * var geom = turf.getType(point)
     * //="Point"
     */
    function getType(geojson, _name) {
        if (geojson.type === "FeatureCollection") {
            return "FeatureCollection";
        }
        if (geojson.type === "GeometryCollection") {
            return "GeometryCollection";
        }
        if (geojson.type === "Feature" && geojson.geometry !== null) {
            return geojson.geometry.type;
        }
        return geojson.type;
    }
    var getType_1 = getType;

    var js$g = /*#__PURE__*/Object.defineProperty({
    	getCoord: getCoord_1,
    	getCoords: getCoords_1,
    	containsNumber: containsNumber_1,
    	geojsonType: geojsonType_1,
    	featureOf: featureOf_1,
    	collectionOf: collectionOf_1,
    	getGeom: getGeom_1,
    	getType: getType_1
    }, '__esModule', {value: true});

    var polygonClipping_umd = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
      module.exports = factory() ;
    }(commonjsGlobal, (function () {
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }

      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
      }

      /**
       * splaytree v3.1.0
       * Fast Splay tree for Node and browser
       *
       * @author Alexander Milevski <info@w8r.name>
       * @license MIT
       * @preserve
       */
      var Node =
      /** @class */
      function () {
        function Node(key, data) {
          this.next = null;
          this.key = key;
          this.data = data;
          this.left = null;
          this.right = null;
        }

        return Node;
      }();
      /* follows "An implementation of top-down splaying"
       * by D. Sleator <sleator@cs.cmu.edu> March 1992
       */


      function DEFAULT_COMPARE(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
      }
      /**
       * Simple top down splay, not requiring i to be in the tree t.
       */


      function splay(i, t, comparator) {
        var N = new Node(null, null);
        var l = N;
        var r = N;

        while (true) {
          var cmp = comparator(i, t.key); //if (i < t.key) {

          if (cmp < 0) {
            if (t.left === null) break; //if (i < t.left.key) {

            if (comparator(i, t.left.key) < 0) {
              var y = t.left;
              /* rotate right */

              t.left = y.right;
              y.right = t;
              t = y;
              if (t.left === null) break;
            }

            r.left = t;
            /* link right */

            r = t;
            t = t.left; //} else if (i > t.key) {
          } else if (cmp > 0) {
            if (t.right === null) break; //if (i > t.right.key) {

            if (comparator(i, t.right.key) > 0) {
              var y = t.right;
              /* rotate left */

              t.right = y.left;
              y.left = t;
              t = y;
              if (t.right === null) break;
            }

            l.right = t;
            /* link left */

            l = t;
            t = t.right;
          } else break;
        }
        /* assemble */


        l.right = t.left;
        r.left = t.right;
        t.left = N.right;
        t.right = N.left;
        return t;
      }

      function insert(i, data, t, comparator) {
        var node = new Node(i, data);

        if (t === null) {
          node.left = node.right = null;
          return node;
        }

        t = splay(i, t, comparator);
        var cmp = comparator(i, t.key);

        if (cmp < 0) {
          node.left = t.left;
          node.right = t;
          t.left = null;
        } else if (cmp >= 0) {
          node.right = t.right;
          node.left = t;
          t.right = null;
        }

        return node;
      }

      function split(key, v, comparator) {
        var left = null;
        var right = null;

        if (v) {
          v = splay(key, v, comparator);
          var cmp = comparator(v.key, key);

          if (cmp === 0) {
            left = v.left;
            right = v.right;
          } else if (cmp < 0) {
            right = v.right;
            v.right = null;
            left = v;
          } else {
            left = v.left;
            v.left = null;
            right = v;
          }
        }

        return {
          left: left,
          right: right
        };
      }

      function merge(left, right, comparator) {
        if (right === null) return left;
        if (left === null) return right;
        right = splay(left.key, right, comparator);
        right.left = left;
        return right;
      }
      /**
       * Prints level of the tree
       */


      function printRow(root, prefix, isTail, out, printNode) {
        if (root) {
          out("" + prefix + (isTail ? '└── ' : '├── ') + printNode(root) + "\n");
          var indent = prefix + (isTail ? '    ' : '│   ');
          if (root.left) printRow(root.left, indent, false, out, printNode);
          if (root.right) printRow(root.right, indent, true, out, printNode);
        }
      }

      var Tree =
      /** @class */
      function () {
        function Tree(comparator) {
          if (comparator === void 0) {
            comparator = DEFAULT_COMPARE;
          }

          this._root = null;
          this._size = 0;
          this._comparator = comparator;
        }
        /**
         * Inserts a key, allows duplicates
         */


        Tree.prototype.insert = function (key, data) {
          this._size++;
          return this._root = insert(key, data, this._root, this._comparator);
        };
        /**
         * Adds a key, if it is not present in the tree
         */


        Tree.prototype.add = function (key, data) {
          var node = new Node(key, data);

          if (this._root === null) {
            node.left = node.right = null;
            this._size++;
            this._root = node;
          }

          var comparator = this._comparator;
          var t = splay(key, this._root, comparator);
          var cmp = comparator(key, t.key);
          if (cmp === 0) this._root = t;else {
            if (cmp < 0) {
              node.left = t.left;
              node.right = t;
              t.left = null;
            } else if (cmp > 0) {
              node.right = t.right;
              node.left = t;
              t.right = null;
            }

            this._size++;
            this._root = node;
          }
          return this._root;
        };
        /**
         * @param  {Key} key
         * @return {Node|null}
         */


        Tree.prototype.remove = function (key) {
          this._root = this._remove(key, this._root, this._comparator);
        };
        /**
         * Deletes i from the tree if it's there
         */


        Tree.prototype._remove = function (i, t, comparator) {
          var x;
          if (t === null) return null;
          t = splay(i, t, comparator);
          var cmp = comparator(i, t.key);

          if (cmp === 0) {
            /* found it */
            if (t.left === null) {
              x = t.right;
            } else {
              x = splay(i, t.left, comparator);
              x.right = t.right;
            }

            this._size--;
            return x;
          }

          return t;
          /* It wasn't there */
        };
        /**
         * Removes and returns the node with smallest key
         */


        Tree.prototype.pop = function () {
          var node = this._root;

          if (node) {
            while (node.left) {
              node = node.left;
            }

            this._root = splay(node.key, this._root, this._comparator);
            this._root = this._remove(node.key, this._root, this._comparator);
            return {
              key: node.key,
              data: node.data
            };
          }

          return null;
        };
        /**
         * Find without splaying
         */


        Tree.prototype.findStatic = function (key) {
          var current = this._root;
          var compare = this._comparator;

          while (current) {
            var cmp = compare(key, current.key);
            if (cmp === 0) return current;else if (cmp < 0) current = current.left;else current = current.right;
          }

          return null;
        };

        Tree.prototype.find = function (key) {
          if (this._root) {
            this._root = splay(key, this._root, this._comparator);
            if (this._comparator(key, this._root.key) !== 0) return null;
          }

          return this._root;
        };

        Tree.prototype.contains = function (key) {
          var current = this._root;
          var compare = this._comparator;

          while (current) {
            var cmp = compare(key, current.key);
            if (cmp === 0) return true;else if (cmp < 0) current = current.left;else current = current.right;
          }

          return false;
        };

        Tree.prototype.forEach = function (visitor, ctx) {
          var current = this._root;
          var Q = [];
          /* Initialize stack s */

          var done = false;

          while (!done) {
            if (current !== null) {
              Q.push(current);
              current = current.left;
            } else {
              if (Q.length !== 0) {
                current = Q.pop();
                visitor.call(ctx, current);
                current = current.right;
              } else done = true;
            }
          }

          return this;
        };
        /**
         * Walk key range from `low` to `high`. Stops if `fn` returns a value.
         */


        Tree.prototype.range = function (low, high, fn, ctx) {
          var Q = [];
          var compare = this._comparator;
          var node = this._root;
          var cmp;

          while (Q.length !== 0 || node) {
            if (node) {
              Q.push(node);
              node = node.left;
            } else {
              node = Q.pop();
              cmp = compare(node.key, high);

              if (cmp > 0) {
                break;
              } else if (compare(node.key, low) >= 0) {
                if (fn.call(ctx, node)) return this; // stop if smth is returned
              }

              node = node.right;
            }
          }

          return this;
        };
        /**
         * Returns array of keys
         */


        Tree.prototype.keys = function () {
          var keys = [];
          this.forEach(function (_a) {
            var key = _a.key;
            return keys.push(key);
          });
          return keys;
        };
        /**
         * Returns array of all the data in the nodes
         */


        Tree.prototype.values = function () {
          var values = [];
          this.forEach(function (_a) {
            var data = _a.data;
            return values.push(data);
          });
          return values;
        };

        Tree.prototype.min = function () {
          if (this._root) return this.minNode(this._root).key;
          return null;
        };

        Tree.prototype.max = function () {
          if (this._root) return this.maxNode(this._root).key;
          return null;
        };

        Tree.prototype.minNode = function (t) {
          if (t === void 0) {
            t = this._root;
          }

          if (t) while (t.left) {
            t = t.left;
          }
          return t;
        };

        Tree.prototype.maxNode = function (t) {
          if (t === void 0) {
            t = this._root;
          }

          if (t) while (t.right) {
            t = t.right;
          }
          return t;
        };
        /**
         * Returns node at given index
         */


        Tree.prototype.at = function (index) {
          var current = this._root;
          var done = false;
          var i = 0;
          var Q = [];

          while (!done) {
            if (current) {
              Q.push(current);
              current = current.left;
            } else {
              if (Q.length > 0) {
                current = Q.pop();
                if (i === index) return current;
                i++;
                current = current.right;
              } else done = true;
            }
          }

          return null;
        };

        Tree.prototype.next = function (d) {
          var root = this._root;
          var successor = null;

          if (d.right) {
            successor = d.right;

            while (successor.left) {
              successor = successor.left;
            }

            return successor;
          }

          var comparator = this._comparator;

          while (root) {
            var cmp = comparator(d.key, root.key);
            if (cmp === 0) break;else if (cmp < 0) {
              successor = root;
              root = root.left;
            } else root = root.right;
          }

          return successor;
        };

        Tree.prototype.prev = function (d) {
          var root = this._root;
          var predecessor = null;

          if (d.left !== null) {
            predecessor = d.left;

            while (predecessor.right) {
              predecessor = predecessor.right;
            }

            return predecessor;
          }

          var comparator = this._comparator;

          while (root) {
            var cmp = comparator(d.key, root.key);
            if (cmp === 0) break;else if (cmp < 0) root = root.left;else {
              predecessor = root;
              root = root.right;
            }
          }

          return predecessor;
        };

        Tree.prototype.clear = function () {
          this._root = null;
          this._size = 0;
          return this;
        };

        Tree.prototype.toList = function () {
          return toList(this._root);
        };
        /**
         * Bulk-load items. Both array have to be same size
         */


        Tree.prototype.load = function (keys, values, presort) {
          if (values === void 0) {
            values = [];
          }

          if (presort === void 0) {
            presort = false;
          }

          var size = keys.length;
          var comparator = this._comparator; // sort if needed

          if (presort) sort(keys, values, 0, size - 1, comparator);

          if (this._root === null) {
            // empty tree
            this._root = loadRecursive(keys, values, 0, size);
            this._size = size;
          } else {
            // that re-builds the whole tree from two in-order traversals
            var mergedList = mergeLists(this.toList(), createList(keys, values), comparator);
            size = this._size + size;
            this._root = sortedListToBST({
              head: mergedList
            }, 0, size);
          }

          return this;
        };

        Tree.prototype.isEmpty = function () {
          return this._root === null;
        };

        Object.defineProperty(Tree.prototype, "size", {
          get: function get() {
            return this._size;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Tree.prototype, "root", {
          get: function get() {
            return this._root;
          },
          enumerable: true,
          configurable: true
        });

        Tree.prototype.toString = function (printNode) {
          if (printNode === void 0) {
            printNode = function printNode(n) {
              return String(n.key);
            };
          }

          var out = [];
          printRow(this._root, '', true, function (v) {
            return out.push(v);
          }, printNode);
          return out.join('');
        };

        Tree.prototype.update = function (key, newKey, newData) {
          var comparator = this._comparator;

          var _a = split(key, this._root, comparator),
              left = _a.left,
              right = _a.right;

          if (comparator(key, newKey) < 0) {
            right = insert(newKey, newData, right, comparator);
          } else {
            left = insert(newKey, newData, left, comparator);
          }

          this._root = merge(left, right, comparator);
        };

        Tree.prototype.split = function (key) {
          return split(key, this._root, this._comparator);
        };

        return Tree;
      }();

      function loadRecursive(keys, values, start, end) {
        var size = end - start;

        if (size > 0) {
          var middle = start + Math.floor(size / 2);
          var key = keys[middle];
          var data = values[middle];
          var node = new Node(key, data);
          node.left = loadRecursive(keys, values, start, middle);
          node.right = loadRecursive(keys, values, middle + 1, end);
          return node;
        }

        return null;
      }

      function createList(keys, values) {
        var head = new Node(null, null);
        var p = head;

        for (var i = 0; i < keys.length; i++) {
          p = p.next = new Node(keys[i], values[i]);
        }

        p.next = null;
        return head.next;
      }

      function toList(root) {
        var current = root;
        var Q = [];
        var done = false;
        var head = new Node(null, null);
        var p = head;

        while (!done) {
          if (current) {
            Q.push(current);
            current = current.left;
          } else {
            if (Q.length > 0) {
              current = p = p.next = Q.pop();
              current = current.right;
            } else done = true;
          }
        }

        p.next = null; // that'll work even if the tree was empty

        return head.next;
      }

      function sortedListToBST(list, start, end) {
        var size = end - start;

        if (size > 0) {
          var middle = start + Math.floor(size / 2);
          var left = sortedListToBST(list, start, middle);
          var root = list.head;
          root.left = left;
          list.head = list.head.next;
          root.right = sortedListToBST(list, middle + 1, end);
          return root;
        }

        return null;
      }

      function mergeLists(l1, l2, compare) {
        var head = new Node(null, null); // dummy

        var p = head;
        var p1 = l1;
        var p2 = l2;

        while (p1 !== null && p2 !== null) {
          if (compare(p1.key, p2.key) < 0) {
            p.next = p1;
            p1 = p1.next;
          } else {
            p.next = p2;
            p2 = p2.next;
          }

          p = p.next;
        }

        if (p1 !== null) {
          p.next = p1;
        } else if (p2 !== null) {
          p.next = p2;
        }

        return head.next;
      }

      function sort(keys, values, left, right, compare) {
        if (left >= right) return;
        var pivot = keys[left + right >> 1];
        var i = left - 1;
        var j = right + 1;

        while (true) {
          do {
            i++;
          } while (compare(keys[i], pivot) < 0);

          do {
            j--;
          } while (compare(keys[j], pivot) > 0);

          if (i >= j) break;
          var tmp = keys[i];
          keys[i] = keys[j];
          keys[j] = tmp;
          tmp = values[i];
          values[i] = values[j];
          values[j] = tmp;
        }

        sort(keys, values, left, j, compare);
        sort(keys, values, j + 1, right, compare);
      }

      /**
       * A bounding box has the format:
       *
       *  { ll: { x: xmin, y: ymin }, ur: { x: xmax, y: ymax } }
       *
       */
      var isInBbox = function isInBbox(bbox, point) {
        return bbox.ll.x <= point.x && point.x <= bbox.ur.x && bbox.ll.y <= point.y && point.y <= bbox.ur.y;
      };
      /* Returns either null, or a bbox (aka an ordered pair of points)
       * If there is only one point of overlap, a bbox with identical points
       * will be returned */

      var getBboxOverlap = function getBboxOverlap(b1, b2) {
        // check if the bboxes overlap at all
        if (b2.ur.x < b1.ll.x || b1.ur.x < b2.ll.x || b2.ur.y < b1.ll.y || b1.ur.y < b2.ll.y) return null; // find the middle two X values

        var lowerX = b1.ll.x < b2.ll.x ? b2.ll.x : b1.ll.x;
        var upperX = b1.ur.x < b2.ur.x ? b1.ur.x : b2.ur.x; // find the middle two Y values

        var lowerY = b1.ll.y < b2.ll.y ? b2.ll.y : b1.ll.y;
        var upperY = b1.ur.y < b2.ur.y ? b1.ur.y : b2.ur.y; // put those middle values together to get the overlap

        return {
          ll: {
            x: lowerX,
            y: lowerY
          },
          ur: {
            x: upperX,
            y: upperY
          }
        };
      };

      /* Javascript doesn't do integer math. Everything is
       * floating point with percision Number.EPSILON.
       *
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
       */
      var epsilon = Number.EPSILON; // IE Polyfill

      if (epsilon === undefined) epsilon = Math.pow(2, -52);
      var EPSILON_SQ = epsilon * epsilon;
      /* FLP comparator */

      var cmp = function cmp(a, b) {
        // check if they're both 0
        if (-epsilon < a && a < epsilon) {
          if (-epsilon < b && b < epsilon) {
            return 0;
          }
        } // check if they're flp equal


        var ab = a - b;

        if (ab * ab < EPSILON_SQ * a * b) {
          return 0;
        } // normal comparison


        return a < b ? -1 : 1;
      };

      /**
       * This class rounds incoming values sufficiently so that
       * floating points problems are, for the most part, avoided.
       *
       * Incoming points are have their x & y values tested against
       * all previously seen x & y values. If either is 'too close'
       * to a previously seen value, it's value is 'snapped' to the
       * previously seen value.
       *
       * All points should be rounded by this class before being
       * stored in any data structures in the rest of this algorithm.
       */

      var PtRounder = /*#__PURE__*/function () {
        function PtRounder() {
          _classCallCheck(this, PtRounder);

          this.reset();
        }

        _createClass(PtRounder, [{
          key: "reset",
          value: function reset() {
            this.xRounder = new CoordRounder();
            this.yRounder = new CoordRounder();
          }
        }, {
          key: "round",
          value: function round(x, y) {
            return {
              x: this.xRounder.round(x),
              y: this.yRounder.round(y)
            };
          }
        }]);

        return PtRounder;
      }();

      var CoordRounder = /*#__PURE__*/function () {
        function CoordRounder() {
          _classCallCheck(this, CoordRounder);

          this.tree = new Tree(); // preseed with 0 so we don't end up with values < Number.EPSILON

          this.round(0);
        } // Note: this can rounds input values backwards or forwards.
        //       You might ask, why not restrict this to just rounding
        //       forwards? Wouldn't that allow left endpoints to always
        //       remain left endpoints during splitting (never change to
        //       right). No - it wouldn't, because we snap intersections
        //       to endpoints (to establish independence from the segment
        //       angle for t-intersections).


        _createClass(CoordRounder, [{
          key: "round",
          value: function round(coord) {
            var node = this.tree.add(coord);
            var prevNode = this.tree.prev(node);

            if (prevNode !== null && cmp(node.key, prevNode.key) === 0) {
              this.tree.remove(coord);
              return prevNode.key;
            }

            var nextNode = this.tree.next(node);

            if (nextNode !== null && cmp(node.key, nextNode.key) === 0) {
              this.tree.remove(coord);
              return nextNode.key;
            }

            return coord;
          }
        }]);

        return CoordRounder;
      }(); // singleton available by import


      var rounder = new PtRounder();

      /* Cross Product of two vectors with first point at origin */

      var crossProduct = function crossProduct(a, b) {
        return a.x * b.y - a.y * b.x;
      };
      /* Dot Product of two vectors with first point at origin */

      var dotProduct = function dotProduct(a, b) {
        return a.x * b.x + a.y * b.y;
      };
      /* Comparator for two vectors with same starting point */

      var compareVectorAngles = function compareVectorAngles(basePt, endPt1, endPt2) {
        var v1 = {
          x: endPt1.x - basePt.x,
          y: endPt1.y - basePt.y
        };
        var v2 = {
          x: endPt2.x - basePt.x,
          y: endPt2.y - basePt.y
        };
        var kross = crossProduct(v1, v2);
        return cmp(kross, 0);
      };
      var length = function length(v) {
        return Math.sqrt(dotProduct(v, v));
      };
      /* Get the sine of the angle from pShared -> pAngle to pShaed -> pBase */

      var sineOfAngle = function sineOfAngle(pShared, pBase, pAngle) {
        var vBase = {
          x: pBase.x - pShared.x,
          y: pBase.y - pShared.y
        };
        var vAngle = {
          x: pAngle.x - pShared.x,
          y: pAngle.y - pShared.y
        };
        return crossProduct(vAngle, vBase) / length(vAngle) / length(vBase);
      };
      /* Get the cosine of the angle from pShared -> pAngle to pShaed -> pBase */

      var cosineOfAngle = function cosineOfAngle(pShared, pBase, pAngle) {
        var vBase = {
          x: pBase.x - pShared.x,
          y: pBase.y - pShared.y
        };
        var vAngle = {
          x: pAngle.x - pShared.x,
          y: pAngle.y - pShared.y
        };
        return dotProduct(vAngle, vBase) / length(vAngle) / length(vBase);
      };
      /* Get the x coordinate where the given line (defined by a point and vector)
       * crosses the horizontal line with the given y coordiante.
       * In the case of parrallel lines (including overlapping ones) returns null. */

      var horizontalIntersection = function horizontalIntersection(pt, v, y) {
        if (v.y === 0) return null;
        return {
          x: pt.x + v.x / v.y * (y - pt.y),
          y: y
        };
      };
      /* Get the y coordinate where the given line (defined by a point and vector)
       * crosses the vertical line with the given x coordiante.
       * In the case of parrallel lines (including overlapping ones) returns null. */

      var verticalIntersection = function verticalIntersection(pt, v, x) {
        if (v.x === 0) return null;
        return {
          x: x,
          y: pt.y + v.y / v.x * (x - pt.x)
        };
      };
      /* Get the intersection of two lines, each defined by a base point and a vector.
       * In the case of parrallel lines (including overlapping ones) returns null. */

      var intersection = function intersection(pt1, v1, pt2, v2) {
        // take some shortcuts for vertical and horizontal lines
        // this also ensures we don't calculate an intersection and then discover
        // it's actually outside the bounding box of the line
        if (v1.x === 0) return verticalIntersection(pt2, v2, pt1.x);
        if (v2.x === 0) return verticalIntersection(pt1, v1, pt2.x);
        if (v1.y === 0) return horizontalIntersection(pt2, v2, pt1.y);
        if (v2.y === 0) return horizontalIntersection(pt1, v1, pt2.y); // General case for non-overlapping segments.
        // This algorithm is based on Schneider and Eberly.
        // http://www.cimec.org.ar/~ncalvo/Schneider_Eberly.pdf - pg 244

        var kross = crossProduct(v1, v2);
        if (kross == 0) return null;
        var ve = {
          x: pt2.x - pt1.x,
          y: pt2.y - pt1.y
        };
        var d1 = crossProduct(ve, v1) / kross;
        var d2 = crossProduct(ve, v2) / kross; // take the average of the two calculations to minimize rounding error

        var x1 = pt1.x + d2 * v1.x,
            x2 = pt2.x + d1 * v2.x;
        var y1 = pt1.y + d2 * v1.y,
            y2 = pt2.y + d1 * v2.y;
        var x = (x1 + x2) / 2;
        var y = (y1 + y2) / 2;
        return {
          x: x,
          y: y
        };
      };

      var SweepEvent = /*#__PURE__*/function () {
        _createClass(SweepEvent, null, [{
          key: "compare",
          // for ordering sweep events in the sweep event queue
          value: function compare(a, b) {
            // favor event with a point that the sweep line hits first
            var ptCmp = SweepEvent.comparePoints(a.point, b.point);
            if (ptCmp !== 0) return ptCmp; // the points are the same, so link them if needed

            if (a.point !== b.point) a.link(b); // favor right events over left

            if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1; // we have two matching left or right endpoints
            // ordering of this case is the same as for their segments

            return Segment.compare(a.segment, b.segment);
          } // for ordering points in sweep line order

        }, {
          key: "comparePoints",
          value: function comparePoints(aPt, bPt) {
            if (aPt.x < bPt.x) return -1;
            if (aPt.x > bPt.x) return 1;
            if (aPt.y < bPt.y) return -1;
            if (aPt.y > bPt.y) return 1;
            return 0;
          } // Warning: 'point' input will be modified and re-used (for performance)

        }]);

        function SweepEvent(point, isLeft) {
          _classCallCheck(this, SweepEvent);

          if (point.events === undefined) point.events = [this];else point.events.push(this);
          this.point = point;
          this.isLeft = isLeft; // this.segment, this.otherSE set by factory
        }

        _createClass(SweepEvent, [{
          key: "link",
          value: function link(other) {
            if (other.point === this.point) {
              throw new Error('Tried to link already linked events');
            }

            var otherEvents = other.point.events;

            for (var i = 0, iMax = otherEvents.length; i < iMax; i++) {
              var evt = otherEvents[i];
              this.point.events.push(evt);
              evt.point = this.point;
            }

            this.checkForConsuming();
          }
          /* Do a pass over our linked events and check to see if any pair
           * of segments match, and should be consumed. */

        }, {
          key: "checkForConsuming",
          value: function checkForConsuming() {
            // FIXME: The loops in this method run O(n^2) => no good.
            //        Maintain little ordered sweep event trees?
            //        Can we maintaining an ordering that avoids the need
            //        for the re-sorting with getLeftmostComparator in geom-out?
            // Compare each pair of events to see if other events also match
            var numEvents = this.point.events.length;

            for (var i = 0; i < numEvents; i++) {
              var evt1 = this.point.events[i];
              if (evt1.segment.consumedBy !== undefined) continue;

              for (var j = i + 1; j < numEvents; j++) {
                var evt2 = this.point.events[j];
                if (evt2.consumedBy !== undefined) continue;
                if (evt1.otherSE.point.events !== evt2.otherSE.point.events) continue;
                evt1.segment.consume(evt2.segment);
              }
            }
          }
        }, {
          key: "getAvailableLinkedEvents",
          value: function getAvailableLinkedEvents() {
            // point.events is always of length 2 or greater
            var events = [];

            for (var i = 0, iMax = this.point.events.length; i < iMax; i++) {
              var evt = this.point.events[i];

              if (evt !== this && !evt.segment.ringOut && evt.segment.isInResult()) {
                events.push(evt);
              }
            }

            return events;
          }
          /**
           * Returns a comparator function for sorting linked events that will
           * favor the event that will give us the smallest left-side angle.
           * All ring construction starts as low as possible heading to the right,
           * so by always turning left as sharp as possible we'll get polygons
           * without uncessary loops & holes.
           *
           * The comparator function has a compute cache such that it avoids
           * re-computing already-computed values.
           */

        }, {
          key: "getLeftmostComparator",
          value: function getLeftmostComparator(baseEvent) {
            var _this = this;

            var cache = new Map();

            var fillCache = function fillCache(linkedEvent) {
              var nextEvent = linkedEvent.otherSE;
              cache.set(linkedEvent, {
                sine: sineOfAngle(_this.point, baseEvent.point, nextEvent.point),
                cosine: cosineOfAngle(_this.point, baseEvent.point, nextEvent.point)
              });
            };

            return function (a, b) {
              if (!cache.has(a)) fillCache(a);
              if (!cache.has(b)) fillCache(b);

              var _cache$get = cache.get(a),
                  asine = _cache$get.sine,
                  acosine = _cache$get.cosine;

              var _cache$get2 = cache.get(b),
                  bsine = _cache$get2.sine,
                  bcosine = _cache$get2.cosine; // both on or above x-axis


              if (asine >= 0 && bsine >= 0) {
                if (acosine < bcosine) return 1;
                if (acosine > bcosine) return -1;
                return 0;
              } // both below x-axis


              if (asine < 0 && bsine < 0) {
                if (acosine < bcosine) return -1;
                if (acosine > bcosine) return 1;
                return 0;
              } // one above x-axis, one below


              if (bsine < asine) return -1;
              if (bsine > asine) return 1;
              return 0;
            };
          }
        }]);

        return SweepEvent;
      }();

      // segments and sweep events when all else is identical

      var segmentId = 0;

      var Segment = /*#__PURE__*/function () {
        _createClass(Segment, null, [{
          key: "compare",

          /* This compare() function is for ordering segments in the sweep
           * line tree, and does so according to the following criteria:
           *
           * Consider the vertical line that lies an infinestimal step to the
           * right of the right-more of the two left endpoints of the input
           * segments. Imagine slowly moving a point up from negative infinity
           * in the increasing y direction. Which of the two segments will that
           * point intersect first? That segment comes 'before' the other one.
           *
           * If neither segment would be intersected by such a line, (if one
           * or more of the segments are vertical) then the line to be considered
           * is directly on the right-more of the two left inputs.
           */
          value: function compare(a, b) {
            var alx = a.leftSE.point.x;
            var blx = b.leftSE.point.x;
            var arx = a.rightSE.point.x;
            var brx = b.rightSE.point.x; // check if they're even in the same vertical plane

            if (brx < alx) return 1;
            if (arx < blx) return -1;
            var aly = a.leftSE.point.y;
            var bly = b.leftSE.point.y;
            var ary = a.rightSE.point.y;
            var bry = b.rightSE.point.y; // is left endpoint of segment B the right-more?

            if (alx < blx) {
              // are the two segments in the same horizontal plane?
              if (bly < aly && bly < ary) return 1;
              if (bly > aly && bly > ary) return -1; // is the B left endpoint colinear to segment A?

              var aCmpBLeft = a.comparePoint(b.leftSE.point);
              if (aCmpBLeft < 0) return 1;
              if (aCmpBLeft > 0) return -1; // is the A right endpoint colinear to segment B ?

              var bCmpARight = b.comparePoint(a.rightSE.point);
              if (bCmpARight !== 0) return bCmpARight; // colinear segments, consider the one with left-more
              // left endpoint to be first (arbitrary?)

              return -1;
            } // is left endpoint of segment A the right-more?


            if (alx > blx) {
              if (aly < bly && aly < bry) return -1;
              if (aly > bly && aly > bry) return 1; // is the A left endpoint colinear to segment B?

              var bCmpALeft = b.comparePoint(a.leftSE.point);
              if (bCmpALeft !== 0) return bCmpALeft; // is the B right endpoint colinear to segment A?

              var aCmpBRight = a.comparePoint(b.rightSE.point);
              if (aCmpBRight < 0) return 1;
              if (aCmpBRight > 0) return -1; // colinear segments, consider the one with left-more
              // left endpoint to be first (arbitrary?)

              return 1;
            } // if we get here, the two left endpoints are in the same
            // vertical plane, ie alx === blx
            // consider the lower left-endpoint to come first


            if (aly < bly) return -1;
            if (aly > bly) return 1; // left endpoints are identical
            // check for colinearity by using the left-more right endpoint
            // is the A right endpoint more left-more?

            if (arx < brx) {
              var _bCmpARight = b.comparePoint(a.rightSE.point);

              if (_bCmpARight !== 0) return _bCmpARight;
            } // is the B right endpoint more left-more?


            if (arx > brx) {
              var _aCmpBRight = a.comparePoint(b.rightSE.point);

              if (_aCmpBRight < 0) return 1;
              if (_aCmpBRight > 0) return -1;
            }

            if (arx !== brx) {
              // are these two [almost] vertical segments with opposite orientation?
              // if so, the one with the lower right endpoint comes first
              var ay = ary - aly;
              var ax = arx - alx;
              var by = bry - bly;
              var bx = brx - blx;
              if (ay > ax && by < bx) return 1;
              if (ay < ax && by > bx) return -1;
            } // we have colinear segments with matching orientation
            // consider the one with more left-more right endpoint to be first


            if (arx > brx) return 1;
            if (arx < brx) return -1; // if we get here, two two right endpoints are in the same
            // vertical plane, ie arx === brx
            // consider the lower right-endpoint to come first

            if (ary < bry) return -1;
            if (ary > bry) return 1; // right endpoints identical as well, so the segments are idential
            // fall back on creation order as consistent tie-breaker

            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1; // identical segment, ie a === b

            return 0;
          }
          /* Warning: a reference to ringWindings input will be stored,
           *  and possibly will be later modified */

        }]);

        function Segment(leftSE, rightSE, rings, windings) {
          _classCallCheck(this, Segment);

          this.id = ++segmentId;
          this.leftSE = leftSE;
          leftSE.segment = this;
          leftSE.otherSE = rightSE;
          this.rightSE = rightSE;
          rightSE.segment = this;
          rightSE.otherSE = leftSE;
          this.rings = rings;
          this.windings = windings; // left unset for performance, set later in algorithm
          // this.ringOut, this.consumedBy, this.prev
        }

        _createClass(Segment, [{
          key: "replaceRightSE",

          /* When a segment is split, the rightSE is replaced with a new sweep event */
          value: function replaceRightSE(newRightSE) {
            this.rightSE = newRightSE;
            this.rightSE.segment = this;
            this.rightSE.otherSE = this.leftSE;
            this.leftSE.otherSE = this.rightSE;
          }
        }, {
          key: "bbox",
          value: function bbox() {
            var y1 = this.leftSE.point.y;
            var y2 = this.rightSE.point.y;
            return {
              ll: {
                x: this.leftSE.point.x,
                y: y1 < y2 ? y1 : y2
              },
              ur: {
                x: this.rightSE.point.x,
                y: y1 > y2 ? y1 : y2
              }
            };
          }
          /* A vector from the left point to the right */

        }, {
          key: "vector",
          value: function vector() {
            return {
              x: this.rightSE.point.x - this.leftSE.point.x,
              y: this.rightSE.point.y - this.leftSE.point.y
            };
          }
        }, {
          key: "isAnEndpoint",
          value: function isAnEndpoint(pt) {
            return pt.x === this.leftSE.point.x && pt.y === this.leftSE.point.y || pt.x === this.rightSE.point.x && pt.y === this.rightSE.point.y;
          }
          /* Compare this segment with a point.
           *
           * A point P is considered to be colinear to a segment if there
           * exists a distance D such that if we travel along the segment
           * from one * endpoint towards the other a distance D, we find
           * ourselves at point P.
           *
           * Return value indicates:
           *
           *   1: point lies above the segment (to the left of vertical)
           *   0: point is colinear to segment
           *  -1: point lies below the segment (to the right of vertical)
           */

        }, {
          key: "comparePoint",
          value: function comparePoint(point) {
            if (this.isAnEndpoint(point)) return 0;
            var lPt = this.leftSE.point;
            var rPt = this.rightSE.point;
            var v = this.vector(); // Exactly vertical segments.

            if (lPt.x === rPt.x) {
              if (point.x === lPt.x) return 0;
              return point.x < lPt.x ? 1 : -1;
            } // Nearly vertical segments with an intersection.
            // Check to see where a point on the line with matching Y coordinate is.


            var yDist = (point.y - lPt.y) / v.y;
            var xFromYDist = lPt.x + yDist * v.x;
            if (point.x === xFromYDist) return 0; // General case.
            // Check to see where a point on the line with matching X coordinate is.

            var xDist = (point.x - lPt.x) / v.x;
            var yFromXDist = lPt.y + xDist * v.y;
            if (point.y === yFromXDist) return 0;
            return point.y < yFromXDist ? -1 : 1;
          }
          /**
           * Given another segment, returns the first non-trivial intersection
           * between the two segments (in terms of sweep line ordering), if it exists.
           *
           * A 'non-trivial' intersection is one that will cause one or both of the
           * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
           *
           *   * endpoint of segA with endpoint of segB --> trivial
           *   * endpoint of segA with point along segB --> non-trivial
           *   * endpoint of segB with point along segA --> non-trivial
           *   * point along segA with point along segB --> non-trivial
           *
           * If no non-trivial intersection exists, return null
           * Else, return null.
           */

        }, {
          key: "getIntersection",
          value: function getIntersection(other) {
            // If bboxes don't overlap, there can't be any intersections
            var tBbox = this.bbox();
            var oBbox = other.bbox();
            var bboxOverlap = getBboxOverlap(tBbox, oBbox);
            if (bboxOverlap === null) return null; // We first check to see if the endpoints can be considered intersections.
            // This will 'snap' intersections to endpoints if possible, and will
            // handle cases of colinearity.

            var tlp = this.leftSE.point;
            var trp = this.rightSE.point;
            var olp = other.leftSE.point;
            var orp = other.rightSE.point; // does each endpoint touch the other segment?
            // note that we restrict the 'touching' definition to only allow segments
            // to touch endpoints that lie forward from where we are in the sweep line pass

            var touchesOtherLSE = isInBbox(tBbox, olp) && this.comparePoint(olp) === 0;
            var touchesThisLSE = isInBbox(oBbox, tlp) && other.comparePoint(tlp) === 0;
            var touchesOtherRSE = isInBbox(tBbox, orp) && this.comparePoint(orp) === 0;
            var touchesThisRSE = isInBbox(oBbox, trp) && other.comparePoint(trp) === 0; // do left endpoints match?

            if (touchesThisLSE && touchesOtherLSE) {
              // these two cases are for colinear segments with matching left
              // endpoints, and one segment being longer than the other
              if (touchesThisRSE && !touchesOtherRSE) return trp;
              if (!touchesThisRSE && touchesOtherRSE) return orp; // either the two segments match exactly (two trival intersections)
              // or just on their left endpoint (one trivial intersection

              return null;
            } // does this left endpoint matches (other doesn't)


            if (touchesThisLSE) {
              // check for segments that just intersect on opposing endpoints
              if (touchesOtherRSE) {
                if (tlp.x === orp.x && tlp.y === orp.y) return null;
              } // t-intersection on left endpoint


              return tlp;
            } // does other left endpoint matches (this doesn't)


            if (touchesOtherLSE) {
              // check for segments that just intersect on opposing endpoints
              if (touchesThisRSE) {
                if (trp.x === olp.x && trp.y === olp.y) return null;
              } // t-intersection on left endpoint


              return olp;
            } // trivial intersection on right endpoints


            if (touchesThisRSE && touchesOtherRSE) return null; // t-intersections on just one right endpoint

            if (touchesThisRSE) return trp;
            if (touchesOtherRSE) return orp; // None of our endpoints intersect. Look for a general intersection between
            // infinite lines laid over the segments

            var pt = intersection(tlp, this.vector(), olp, other.vector()); // are the segments parrallel? Note that if they were colinear with overlap,
            // they would have an endpoint intersection and that case was already handled above

            if (pt === null) return null; // is the intersection found between the lines not on the segments?

            if (!isInBbox(bboxOverlap, pt)) return null; // round the the computed point if needed

            return rounder.round(pt.x, pt.y);
          }
          /**
           * Split the given segment into multiple segments on the given points.
           *  * Each existing segment will retain its leftSE and a new rightSE will be
           *    generated for it.
           *  * A new segment will be generated which will adopt the original segment's
           *    rightSE, and a new leftSE will be generated for it.
           *  * If there are more than two points given to split on, new segments
           *    in the middle will be generated with new leftSE and rightSE's.
           *  * An array of the newly generated SweepEvents will be returned.
           *
           * Warning: input array of points is modified
           */

        }, {
          key: "split",
          value: function split(point) {
            var newEvents = [];
            var alreadyLinked = point.events !== undefined;
            var newLeftSE = new SweepEvent(point, true);
            var newRightSE = new SweepEvent(point, false);
            var oldRightSE = this.rightSE;
            this.replaceRightSE(newRightSE);
            newEvents.push(newRightSE);
            newEvents.push(newLeftSE);
            var newSeg = new Segment(newLeftSE, oldRightSE, this.rings.slice(), this.windings.slice()); // when splitting a nearly vertical downward-facing segment,
            // sometimes one of the resulting new segments is vertical, in which
            // case its left and right events may need to be swapped

            if (SweepEvent.comparePoints(newSeg.leftSE.point, newSeg.rightSE.point) > 0) {
              newSeg.swapEvents();
            }

            if (SweepEvent.comparePoints(this.leftSE.point, this.rightSE.point) > 0) {
              this.swapEvents();
            } // in the point we just used to create new sweep events with was already
            // linked to other events, we need to check if either of the affected
            // segments should be consumed


            if (alreadyLinked) {
              newLeftSE.checkForConsuming();
              newRightSE.checkForConsuming();
            }

            return newEvents;
          }
          /* Swap which event is left and right */

        }, {
          key: "swapEvents",
          value: function swapEvents() {
            var tmpEvt = this.rightSE;
            this.rightSE = this.leftSE;
            this.leftSE = tmpEvt;
            this.leftSE.isLeft = true;
            this.rightSE.isLeft = false;

            for (var i = 0, iMax = this.windings.length; i < iMax; i++) {
              this.windings[i] *= -1;
            }
          }
          /* Consume another segment. We take their rings under our wing
           * and mark them as consumed. Use for perfectly overlapping segments */

        }, {
          key: "consume",
          value: function consume(other) {
            var consumer = this;
            var consumee = other;

            while (consumer.consumedBy) {
              consumer = consumer.consumedBy;
            }

            while (consumee.consumedBy) {
              consumee = consumee.consumedBy;
            }

            var cmp = Segment.compare(consumer, consumee);
            if (cmp === 0) return; // already consumed
            // the winner of the consumption is the earlier segment
            // according to sweep line ordering

            if (cmp > 0) {
              var tmp = consumer;
              consumer = consumee;
              consumee = tmp;
            } // make sure a segment doesn't consume it's prev


            if (consumer.prev === consumee) {
              var _tmp = consumer;
              consumer = consumee;
              consumee = _tmp;
            }

            for (var i = 0, iMax = consumee.rings.length; i < iMax; i++) {
              var ring = consumee.rings[i];
              var winding = consumee.windings[i];
              var index = consumer.rings.indexOf(ring);

              if (index === -1) {
                consumer.rings.push(ring);
                consumer.windings.push(winding);
              } else consumer.windings[index] += winding;
            }

            consumee.rings = null;
            consumee.windings = null;
            consumee.consumedBy = consumer; // mark sweep events consumed as to maintain ordering in sweep event queue

            consumee.leftSE.consumedBy = consumer.leftSE;
            consumee.rightSE.consumedBy = consumer.rightSE;
          }
          /* The first segment previous segment chain that is in the result */

        }, {
          key: "prevInResult",
          value: function prevInResult() {
            if (this._prevInResult !== undefined) return this._prevInResult;
            if (!this.prev) this._prevInResult = null;else if (this.prev.isInResult()) this._prevInResult = this.prev;else this._prevInResult = this.prev.prevInResult();
            return this._prevInResult;
          }
        }, {
          key: "beforeState",
          value: function beforeState() {
            if (this._beforeState !== undefined) return this._beforeState;
            if (!this.prev) this._beforeState = {
              rings: [],
              windings: [],
              multiPolys: []
            };else {
              var seg = this.prev.consumedBy || this.prev;
              this._beforeState = seg.afterState();
            }
            return this._beforeState;
          }
        }, {
          key: "afterState",
          value: function afterState() {
            if (this._afterState !== undefined) return this._afterState;
            var beforeState = this.beforeState();
            this._afterState = {
              rings: beforeState.rings.slice(0),
              windings: beforeState.windings.slice(0),
              multiPolys: []
            };
            var ringsAfter = this._afterState.rings;
            var windingsAfter = this._afterState.windings;
            var mpsAfter = this._afterState.multiPolys; // calculate ringsAfter, windingsAfter

            for (var i = 0, iMax = this.rings.length; i < iMax; i++) {
              var ring = this.rings[i];
              var winding = this.windings[i];
              var index = ringsAfter.indexOf(ring);

              if (index === -1) {
                ringsAfter.push(ring);
                windingsAfter.push(winding);
              } else windingsAfter[index] += winding;
            } // calcualte polysAfter


            var polysAfter = [];
            var polysExclude = [];

            for (var _i = 0, _iMax = ringsAfter.length; _i < _iMax; _i++) {
              if (windingsAfter[_i] === 0) continue; // non-zero rule

              var _ring = ringsAfter[_i];
              var poly = _ring.poly;
              if (polysExclude.indexOf(poly) !== -1) continue;
              if (_ring.isExterior) polysAfter.push(poly);else {
                if (polysExclude.indexOf(poly) === -1) polysExclude.push(poly);

                var _index = polysAfter.indexOf(_ring.poly);

                if (_index !== -1) polysAfter.splice(_index, 1);
              }
            } // calculate multiPolysAfter


            for (var _i2 = 0, _iMax2 = polysAfter.length; _i2 < _iMax2; _i2++) {
              var mp = polysAfter[_i2].multiPoly;
              if (mpsAfter.indexOf(mp) === -1) mpsAfter.push(mp);
            }

            return this._afterState;
          }
          /* Is this segment part of the final result? */

        }, {
          key: "isInResult",
          value: function isInResult() {
            // if we've been consumed, we're not in the result
            if (this.consumedBy) return false;
            if (this._isInResult !== undefined) return this._isInResult;
            var mpsBefore = this.beforeState().multiPolys;
            var mpsAfter = this.afterState().multiPolys;

            switch (operation.type) {
              case 'union':
                {
                  // UNION - included iff:
                  //  * On one side of us there is 0 poly interiors AND
                  //  * On the other side there is 1 or more.
                  var noBefores = mpsBefore.length === 0;
                  var noAfters = mpsAfter.length === 0;
                  this._isInResult = noBefores !== noAfters;
                  break;
                }

              case 'intersection':
                {
                  // INTERSECTION - included iff:
                  //  * on one side of us all multipolys are rep. with poly interiors AND
                  //  * on the other side of us, not all multipolys are repsented
                  //    with poly interiors
                  var least;
                  var most;

                  if (mpsBefore.length < mpsAfter.length) {
                    least = mpsBefore.length;
                    most = mpsAfter.length;
                  } else {
                    least = mpsAfter.length;
                    most = mpsBefore.length;
                  }

                  this._isInResult = most === operation.numMultiPolys && least < most;
                  break;
                }

              case 'xor':
                {
                  // XOR - included iff:
                  //  * the difference between the number of multipolys represented
                  //    with poly interiors on our two sides is an odd number
                  var diff = Math.abs(mpsBefore.length - mpsAfter.length);
                  this._isInResult = diff % 2 === 1;
                  break;
                }

              case 'difference':
                {
                  // DIFFERENCE included iff:
                  //  * on exactly one side, we have just the subject
                  var isJustSubject = function isJustSubject(mps) {
                    return mps.length === 1 && mps[0].isSubject;
                  };

                  this._isInResult = isJustSubject(mpsBefore) !== isJustSubject(mpsAfter);
                  break;
                }

              default:
                throw new Error("Unrecognized operation type found ".concat(operation.type));
            }

            return this._isInResult;
          }
        }], [{
          key: "fromRing",
          value: function fromRing(pt1, pt2, ring) {
            var leftPt, rightPt, winding; // ordering the two points according to sweep line ordering

            var cmpPts = SweepEvent.comparePoints(pt1, pt2);

            if (cmpPts < 0) {
              leftPt = pt1;
              rightPt = pt2;
              winding = 1;
            } else if (cmpPts > 0) {
              leftPt = pt2;
              rightPt = pt1;
              winding = -1;
            } else throw new Error("Tried to create degenerate segment at [".concat(pt1.x, ", ").concat(pt1.y, "]"));

            var leftSE = new SweepEvent(leftPt, true);
            var rightSE = new SweepEvent(rightPt, false);
            return new Segment(leftSE, rightSE, [ring], [winding]);
          }
        }]);

        return Segment;
      }();

      var RingIn = /*#__PURE__*/function () {
        function RingIn(geomRing, poly, isExterior) {
          _classCallCheck(this, RingIn);

          if (!Array.isArray(geomRing) || geomRing.length === 0) {
            throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
          }

          this.poly = poly;
          this.isExterior = isExterior;
          this.segments = [];

          if (typeof geomRing[0][0] !== 'number' || typeof geomRing[0][1] !== 'number') {
            throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
          }

          var firstPoint = rounder.round(geomRing[0][0], geomRing[0][1]);
          this.bbox = {
            ll: {
              x: firstPoint.x,
              y: firstPoint.y
            },
            ur: {
              x: firstPoint.x,
              y: firstPoint.y
            }
          };
          var prevPoint = firstPoint;

          for (var i = 1, iMax = geomRing.length; i < iMax; i++) {
            if (typeof geomRing[i][0] !== 'number' || typeof geomRing[i][1] !== 'number') {
              throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
            }

            var point = rounder.round(geomRing[i][0], geomRing[i][1]); // skip repeated points

            if (point.x === prevPoint.x && point.y === prevPoint.y) continue;
            this.segments.push(Segment.fromRing(prevPoint, point, this));
            if (point.x < this.bbox.ll.x) this.bbox.ll.x = point.x;
            if (point.y < this.bbox.ll.y) this.bbox.ll.y = point.y;
            if (point.x > this.bbox.ur.x) this.bbox.ur.x = point.x;
            if (point.y > this.bbox.ur.y) this.bbox.ur.y = point.y;
            prevPoint = point;
          } // add segment from last to first if last is not the same as first


          if (firstPoint.x !== prevPoint.x || firstPoint.y !== prevPoint.y) {
            this.segments.push(Segment.fromRing(prevPoint, firstPoint, this));
          }
        }

        _createClass(RingIn, [{
          key: "getSweepEvents",
          value: function getSweepEvents() {
            var sweepEvents = [];

            for (var i = 0, iMax = this.segments.length; i < iMax; i++) {
              var segment = this.segments[i];
              sweepEvents.push(segment.leftSE);
              sweepEvents.push(segment.rightSE);
            }

            return sweepEvents;
          }
        }]);

        return RingIn;
      }();
      var PolyIn = /*#__PURE__*/function () {
        function PolyIn(geomPoly, multiPoly) {
          _classCallCheck(this, PolyIn);

          if (!Array.isArray(geomPoly)) {
            throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
          }

          this.exteriorRing = new RingIn(geomPoly[0], this, true); // copy by value

          this.bbox = {
            ll: {
              x: this.exteriorRing.bbox.ll.x,
              y: this.exteriorRing.bbox.ll.y
            },
            ur: {
              x: this.exteriorRing.bbox.ur.x,
              y: this.exteriorRing.bbox.ur.y
            }
          };
          this.interiorRings = [];

          for (var i = 1, iMax = geomPoly.length; i < iMax; i++) {
            var ring = new RingIn(geomPoly[i], this, false);
            if (ring.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = ring.bbox.ll.x;
            if (ring.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = ring.bbox.ll.y;
            if (ring.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = ring.bbox.ur.x;
            if (ring.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = ring.bbox.ur.y;
            this.interiorRings.push(ring);
          }

          this.multiPoly = multiPoly;
        }

        _createClass(PolyIn, [{
          key: "getSweepEvents",
          value: function getSweepEvents() {
            var sweepEvents = this.exteriorRing.getSweepEvents();

            for (var i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
              var ringSweepEvents = this.interiorRings[i].getSweepEvents();

              for (var j = 0, jMax = ringSweepEvents.length; j < jMax; j++) {
                sweepEvents.push(ringSweepEvents[j]);
              }
            }

            return sweepEvents;
          }
        }]);

        return PolyIn;
      }();
      var MultiPolyIn = /*#__PURE__*/function () {
        function MultiPolyIn(geom, isSubject) {
          _classCallCheck(this, MultiPolyIn);

          if (!Array.isArray(geom)) {
            throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
          }

          try {
            // if the input looks like a polygon, convert it to a multipolygon
            if (typeof geom[0][0][0] === 'number') geom = [geom];
          } catch (ex) {// The input is either malformed or has empty arrays.
            // In either case, it will be handled later on.
          }

          this.polys = [];
          this.bbox = {
            ll: {
              x: Number.POSITIVE_INFINITY,
              y: Number.POSITIVE_INFINITY
            },
            ur: {
              x: Number.NEGATIVE_INFINITY,
              y: Number.NEGATIVE_INFINITY
            }
          };

          for (var i = 0, iMax = geom.length; i < iMax; i++) {
            var poly = new PolyIn(geom[i], this);
            if (poly.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = poly.bbox.ll.x;
            if (poly.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = poly.bbox.ll.y;
            if (poly.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = poly.bbox.ur.x;
            if (poly.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = poly.bbox.ur.y;
            this.polys.push(poly);
          }

          this.isSubject = isSubject;
        }

        _createClass(MultiPolyIn, [{
          key: "getSweepEvents",
          value: function getSweepEvents() {
            var sweepEvents = [];

            for (var i = 0, iMax = this.polys.length; i < iMax; i++) {
              var polySweepEvents = this.polys[i].getSweepEvents();

              for (var j = 0, jMax = polySweepEvents.length; j < jMax; j++) {
                sweepEvents.push(polySweepEvents[j]);
              }
            }

            return sweepEvents;
          }
        }]);

        return MultiPolyIn;
      }();

      var RingOut = /*#__PURE__*/function () {
        _createClass(RingOut, null, [{
          key: "factory",

          /* Given the segments from the sweep line pass, compute & return a series
           * of closed rings from all the segments marked to be part of the result */
          value: function factory(allSegments) {
            var ringsOut = [];

            for (var i = 0, iMax = allSegments.length; i < iMax; i++) {
              var segment = allSegments[i];
              if (!segment.isInResult() || segment.ringOut) continue;
              var prevEvent = null;
              var event = segment.leftSE;
              var nextEvent = segment.rightSE;
              var events = [event];
              var startingPoint = event.point;
              var intersectionLEs = [];
              /* Walk the chain of linked events to form a closed ring */

              while (true) {
                prevEvent = event;
                event = nextEvent;
                events.push(event);
                /* Is the ring complete? */

                if (event.point === startingPoint) break;

                while (true) {
                  var availableLEs = event.getAvailableLinkedEvents();
                  /* Did we hit a dead end? This shouldn't happen. Indicates some earlier
                   * part of the algorithm malfunctioned... please file a bug report. */

                  if (availableLEs.length === 0) {
                    var firstPt = events[0].point;
                    var lastPt = events[events.length - 1].point;
                    throw new Error("Unable to complete output ring starting at [".concat(firstPt.x, ",") + " ".concat(firstPt.y, "]. Last matching segment found ends at") + " [".concat(lastPt.x, ", ").concat(lastPt.y, "]."));
                  }
                  /* Only one way to go, so cotinue on the path */


                  if (availableLEs.length === 1) {
                    nextEvent = availableLEs[0].otherSE;
                    break;
                  }
                  /* We must have an intersection. Check for a completed loop */


                  var indexLE = null;

                  for (var j = 0, jMax = intersectionLEs.length; j < jMax; j++) {
                    if (intersectionLEs[j].point === event.point) {
                      indexLE = j;
                      break;
                    }
                  }
                  /* Found a completed loop. Cut that off and make a ring */


                  if (indexLE !== null) {
                    var intersectionLE = intersectionLEs.splice(indexLE)[0];
                    var ringEvents = events.splice(intersectionLE.index);
                    ringEvents.unshift(ringEvents[0].otherSE);
                    ringsOut.push(new RingOut(ringEvents.reverse()));
                    continue;
                  }
                  /* register the intersection */


                  intersectionLEs.push({
                    index: events.length,
                    point: event.point
                  });
                  /* Choose the left-most option to continue the walk */

                  var comparator = event.getLeftmostComparator(prevEvent);
                  nextEvent = availableLEs.sort(comparator)[0].otherSE;
                  break;
                }
              }

              ringsOut.push(new RingOut(events));
            }

            return ringsOut;
          }
        }]);

        function RingOut(events) {
          _classCallCheck(this, RingOut);

          this.events = events;

          for (var i = 0, iMax = events.length; i < iMax; i++) {
            events[i].segment.ringOut = this;
          }

          this.poly = null;
        }

        _createClass(RingOut, [{
          key: "getGeom",
          value: function getGeom() {
            // Remove superfluous points (ie extra points along a straight line),
            var prevPt = this.events[0].point;
            var points = [prevPt];

            for (var i = 1, iMax = this.events.length - 1; i < iMax; i++) {
              var _pt = this.events[i].point;
              var _nextPt = this.events[i + 1].point;
              if (compareVectorAngles(_pt, prevPt, _nextPt) === 0) continue;
              points.push(_pt);
              prevPt = _pt;
            } // ring was all (within rounding error of angle calc) colinear points


            if (points.length === 1) return null; // check if the starting point is necessary

            var pt = points[0];
            var nextPt = points[1];
            if (compareVectorAngles(pt, prevPt, nextPt) === 0) points.shift();
            points.push(points[0]);
            var step = this.isExteriorRing() ? 1 : -1;
            var iStart = this.isExteriorRing() ? 0 : points.length - 1;
            var iEnd = this.isExteriorRing() ? points.length : -1;
            var orderedPoints = [];

            for (var _i = iStart; _i != iEnd; _i += step) {
              orderedPoints.push([points[_i].x, points[_i].y]);
            }

            return orderedPoints;
          }
        }, {
          key: "isExteriorRing",
          value: function isExteriorRing() {
            if (this._isExteriorRing === undefined) {
              var enclosing = this.enclosingRing();
              this._isExteriorRing = enclosing ? !enclosing.isExteriorRing() : true;
            }

            return this._isExteriorRing;
          }
        }, {
          key: "enclosingRing",
          value: function enclosingRing() {
            if (this._enclosingRing === undefined) {
              this._enclosingRing = this._calcEnclosingRing();
            }

            return this._enclosingRing;
          }
          /* Returns the ring that encloses this one, if any */

        }, {
          key: "_calcEnclosingRing",
          value: function _calcEnclosingRing() {
            // start with the ealier sweep line event so that the prevSeg
            // chain doesn't lead us inside of a loop of ours
            var leftMostEvt = this.events[0];

            for (var i = 1, iMax = this.events.length; i < iMax; i++) {
              var evt = this.events[i];
              if (SweepEvent.compare(leftMostEvt, evt) > 0) leftMostEvt = evt;
            }

            var prevSeg = leftMostEvt.segment.prevInResult();
            var prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;

            while (true) {
              // no segment found, thus no ring can enclose us
              if (!prevSeg) return null; // no segments below prev segment found, thus the ring of the prev
              // segment must loop back around and enclose us

              if (!prevPrevSeg) return prevSeg.ringOut; // if the two segments are of different rings, the ring of the prev
              // segment must either loop around us or the ring of the prev prev
              // seg, which would make us and the ring of the prev peers

              if (prevPrevSeg.ringOut !== prevSeg.ringOut) {
                if (prevPrevSeg.ringOut.enclosingRing() !== prevSeg.ringOut) {
                  return prevSeg.ringOut;
                } else return prevSeg.ringOut.enclosingRing();
              } // two segments are from the same ring, so this was a penisula
              // of that ring. iterate downward, keep searching


              prevSeg = prevPrevSeg.prevInResult();
              prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;
            }
          }
        }]);

        return RingOut;
      }();
      var PolyOut = /*#__PURE__*/function () {
        function PolyOut(exteriorRing) {
          _classCallCheck(this, PolyOut);

          this.exteriorRing = exteriorRing;
          exteriorRing.poly = this;
          this.interiorRings = [];
        }

        _createClass(PolyOut, [{
          key: "addInterior",
          value: function addInterior(ring) {
            this.interiorRings.push(ring);
            ring.poly = this;
          }
        }, {
          key: "getGeom",
          value: function getGeom() {
            var geom = [this.exteriorRing.getGeom()]; // exterior ring was all (within rounding error of angle calc) colinear points

            if (geom[0] === null) return null;

            for (var i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
              var ringGeom = this.interiorRings[i].getGeom(); // interior ring was all (within rounding error of angle calc) colinear points

              if (ringGeom === null) continue;
              geom.push(ringGeom);
            }

            return geom;
          }
        }]);

        return PolyOut;
      }();
      var MultiPolyOut = /*#__PURE__*/function () {
        function MultiPolyOut(rings) {
          _classCallCheck(this, MultiPolyOut);

          this.rings = rings;
          this.polys = this._composePolys(rings);
        }

        _createClass(MultiPolyOut, [{
          key: "getGeom",
          value: function getGeom() {
            var geom = [];

            for (var i = 0, iMax = this.polys.length; i < iMax; i++) {
              var polyGeom = this.polys[i].getGeom(); // exterior ring was all (within rounding error of angle calc) colinear points

              if (polyGeom === null) continue;
              geom.push(polyGeom);
            }

            return geom;
          }
        }, {
          key: "_composePolys",
          value: function _composePolys(rings) {
            var polys = [];

            for (var i = 0, iMax = rings.length; i < iMax; i++) {
              var ring = rings[i];
              if (ring.poly) continue;
              if (ring.isExteriorRing()) polys.push(new PolyOut(ring));else {
                var enclosingRing = ring.enclosingRing();
                if (!enclosingRing.poly) polys.push(new PolyOut(enclosingRing));
                enclosingRing.poly.addInterior(ring);
              }
            }

            return polys;
          }
        }]);

        return MultiPolyOut;
      }();

      /**
       * NOTE:  We must be careful not to change any segments while
       *        they are in the SplayTree. AFAIK, there's no way to tell
       *        the tree to rebalance itself - thus before splitting
       *        a segment that's in the tree, we remove it from the tree,
       *        do the split, then re-insert it. (Even though splitting a
       *        segment *shouldn't* change its correct position in the
       *        sweep line tree, the reality is because of rounding errors,
       *        it sometimes does.)
       */

      var SweepLine = /*#__PURE__*/function () {
        function SweepLine(queue) {
          var comparator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Segment.compare;

          _classCallCheck(this, SweepLine);

          this.queue = queue;
          this.tree = new Tree(comparator);
          this.segments = [];
        }

        _createClass(SweepLine, [{
          key: "process",
          value: function process(event) {
            var segment = event.segment;
            var newEvents = []; // if we've already been consumed by another segment,
            // clean up our body parts and get out

            if (event.consumedBy) {
              if (event.isLeft) this.queue.remove(event.otherSE);else this.tree.remove(segment);
              return newEvents;
            }

            var node = event.isLeft ? this.tree.insert(segment) : this.tree.find(segment);
            if (!node) throw new Error("Unable to find segment #".concat(segment.id, " ") + "[".concat(segment.leftSE.point.x, ", ").concat(segment.leftSE.point.y, "] -> ") + "[".concat(segment.rightSE.point.x, ", ").concat(segment.rightSE.point.y, "] ") + 'in SweepLine tree. Please submit a bug report.');
            var prevNode = node;
            var nextNode = node;
            var prevSeg = undefined;
            var nextSeg = undefined; // skip consumed segments still in tree

            while (prevSeg === undefined) {
              prevNode = this.tree.prev(prevNode);
              if (prevNode === null) prevSeg = null;else if (prevNode.key.consumedBy === undefined) prevSeg = prevNode.key;
            } // skip consumed segments still in tree


            while (nextSeg === undefined) {
              nextNode = this.tree.next(nextNode);
              if (nextNode === null) nextSeg = null;else if (nextNode.key.consumedBy === undefined) nextSeg = nextNode.key;
            }

            if (event.isLeft) {
              // Check for intersections against the previous segment in the sweep line
              var prevMySplitter = null;

              if (prevSeg) {
                var prevInter = prevSeg.getIntersection(segment);

                if (prevInter !== null) {
                  if (!segment.isAnEndpoint(prevInter)) prevMySplitter = prevInter;

                  if (!prevSeg.isAnEndpoint(prevInter)) {
                    var newEventsFromSplit = this._splitSafely(prevSeg, prevInter);

                    for (var i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                      newEvents.push(newEventsFromSplit[i]);
                    }
                  }
                }
              } // Check for intersections against the next segment in the sweep line


              var nextMySplitter = null;

              if (nextSeg) {
                var nextInter = nextSeg.getIntersection(segment);

                if (nextInter !== null) {
                  if (!segment.isAnEndpoint(nextInter)) nextMySplitter = nextInter;

                  if (!nextSeg.isAnEndpoint(nextInter)) {
                    var _newEventsFromSplit = this._splitSafely(nextSeg, nextInter);

                    for (var _i = 0, _iMax = _newEventsFromSplit.length; _i < _iMax; _i++) {
                      newEvents.push(_newEventsFromSplit[_i]);
                    }
                  }
                }
              } // For simplicity, even if we find more than one intersection we only
              // spilt on the 'earliest' (sweep-line style) of the intersections.
              // The other intersection will be handled in a future process().


              if (prevMySplitter !== null || nextMySplitter !== null) {
                var mySplitter = null;
                if (prevMySplitter === null) mySplitter = nextMySplitter;else if (nextMySplitter === null) mySplitter = prevMySplitter;else {
                  var cmpSplitters = SweepEvent.comparePoints(prevMySplitter, nextMySplitter);
                  mySplitter = cmpSplitters <= 0 ? prevMySplitter : nextMySplitter;
                } // Rounding errors can cause changes in ordering,
                // so remove afected segments and right sweep events before splitting

                this.queue.remove(segment.rightSE);
                newEvents.push(segment.rightSE);

                var _newEventsFromSplit2 = segment.split(mySplitter);

                for (var _i2 = 0, _iMax2 = _newEventsFromSplit2.length; _i2 < _iMax2; _i2++) {
                  newEvents.push(_newEventsFromSplit2[_i2]);
                }
              }

              if (newEvents.length > 0) {
                // We found some intersections, so re-do the current event to
                // make sure sweep line ordering is totally consistent for later
                // use with the segment 'prev' pointers
                this.tree.remove(segment);
                newEvents.push(event);
              } else {
                // done with left event
                this.segments.push(segment);
                segment.prev = prevSeg;
              }
            } else {
              // event.isRight
              // since we're about to be removed from the sweep line, check for
              // intersections between our previous and next segments
              if (prevSeg && nextSeg) {
                var inter = prevSeg.getIntersection(nextSeg);

                if (inter !== null) {
                  if (!prevSeg.isAnEndpoint(inter)) {
                    var _newEventsFromSplit3 = this._splitSafely(prevSeg, inter);

                    for (var _i3 = 0, _iMax3 = _newEventsFromSplit3.length; _i3 < _iMax3; _i3++) {
                      newEvents.push(_newEventsFromSplit3[_i3]);
                    }
                  }

                  if (!nextSeg.isAnEndpoint(inter)) {
                    var _newEventsFromSplit4 = this._splitSafely(nextSeg, inter);

                    for (var _i4 = 0, _iMax4 = _newEventsFromSplit4.length; _i4 < _iMax4; _i4++) {
                      newEvents.push(_newEventsFromSplit4[_i4]);
                    }
                  }
                }
              }

              this.tree.remove(segment);
            }

            return newEvents;
          }
          /* Safely split a segment that is currently in the datastructures
           * IE - a segment other than the one that is currently being processed. */

        }, {
          key: "_splitSafely",
          value: function _splitSafely(seg, pt) {
            // Rounding errors can cause changes in ordering,
            // so remove afected segments and right sweep events before splitting
            // removeNode() doesn't work, so have re-find the seg
            // https://github.com/w8r/splay-tree/pull/5
            this.tree.remove(seg);
            var rightSE = seg.rightSE;
            this.queue.remove(rightSE);
            var newEvents = seg.split(pt);
            newEvents.push(rightSE); // splitting can trigger consumption

            if (seg.consumedBy === undefined) this.tree.insert(seg);
            return newEvents;
          }
        }]);

        return SweepLine;
      }();

      var POLYGON_CLIPPING_MAX_QUEUE_SIZE = typeof process !== 'undefined' && process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE || 1000000;
      var POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS = typeof process !== 'undefined' && process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS || 1000000;
      var Operation = /*#__PURE__*/function () {
        function Operation() {
          _classCallCheck(this, Operation);
        }

        _createClass(Operation, [{
          key: "run",
          value: function run(type, geom, moreGeoms) {
            operation.type = type;
            rounder.reset();
            /* Convert inputs to MultiPoly objects */

            var multipolys = [new MultiPolyIn(geom, true)];

            for (var i = 0, iMax = moreGeoms.length; i < iMax; i++) {
              multipolys.push(new MultiPolyIn(moreGeoms[i], false));
            }

            operation.numMultiPolys = multipolys.length;
            /* BBox optimization for difference operation
             * If the bbox of a multipolygon that's part of the clipping doesn't
             * intersect the bbox of the subject at all, we can just drop that
             * multiploygon. */

            if (operation.type === 'difference') {
              // in place removal
              var subject = multipolys[0];
              var _i = 1;

              while (_i < multipolys.length) {
                if (getBboxOverlap(multipolys[_i].bbox, subject.bbox) !== null) _i++;else multipolys.splice(_i, 1);
              }
            }
            /* BBox optimization for intersection operation
             * If we can find any pair of multipolygons whose bbox does not overlap,
             * then the result will be empty. */


            if (operation.type === 'intersection') {
              // TODO: this is O(n^2) in number of polygons. By sorting the bboxes,
              //       it could be optimized to O(n * ln(n))
              for (var _i2 = 0, _iMax = multipolys.length; _i2 < _iMax; _i2++) {
                var mpA = multipolys[_i2];

                for (var j = _i2 + 1, jMax = multipolys.length; j < jMax; j++) {
                  if (getBboxOverlap(mpA.bbox, multipolys[j].bbox) === null) return [];
                }
              }
            }
            /* Put segment endpoints in a priority queue */


            var queue = new Tree(SweepEvent.compare);

            for (var _i3 = 0, _iMax2 = multipolys.length; _i3 < _iMax2; _i3++) {
              var sweepEvents = multipolys[_i3].getSweepEvents();

              for (var _j = 0, _jMax = sweepEvents.length; _j < _jMax; _j++) {
                queue.insert(sweepEvents[_j]);

                if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
                  // prevents an infinite loop, an otherwise common manifestation of bugs
                  throw new Error('Infinite loop when putting segment endpoints in a priority queue ' + '(queue size too big). Please file a bug report.');
                }
              }
            }
            /* Pass the sweep line over those endpoints */


            var sweepLine = new SweepLine(queue);
            var prevQueueSize = queue.size;
            var node = queue.pop();

            while (node) {
              var evt = node.key;

              if (queue.size === prevQueueSize) {
                // prevents an infinite loop, an otherwise common manifestation of bugs
                var seg = evt.segment;
                throw new Error("Unable to pop() ".concat(evt.isLeft ? 'left' : 'right', " SweepEvent ") + "[".concat(evt.point.x, ", ").concat(evt.point.y, "] from segment #").concat(seg.id, " ") + "[".concat(seg.leftSE.point.x, ", ").concat(seg.leftSE.point.y, "] -> ") + "[".concat(seg.rightSE.point.x, ", ").concat(seg.rightSE.point.y, "] from queue. ") + 'Please file a bug report.');
              }

              if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
                // prevents an infinite loop, an otherwise common manifestation of bugs
                throw new Error('Infinite loop when passing sweep line over endpoints ' + '(queue size too big). Please file a bug report.');
              }

              if (sweepLine.segments.length > POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS) {
                // prevents an infinite loop, an otherwise common manifestation of bugs
                throw new Error('Infinite loop when passing sweep line over endpoints ' + '(too many sweep line segments). Please file a bug report.');
              }

              var newEvents = sweepLine.process(evt);

              for (var _i4 = 0, _iMax3 = newEvents.length; _i4 < _iMax3; _i4++) {
                var _evt = newEvents[_i4];
                if (_evt.consumedBy === undefined) queue.insert(_evt);
              }

              prevQueueSize = queue.size;
              node = queue.pop();
            } // free some memory we don't need anymore


            rounder.reset();
            /* Collect and compile segments we're keeping into a multipolygon */

            var ringsOut = RingOut.factory(sweepLine.segments);
            var result = new MultiPolyOut(ringsOut);
            return result.getGeom();
          }
        }]);

        return Operation;
      }(); // singleton available by import

      var operation = new Operation();

      var union = function union(geom) {
        for (var _len = arguments.length, moreGeoms = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          moreGeoms[_key - 1] = arguments[_key];
        }

        return operation.run('union', geom, moreGeoms);
      };

      var intersection$1 = function intersection(geom) {
        for (var _len2 = arguments.length, moreGeoms = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          moreGeoms[_key2 - 1] = arguments[_key2];
        }

        return operation.run('intersection', geom, moreGeoms);
      };

      var xor = function xor(geom) {
        for (var _len3 = arguments.length, moreGeoms = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          moreGeoms[_key3 - 1] = arguments[_key3];
        }

        return operation.run('xor', geom, moreGeoms);
      };

      var difference = function difference(subjectGeom) {
        for (var _len4 = arguments.length, clippingGeoms = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          clippingGeoms[_key4 - 1] = arguments[_key4];
        }

        return operation.run('difference', subjectGeom, clippingGeoms);
      };

      var index = {
        union: union,
        intersection: intersection$1,
        xor: xor,
        difference: difference
      };

      return index;

    })));
    });

    var invariant = js$g;

    var __importDefault$5 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };



    var polygon_clipping_1 = __importDefault$5(polygonClipping_umd);
    /**
     * Takes two {@link Polygon|polygon} or {@link MultiPolygon|multi-polygon} geometries and
     * finds their polygonal intersection. If they don't intersect, returns null.
     *
     * @name intersect
     * @param {Feature<Polygon | MultiPolygon>} poly1 the first polygon or multipolygon
     * @param {Feature<Polygon | MultiPolygon>} poly2 the second polygon or multipolygon
     * @param {Object} [options={}] Optional Parameters
     * @param {Object} [options.properties={}] Translate GeoJSON Properties to Feature
     * @returns {Feature|null} returns a feature representing the area they share (either a {@link Polygon} or
     * {@link MultiPolygon}). If they do not share any area, returns `null`.
     * @example
     * var poly1 = turf.polygon([[
     *   [-122.801742, 45.48565],
     *   [-122.801742, 45.60491],
     *   [-122.584762, 45.60491],
     *   [-122.584762, 45.48565],
     *   [-122.801742, 45.48565]
     * ]]);
     *
     * var poly2 = turf.polygon([[
     *   [-122.520217, 45.535693],
     *   [-122.64038, 45.553967],
     *   [-122.720031, 45.526554],
     *   [-122.669906, 45.507309],
     *   [-122.723464, 45.446643],
     *   [-122.532577, 45.408574],
     *   [-122.487258, 45.477466],
     *   [-122.520217, 45.535693]
     * ]]);
     *
     * var intersection = turf.intersect(poly1, poly2);
     *
     * //addToMap
     * var addToMap = [poly1, poly2, intersection];
     */
    function intersect(poly1, poly2, options) {
        if (options === void 0) { options = {}; }
        var geom1 = invariant.getGeom(poly1);
        var geom2 = invariant.getGeom(poly2);
        var intersection = polygon_clipping_1.default.intersection(geom1.coordinates, geom2.coordinates);
        if (intersection.length === 0)
            return null;
        if (intersection.length === 1)
            return require$$0$3.polygon(intersection[0], options.properties);
        return require$$0$3.multiPolygon(intersection, options.properties);
    }
    var _default$g = intersect;

    var js$f = /*#__PURE__*/Object.defineProperty({
    	default: _default$g
    }, '__esModule', {value: true});

    var rbush_min = createCommonjsModule(function (module, exports) {
    !function(t,i){module.exports=i();}(commonjsGlobal,function(){function t(t,r,e,a,h){!function t(n,r,e,a,h){for(;a>e;){if(a-e>600){var o=a-e+1,s=r-e+1,l=Math.log(o),f=.5*Math.exp(2*l/3),u=.5*Math.sqrt(l*f*(o-f)/o)*(s-o/2<0?-1:1),m=Math.max(e,Math.floor(r-s*f/o+u)),c=Math.min(a,Math.floor(r+(o-s)*f/o+u));t(n,r,m,c,h);}var p=n[r],d=e,x=a;for(i(n,e,r),h(n[a],p)>0&&i(n,e,a);d<x;){for(i(n,d,x),d++,x--;h(n[d],p)<0;)d++;for(;h(n[x],p)>0;)x--;}0===h(n[e],p)?i(n,e,x):i(n,++x,a),x<=r&&(e=x+1),r<=x&&(a=x-1);}}(t,r,e||0,a||t.length-1,h||n);}function i(t,i,n){var r=t[i];t[i]=t[n],t[n]=r;}function n(t,i){return t<i?-1:t>i?1:0}var r=function(t){void 0===t&&(t=9),this._maxEntries=Math.max(4,t),this._minEntries=Math.max(2,Math.ceil(.4*this._maxEntries)),this.clear();};function e(t,i,n){if(!n)return i.indexOf(t);for(var r=0;r<i.length;r++)if(n(t,i[r]))return r;return -1}function a(t,i){h(t,0,t.children.length,i,t);}function h(t,i,n,r,e){e||(e=p(null)),e.minX=1/0,e.minY=1/0,e.maxX=-1/0,e.maxY=-1/0;for(var a=i;a<n;a++){var h=t.children[a];o(e,t.leaf?r(h):h);}return e}function o(t,i){return t.minX=Math.min(t.minX,i.minX),t.minY=Math.min(t.minY,i.minY),t.maxX=Math.max(t.maxX,i.maxX),t.maxY=Math.max(t.maxY,i.maxY),t}function s(t,i){return t.minX-i.minX}function l(t,i){return t.minY-i.minY}function f(t){return (t.maxX-t.minX)*(t.maxY-t.minY)}function u(t){return t.maxX-t.minX+(t.maxY-t.minY)}function m(t,i){return t.minX<=i.minX&&t.minY<=i.minY&&i.maxX<=t.maxX&&i.maxY<=t.maxY}function c(t,i){return i.minX<=t.maxX&&i.minY<=t.maxY&&i.maxX>=t.minX&&i.maxY>=t.minY}function p(t){return {children:t,height:1,leaf:!0,minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0}}function d(i,n,r,e,a){for(var h=[n,r];h.length;)if(!((r=h.pop())-(n=h.pop())<=e)){var o=n+Math.ceil((r-n)/e/2)*e;t(i,o,n,r,a),h.push(n,o,o,r);}}return r.prototype.all=function(){return this._all(this.data,[])},r.prototype.search=function(t){var i=this.data,n=[];if(!c(t,i))return n;for(var r=this.toBBox,e=[];i;){for(var a=0;a<i.children.length;a++){var h=i.children[a],o=i.leaf?r(h):h;c(t,o)&&(i.leaf?n.push(h):m(t,o)?this._all(h,n):e.push(h));}i=e.pop();}return n},r.prototype.collides=function(t){var i=this.data;if(!c(t,i))return !1;for(var n=[];i;){for(var r=0;r<i.children.length;r++){var e=i.children[r],a=i.leaf?this.toBBox(e):e;if(c(t,a)){if(i.leaf||m(t,a))return !0;n.push(e);}}i=n.pop();}return !1},r.prototype.load=function(t){if(!t||!t.length)return this;if(t.length<this._minEntries){for(var i=0;i<t.length;i++)this.insert(t[i]);return this}var n=this._build(t.slice(),0,t.length-1,0);if(this.data.children.length)if(this.data.height===n.height)this._splitRoot(this.data,n);else {if(this.data.height<n.height){var r=this.data;this.data=n,n=r;}this._insert(n,this.data.height-n.height-1,!0);}else this.data=n;return this},r.prototype.insert=function(t){return t&&this._insert(t,this.data.height-1),this},r.prototype.clear=function(){return this.data=p([]),this},r.prototype.remove=function(t,i){if(!t)return this;for(var n,r,a,h=this.data,o=this.toBBox(t),s=[],l=[];h||s.length;){if(h||(h=s.pop(),r=s[s.length-1],n=l.pop(),a=!0),h.leaf){var f=e(t,h.children,i);if(-1!==f)return h.children.splice(f,1),s.push(h),this._condense(s),this}a||h.leaf||!m(h,o)?r?(n++,h=r.children[n],a=!1):h=null:(s.push(h),l.push(n),n=0,r=h,h=h.children[0]);}return this},r.prototype.toBBox=function(t){return t},r.prototype.compareMinX=function(t,i){return t.minX-i.minX},r.prototype.compareMinY=function(t,i){return t.minY-i.minY},r.prototype.toJSON=function(){return this.data},r.prototype.fromJSON=function(t){return this.data=t,this},r.prototype._all=function(t,i){for(var n=[];t;)t.leaf?i.push.apply(i,t.children):n.push.apply(n,t.children),t=n.pop();return i},r.prototype._build=function(t,i,n,r){var e,h=n-i+1,o=this._maxEntries;if(h<=o)return a(e=p(t.slice(i,n+1)),this.toBBox),e;r||(r=Math.ceil(Math.log(h)/Math.log(o)),o=Math.ceil(h/Math.pow(o,r-1))),(e=p([])).leaf=!1,e.height=r;var s=Math.ceil(h/o),l=s*Math.ceil(Math.sqrt(o));d(t,i,n,l,this.compareMinX);for(var f=i;f<=n;f+=l){var u=Math.min(f+l-1,n);d(t,f,u,s,this.compareMinY);for(var m=f;m<=u;m+=s){var c=Math.min(m+s-1,u);e.children.push(this._build(t,m,c,r-1));}}return a(e,this.toBBox),e},r.prototype._chooseSubtree=function(t,i,n,r){for(;r.push(i),!i.leaf&&r.length-1!==n;){for(var e=1/0,a=1/0,h=void 0,o=0;o<i.children.length;o++){var s=i.children[o],l=f(s),u=(m=t,c=s,(Math.max(c.maxX,m.maxX)-Math.min(c.minX,m.minX))*(Math.max(c.maxY,m.maxY)-Math.min(c.minY,m.minY))-l);u<a?(a=u,e=l<e?l:e,h=s):u===a&&l<e&&(e=l,h=s);}i=h||i.children[0];}var m,c;return i},r.prototype._insert=function(t,i,n){var r=n?t:this.toBBox(t),e=[],a=this._chooseSubtree(r,this.data,i,e);for(a.children.push(t),o(a,r);i>=0&&e[i].children.length>this._maxEntries;)this._split(e,i),i--;this._adjustParentBBoxes(r,e,i);},r.prototype._split=function(t,i){var n=t[i],r=n.children.length,e=this._minEntries;this._chooseSplitAxis(n,e,r);var h=this._chooseSplitIndex(n,e,r),o=p(n.children.splice(h,n.children.length-h));o.height=n.height,o.leaf=n.leaf,a(n,this.toBBox),a(o,this.toBBox),i?t[i-1].children.push(o):this._splitRoot(n,o);},r.prototype._splitRoot=function(t,i){this.data=p([t,i]),this.data.height=t.height+1,this.data.leaf=!1,a(this.data,this.toBBox);},r.prototype._chooseSplitIndex=function(t,i,n){for(var r,e,a,o,s,l,u,m=1/0,c=1/0,p=i;p<=n-i;p++){var d=h(t,0,p,this.toBBox),x=h(t,p,n,this.toBBox),v=(e=d,a=x,o=void 0,s=void 0,l=void 0,u=void 0,o=Math.max(e.minX,a.minX),s=Math.max(e.minY,a.minY),l=Math.min(e.maxX,a.maxX),u=Math.min(e.maxY,a.maxY),Math.max(0,l-o)*Math.max(0,u-s)),M=f(d)+f(x);v<m?(m=v,r=p,c=M<c?M:c):v===m&&M<c&&(c=M,r=p);}return r||n-i},r.prototype._chooseSplitAxis=function(t,i,n){var r=t.leaf?this.compareMinX:s,e=t.leaf?this.compareMinY:l;this._allDistMargin(t,i,n,r)<this._allDistMargin(t,i,n,e)&&t.children.sort(r);},r.prototype._allDistMargin=function(t,i,n,r){t.children.sort(r);for(var e=this.toBBox,a=h(t,0,i,e),s=h(t,n-i,n,e),l=u(a)+u(s),f=i;f<n-i;f++){var m=t.children[f];o(a,t.leaf?e(m):m),l+=u(a);}for(var c=n-i-1;c>=i;c--){var p=t.children[c];o(s,t.leaf?e(p):p),l+=u(s);}return l},r.prototype._adjustParentBBoxes=function(t,i,n){for(var r=n;r>=0;r--)o(i[r],t);},r.prototype._condense=function(t){for(var i=t.length-1,n=void 0;i>=0;i--)0===t[i].children.length?i>0?(n=t[i-1].children).splice(n.indexOf(t[i]),1):this.clear():a(t[i],this.toBBox);},r});
    });

    var turfBBox = require$$2$1.default;
    var featureEach = meta_1.featureEach;
    meta_1.coordEach;
    require$$0$3.polygon;
    var featureCollection = require$$0$3.featureCollection;

    /**
     * GeoJSON implementation of [RBush](https://github.com/mourner/rbush#rbush) spatial index.
     *
     * @name rbush
     * @param {number} [maxEntries=9] defines the maximum number of entries in a tree node. 9 (used by default) is a
     * reasonable choice for most applications. Higher value means faster insertion and slower search, and vice versa.
     * @returns {RBush} GeoJSON RBush
     * @example
     * var geojsonRbush = require('geojson-rbush').default;
     * var tree = geojsonRbush();
     */
    function geojsonRbush(maxEntries) {
        var tree = new rbush_min(maxEntries);
        /**
         * [insert](https://github.com/mourner/rbush#data-format)
         *
         * @param {Feature} feature insert single GeoJSON Feature
         * @returns {RBush} GeoJSON RBush
         * @example
         * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
         * tree.insert(poly)
         */
        tree.insert = function (feature) {
            if (feature.type !== 'Feature') throw new Error('invalid feature');
            feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
            return rbush_min.prototype.insert.call(this, feature);
        };

        /**
         * [load](https://github.com/mourner/rbush#bulk-inserting-data)
         *
         * @param {FeatureCollection|Array<Feature>} features load entire GeoJSON FeatureCollection
         * @returns {RBush} GeoJSON RBush
         * @example
         * var polys = turf.polygons([
         *     [[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]],
         *     [[[-93, 32], [-83, 32], [-83, 39], [-93, 39], [-93, 32]]]
         * ]);
         * tree.load(polys);
         */
        tree.load = function (features) {
            var load = [];
            // Load an Array of Features
            if (Array.isArray(features)) {
                features.forEach(function (feature) {
                    if (feature.type !== 'Feature') throw new Error('invalid features');
                    feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
                    load.push(feature);
                });
            } else {
                // Load a FeatureCollection
                featureEach(features, function (feature) {
                    if (feature.type !== 'Feature') throw new Error('invalid features');
                    feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
                    load.push(feature);
                });
            }
            return rbush_min.prototype.load.call(this, load);
        };

        /**
         * [remove](https://github.com/mourner/rbush#removing-data)
         *
         * @param {Feature} feature remove single GeoJSON Feature
         * @param {Function} equals Pass a custom equals function to compare by value for removal.
         * @returns {RBush} GeoJSON RBush
         * @example
         * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
         *
         * tree.remove(poly);
         */
        tree.remove = function (feature, equals) {
            if (feature.type !== 'Feature') throw new Error('invalid feature');
            feature.bbox = feature.bbox ? feature.bbox : turfBBox(feature);
            return rbush_min.prototype.remove.call(this, feature, equals);
        };

        /**
         * [clear](https://github.com/mourner/rbush#removing-data)
         *
         * @returns {RBush} GeoJSON Rbush
         * @example
         * tree.clear()
         */
        tree.clear = function () {
            return rbush_min.prototype.clear.call(this);
        };

        /**
         * [search](https://github.com/mourner/rbush#search)
         *
         * @param {BBox|FeatureCollection|Feature} geojson search with GeoJSON
         * @returns {FeatureCollection} all features that intersects with the given GeoJSON.
         * @example
         * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
         *
         * tree.search(poly);
         */
        tree.search = function (geojson) {
            var features = rbush_min.prototype.search.call(this, this.toBBox(geojson));
            return featureCollection(features);
        };

        /**
         * [collides](https://github.com/mourner/rbush#collisions)
         *
         * @param {BBox|FeatureCollection|Feature} geojson collides with GeoJSON
         * @returns {boolean} true if there are any items intersecting the given GeoJSON, otherwise false.
         * @example
         * var poly = turf.polygon([[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]);
         *
         * tree.collides(poly);
         */
        tree.collides = function (geojson) {
            return rbush_min.prototype.collides.call(this, this.toBBox(geojson));
        };

        /**
         * [all](https://github.com/mourner/rbush#search)
         *
         * @returns {FeatureCollection} all the features in RBush
         * @example
         * tree.all()
         */
        tree.all = function () {
            var features = rbush_min.prototype.all.call(this);
            return featureCollection(features);
        };

        /**
         * [toJSON](https://github.com/mourner/rbush#export-and-import)
         *
         * @returns {any} export data as JSON object
         * @example
         * var exported = tree.toJSON()
         */
        tree.toJSON = function () {
            return rbush_min.prototype.toJSON.call(this);
        };

        /**
         * [fromJSON](https://github.com/mourner/rbush#export-and-import)
         *
         * @param {any} json import previously exported data
         * @returns {RBush} GeoJSON RBush
         * @example
         * var exported = {
         *   "children": [
         *     {
         *       "type": "Feature",
         *       "geometry": {
         *         "type": "Point",
         *         "coordinates": [110, 50]
         *       },
         *       "properties": {},
         *       "bbox": [110, 50, 110, 50]
         *     }
         *   ],
         *   "height": 1,
         *   "leaf": true,
         *   "minX": 110,
         *   "minY": 50,
         *   "maxX": 110,
         *   "maxY": 50
         * }
         * tree.fromJSON(exported)
         */
        tree.fromJSON = function (json) {
            return rbush_min.prototype.fromJSON.call(this, json);
        };

        /**
         * Converts GeoJSON to {minX, minY, maxX, maxY} schema
         *
         * @private
         * @param {BBox|FeatureCollection|Feature} geojson feature(s) to retrieve BBox from
         * @returns {Object} converted to {minX, minY, maxX, maxY}
         */
        tree.toBBox = function (geojson) {
            var bbox;
            if (geojson.bbox) bbox = geojson.bbox;
            else if (Array.isArray(geojson) && geojson.length === 4) bbox = geojson;
            else if (Array.isArray(geojson) && geojson.length === 6) bbox = [geojson[0], geojson[1], geojson[3], geojson[4]];
            else if (geojson.type === 'Feature') bbox = turfBBox(geojson);
            else if (geojson.type === 'FeatureCollection') bbox = turfBBox(geojson);
            else throw new Error('invalid geojson')

            return {
                minX: bbox[0],
                minY: bbox[1],
                maxX: bbox[2],
                maxY: bbox[3]
            };
        };
        return tree;
    }

    var geojsonRbush_1 = geojsonRbush;
    var _default$f = geojsonRbush;
    geojsonRbush_1.default = _default$f;

    /**
     * Creates a {@link FeatureCollection} of 2-vertex {@link LineString} segments from a
     * {@link LineString|(Multi)LineString} or {@link Polygon|(Multi)Polygon}.
     *
     * @name lineSegment
     * @param {GeoJSON} geojson GeoJSON Polygon or LineString
     * @returns {FeatureCollection<LineString>} 2-vertex line segments
     * @example
     * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
     * var segments = turf.lineSegment(polygon);
     *
     * //addToMap
     * var addToMap = [polygon, segments]
     */
    function lineSegment$1(geojson) {
        if (!geojson) {
            throw new Error("geojson is required");
        }
        var results = [];
        meta_1.flattenEach(geojson, function (feature) {
            lineSegmentFeature(feature, results);
        });
        return require$$0$3.featureCollection(results);
    }
    /**
     * Line Segment
     *
     * @private
     * @param {Feature<LineString|Polygon>} geojson Line or polygon feature
     * @param {Array} results push to results
     * @returns {void}
     */
    function lineSegmentFeature(geojson, results) {
        var coords = [];
        var geometry = geojson.geometry;
        if (geometry !== null) {
            switch (geometry.type) {
                case "Polygon":
                    coords = invariant.getCoords(geometry);
                    break;
                case "LineString":
                    coords = [invariant.getCoords(geometry)];
            }
            coords.forEach(function (coord) {
                var segments = createSegments(coord, geojson.properties);
                segments.forEach(function (segment) {
                    segment.id = results.length;
                    results.push(segment);
                });
            });
        }
    }
    /**
     * Create Segments from LineString coordinates
     *
     * @private
     * @param {Array<Array<number>>} coords LineString coordinates
     * @param {*} properties GeoJSON properties
     * @returns {Array<Feature<LineString>>} line segments
     */
    function createSegments(coords, properties) {
        var segments = [];
        coords.reduce(function (previousCoords, currentCoords) {
            var segment = require$$0$3.lineString([previousCoords, currentCoords], properties);
            segment.bbox = bbox(previousCoords, currentCoords);
            segments.push(segment);
            return currentCoords;
        });
        return segments;
    }
    /**
     * Create BBox between two coordinates (faster than @turf/bbox)
     *
     * @private
     * @param {Array<number>} coords1 Point coordinate
     * @param {Array<number>} coords2 Point coordinate
     * @returns {BBox} [west, south, east, north]
     */
    function bbox(coords1, coords2) {
        var x1 = coords1[0];
        var y1 = coords1[1];
        var x2 = coords2[0];
        var y2 = coords2[1];
        var west = x1 < x2 ? x1 : x2;
        var south = y1 < y2 ? y1 : y2;
        var east = x1 > x2 ? x1 : x2;
        var north = y1 > y2 ? y1 : y2;
        return [west, south, east, north];
    }
    var _default$e = lineSegment$1;

    var js$e = /*#__PURE__*/Object.defineProperty({
    	default: _default$e
    }, '__esModule', {value: true});

    // http://en.wikipedia.org/wiki/Haversine_formula
    // http://www.movable-type.co.uk/scripts/latlong.html
    /**
     * Takes two {@link Point|points} and finds the geographic bearing between them,
     * i.e. the angle measured in degrees from the north line (0 degrees)
     *
     * @name bearing
     * @param {Coord} start starting Point
     * @param {Coord} end ending Point
     * @param {Object} [options={}] Optional parameters
     * @param {boolean} [options.final=false] calculates the final bearing if true
     * @returns {number} bearing in decimal degrees, between -180 and 180 degrees (positive clockwise)
     * @example
     * var point1 = turf.point([-75.343, 39.984]);
     * var point2 = turf.point([-75.534, 39.123]);
     *
     * var bearing = turf.bearing(point1, point2);
     *
     * //addToMap
     * var addToMap = [point1, point2]
     * point1.properties['marker-color'] = '#f00'
     * point2.properties['marker-color'] = '#0f0'
     * point1.properties.bearing = bearing
     */
    function bearing(start, end, options) {
        if (options === void 0) { options = {}; }
        // Reverse calculation
        if (options.final === true) {
            return calculateFinalBearing(start, end);
        }
        var coordinates1 = invariant.getCoord(start);
        var coordinates2 = invariant.getCoord(end);
        var lon1 = require$$0$3.degreesToRadians(coordinates1[0]);
        var lon2 = require$$0$3.degreesToRadians(coordinates2[0]);
        var lat1 = require$$0$3.degreesToRadians(coordinates1[1]);
        var lat2 = require$$0$3.degreesToRadians(coordinates2[1]);
        var a = Math.sin(lon2 - lon1) * Math.cos(lat2);
        var b = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        return require$$0$3.radiansToDegrees(Math.atan2(a, b));
    }
    var _default$d = bearing;
    /**
     * Calculates Final Bearing
     *
     * @private
     * @param {Coord} start starting Point
     * @param {Coord} end ending Point
     * @returns {number} bearing
     */
    function calculateFinalBearing(start, end) {
        // Swap start & end
        var bear = bearing(end, start);
        bear = (bear + 180) % 360;
        return bear;
    }

    var js$d = /*#__PURE__*/Object.defineProperty({
    	default: _default$d
    }, '__esModule', {value: true});

    //http://en.wikipedia.org/wiki/Haversine_formula
    //http://www.movable-type.co.uk/scripts/latlong.html
    /**
     * Calculates the distance between two {@link Point|points} in degrees, radians, miles, or kilometers.
     * This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula) to account for global curvature.
     *
     * @name distance
     * @param {Coord | Point} from origin point or coordinate
     * @param {Coord | Point} to destination point or coordinate
     * @param {Object} [options={}] Optional parameters
     * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
     * @returns {number} distance between the two points
     * @example
     * var from = turf.point([-75.343, 39.984]);
     * var to = turf.point([-75.534, 39.123]);
     * var options = {units: 'miles'};
     *
     * var distance = turf.distance(from, to, options);
     *
     * //addToMap
     * var addToMap = [from, to];
     * from.properties.distance = distance;
     * to.properties.distance = distance;
     */
    function distance$1(from, to, options) {
        if (options === void 0) { options = {}; }
        var coordinates1 = invariant.getCoord(from);
        var coordinates2 = invariant.getCoord(to);
        var dLat = require$$0$3.degreesToRadians(coordinates2[1] - coordinates1[1]);
        var dLon = require$$0$3.degreesToRadians(coordinates2[0] - coordinates1[0]);
        var lat1 = require$$0$3.degreesToRadians(coordinates1[1]);
        var lat2 = require$$0$3.degreesToRadians(coordinates2[1]);
        var a = Math.pow(Math.sin(dLat / 2), 2) +
            Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
        return require$$0$3.radiansToLength(2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), options.units);
    }
    var _default$c = distance$1;

    var js$c = /*#__PURE__*/Object.defineProperty({
    	default: _default$c
    }, '__esModule', {value: true});

    // http://en.wikipedia.org/wiki/Haversine_formula
    // http://www.movable-type.co.uk/scripts/latlong.html


    /**
     * Takes a {@link Point} and calculates the location of a destination point given a distance in
     * degrees, radians, miles, or kilometers; and bearing in degrees.
     * This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula) to account for global curvature.
     *
     * @name destination
     * @param {Coord} origin starting point
     * @param {number} distance distance from the origin point
     * @param {number} bearing ranging from -180 to 180
     * @param {Object} [options={}] Optional parameters
     * @param {string} [options.units='kilometers'] miles, kilometers, degrees, or radians
     * @param {Object} [options.properties={}] Translate properties to Point
     * @returns {Feature<Point>} destination point
     * @example
     * var point = turf.point([-75.343, 39.984]);
     * var distance = 50;
     * var bearing = 90;
     * var options = {units: 'miles'};
     *
     * var destination = turf.destination(point, distance, bearing, options);
     *
     * //addToMap
     * var addToMap = [point, destination]
     * destination.properties['marker-color'] = '#f00';
     * point.properties['marker-color'] = '#0f0';
     */
    function destination(origin, distance, bearing, options) {
        if (options === void 0) { options = {}; }
        // Handle input
        var coordinates1 = invariant.getCoord(origin);
        var longitude1 = require$$0$3.degreesToRadians(coordinates1[0]);
        var latitude1 = require$$0$3.degreesToRadians(coordinates1[1]);
        var bearingRad = require$$0$3.degreesToRadians(bearing);
        var radians = require$$0$3.lengthToRadians(distance, options.units);
        // Main
        var latitude2 = Math.asin(Math.sin(latitude1) * Math.cos(radians) +
            Math.cos(latitude1) * Math.sin(radians) * Math.cos(bearingRad));
        var longitude2 = longitude1 +
            Math.atan2(Math.sin(bearingRad) * Math.sin(radians) * Math.cos(latitude1), Math.cos(radians) - Math.sin(latitude1) * Math.sin(latitude2));
        var lng = require$$0$3.radiansToDegrees(longitude2);
        var lat = require$$0$3.radiansToDegrees(latitude2);
        return require$$0$3.point([lng, lat], options.properties);
    }
    var _default$b = destination;

    var js$b = /*#__PURE__*/Object.defineProperty({
    	default: _default$b
    }, '__esModule', {value: true});

    var lineSegment = js$e;

    var __importDefault$4 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };



    var line_segment_1$1 = __importDefault$4(lineSegment);

    var geojson_rbush_1$1 = __importDefault$4(geojsonRbush_1);
    /**
     * Takes any LineString or Polygon GeoJSON and returns the intersecting point(s).
     *
     * @name lineIntersect
     * @param {GeoJSON} line1 any LineString or Polygon
     * @param {GeoJSON} line2 any LineString or Polygon
     * @returns {FeatureCollection<Point>} point(s) that intersect both
     * @example
     * var line1 = turf.lineString([[126, -11], [129, -21]]);
     * var line2 = turf.lineString([[123, -18], [131, -14]]);
     * var intersects = turf.lineIntersect(line1, line2);
     *
     * //addToMap
     * var addToMap = [line1, line2, intersects]
     */
    function lineIntersect$1(line1, line2) {
        var unique = {};
        var results = [];
        // First, normalize geometries to features
        // Then, handle simple 2-vertex segments
        if (line1.type === "LineString") {
            line1 = require$$0$3.feature(line1);
        }
        if (line2.type === "LineString") {
            line2 = require$$0$3.feature(line2);
        }
        if (line1.type === "Feature" &&
            line2.type === "Feature" &&
            line1.geometry !== null &&
            line2.geometry !== null &&
            line1.geometry.type === "LineString" &&
            line2.geometry.type === "LineString" &&
            line1.geometry.coordinates.length === 2 &&
            line2.geometry.coordinates.length === 2) {
            var intersect = intersects(line1, line2);
            if (intersect) {
                results.push(intersect);
            }
            return require$$0$3.featureCollection(results);
        }
        // Handles complex GeoJSON Geometries
        var tree = geojson_rbush_1$1.default();
        tree.load(line_segment_1$1.default(line2));
        meta_1.featureEach(line_segment_1$1.default(line1), function (segment) {
            meta_1.featureEach(tree.search(segment), function (match) {
                var intersect = intersects(segment, match);
                if (intersect) {
                    // prevent duplicate points https://github.com/Turfjs/turf/issues/688
                    var key = invariant.getCoords(intersect).join(",");
                    if (!unique[key]) {
                        unique[key] = true;
                        results.push(intersect);
                    }
                }
            });
        });
        return require$$0$3.featureCollection(results);
    }
    /**
     * Find a point that intersects LineStrings with two coordinates each
     *
     * @private
     * @param {Feature<LineString>} line1 GeoJSON LineString (Must only contain 2 coordinates)
     * @param {Feature<LineString>} line2 GeoJSON LineString (Must only contain 2 coordinates)
     * @returns {Feature<Point>} intersecting GeoJSON Point
     */
    function intersects(line1, line2) {
        var coords1 = invariant.getCoords(line1);
        var coords2 = invariant.getCoords(line2);
        if (coords1.length !== 2) {
            throw new Error("<intersects> line1 must only contain 2 coordinates");
        }
        if (coords2.length !== 2) {
            throw new Error("<intersects> line2 must only contain 2 coordinates");
        }
        var x1 = coords1[0][0];
        var y1 = coords1[0][1];
        var x2 = coords1[1][0];
        var y2 = coords1[1][1];
        var x3 = coords2[0][0];
        var y3 = coords2[0][1];
        var x4 = coords2[1][0];
        var y4 = coords2[1][1];
        var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        var numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
        var numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
        if (denom === 0) {
            if (numeA === 0 && numeB === 0) {
                return null;
            }
            return null;
        }
        var uA = numeA / denom;
        var uB = numeB / denom;
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            var x = x1 + uA * (x2 - x1);
            var y = y1 + uA * (y2 - y1);
            return require$$0$3.point([x, y]);
        }
        return null;
    }
    var _default$a = lineIntersect$1;

    var js$a = /*#__PURE__*/Object.defineProperty({
    	default: _default$a
    }, '__esModule', {value: true});

    var require$$0$2 = js$d;

    var distance = js$c;

    var require$$2 = js$b;

    var lineIntersect = js$a;

    var __importDefault$3 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    var bearing_1 = __importDefault$3(require$$0$2);
    var distance_1 = __importDefault$3(distance);
    var destination_1 = __importDefault$3(require$$2);
    var line_intersect_1$1 = __importDefault$3(lineIntersect);



    /**
     * Takes a {@link Point} and a {@link LineString} and calculates the closest Point on the (Multi)LineString.
     *
     * @name nearestPointOnLine
     * @param {Geometry|Feature<LineString|MultiLineString>} lines lines to snap to
     * @param {Geometry|Feature<Point>|number[]} pt point to snap from
     * @param {Object} [options={}] Optional parameters
     * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
     * @returns {Feature<Point>} closest point on the `line` to `point`. The properties object will contain three values: `index`: closest point was found on nth line part, `dist`: distance between pt and the closest point, `location`: distance along the line between start and the closest point.
     * @example
     * var line = turf.lineString([
     *     [-77.031669, 38.878605],
     *     [-77.029609, 38.881946],
     *     [-77.020339, 38.884084],
     *     [-77.025661, 38.885821],
     *     [-77.021884, 38.889563],
     *     [-77.019824, 38.892368]
     * ]);
     * var pt = turf.point([-77.037076, 38.884017]);
     *
     * var snapped = turf.nearestPointOnLine(line, pt, {units: 'miles'});
     *
     * //addToMap
     * var addToMap = [line, pt, snapped];
     * snapped.properties['marker-color'] = '#00f';
     */
    function nearestPointOnLine$1(lines, pt, options) {
        if (options === void 0) { options = {}; }
        var closestPt = require$$0$3.point([Infinity, Infinity], {
            dist: Infinity,
        });
        var length = 0.0;
        meta_1.flattenEach(lines, function (line) {
            var coords = invariant.getCoords(line);
            for (var i = 0; i < coords.length - 1; i++) {
                //start
                var start = require$$0$3.point(coords[i]);
                start.properties.dist = distance_1.default(pt, start, options);
                //stop
                var stop_1 = require$$0$3.point(coords[i + 1]);
                stop_1.properties.dist = distance_1.default(pt, stop_1, options);
                // sectionLength
                var sectionLength = distance_1.default(start, stop_1, options);
                //perpendicular
                var heightDistance = Math.max(start.properties.dist, stop_1.properties.dist);
                var direction = bearing_1.default(start, stop_1);
                var perpendicularPt1 = destination_1.default(pt, heightDistance, direction + 90, options);
                var perpendicularPt2 = destination_1.default(pt, heightDistance, direction - 90, options);
                var intersect = line_intersect_1$1.default(require$$0$3.lineString([
                    perpendicularPt1.geometry.coordinates,
                    perpendicularPt2.geometry.coordinates,
                ]), require$$0$3.lineString([start.geometry.coordinates, stop_1.geometry.coordinates]));
                var intersectPt = null;
                if (intersect.features.length > 0) {
                    intersectPt = intersect.features[0];
                    intersectPt.properties.dist = distance_1.default(pt, intersectPt, options);
                    intersectPt.properties.location =
                        length + distance_1.default(start, intersectPt, options);
                }
                if (start.properties.dist < closestPt.properties.dist) {
                    closestPt = start;
                    closestPt.properties.index = i;
                    closestPt.properties.location = length;
                }
                if (stop_1.properties.dist < closestPt.properties.dist) {
                    closestPt = stop_1;
                    closestPt.properties.index = i + 1;
                    closestPt.properties.location = length + sectionLength;
                }
                if (intersectPt &&
                    intersectPt.properties.dist < closestPt.properties.dist) {
                    closestPt = intersectPt;
                    closestPt.properties.index = i;
                }
                // update length
                length += sectionLength;
            }
        });
        return closestPt;
    }
    var _default$9 = nearestPointOnLine$1;

    var js$9 = /*#__PURE__*/Object.defineProperty({
    	default: _default$9
    }, '__esModule', {value: true});

    /**
     * Returns true if a point is on a line. Accepts a optional parameter to ignore the
     * start and end vertices of the linestring.
     *
     * @name booleanPointOnLine
     * @param {Coord} pt GeoJSON Point
     * @param {Feature<LineString>} line GeoJSON LineString
     * @param {Object} [options={}] Optional parameters
     * @param {boolean} [options.ignoreEndVertices=false] whether to ignore the start and end vertices.
     * @param {number} [options.epsilon] Fractional number to compare with the cross product result. Useful for dealing with floating points such as lng/lat points
     * @returns {boolean} true/false
     * @example
     * var pt = turf.point([0, 0]);
     * var line = turf.lineString([[-1, -1],[1, 1],[1.5, 2.2]]);
     * var isPointOnLine = turf.booleanPointOnLine(pt, line);
     * //=true
     */
    function booleanPointOnLine(pt, line, options) {
        if (options === void 0) { options = {}; }
        // Normalize inputs
        var ptCoords = invariant.getCoord(pt);
        var lineCoords = invariant.getCoords(line);
        // Main
        for (var i = 0; i < lineCoords.length - 1; i++) {
            var ignoreBoundary = false;
            if (options.ignoreEndVertices) {
                if (i === 0) {
                    ignoreBoundary = "start";
                }
                if (i === lineCoords.length - 2) {
                    ignoreBoundary = "end";
                }
                if (i === 0 && i + 1 === lineCoords.length - 1) {
                    ignoreBoundary = "both";
                }
            }
            if (isPointOnLineSegment(lineCoords[i], lineCoords[i + 1], ptCoords, ignoreBoundary, typeof options.epsilon === "undefined" ? null : options.epsilon)) {
                return true;
            }
        }
        return false;
    }
    // See http://stackoverflow.com/a/4833823/1979085
    // See https://stackoverflow.com/a/328122/1048847
    /**
     * @private
     * @param {Position} lineSegmentStart coord pair of start of line
     * @param {Position} lineSegmentEnd coord pair of end of line
     * @param {Position} pt coord pair of point to check
     * @param {boolean|string} excludeBoundary whether the point is allowed to fall on the line ends.
     * @param {number} epsilon Fractional number to compare with the cross product result. Useful for dealing with floating points such as lng/lat points
     * If true which end to ignore.
     * @returns {boolean} true/false
     */
    function isPointOnLineSegment(lineSegmentStart, lineSegmentEnd, pt, excludeBoundary, epsilon) {
        var x = pt[0];
        var y = pt[1];
        var x1 = lineSegmentStart[0];
        var y1 = lineSegmentStart[1];
        var x2 = lineSegmentEnd[0];
        var y2 = lineSegmentEnd[1];
        var dxc = pt[0] - x1;
        var dyc = pt[1] - y1;
        var dxl = x2 - x1;
        var dyl = y2 - y1;
        var cross = dxc * dyl - dyc * dxl;
        if (epsilon !== null) {
            if (Math.abs(cross) > epsilon) {
                return false;
            }
        }
        else if (cross !== 0) {
            return false;
        }
        if (!excludeBoundary) {
            if (Math.abs(dxl) >= Math.abs(dyl)) {
                return dxl > 0 ? x1 <= x && x <= x2 : x2 <= x && x <= x1;
            }
            return dyl > 0 ? y1 <= y && y <= y2 : y2 <= y && y <= y1;
        }
        else if (excludeBoundary === "start") {
            if (Math.abs(dxl) >= Math.abs(dyl)) {
                return dxl > 0 ? x1 < x && x <= x2 : x2 <= x && x < x1;
            }
            return dyl > 0 ? y1 < y && y <= y2 : y2 <= y && y < y1;
        }
        else if (excludeBoundary === "end") {
            if (Math.abs(dxl) >= Math.abs(dyl)) {
                return dxl > 0 ? x1 <= x && x < x2 : x2 < x && x <= x1;
            }
            return dyl > 0 ? y1 <= y && y < y2 : y2 < y && y <= y1;
        }
        else if (excludeBoundary === "both") {
            if (Math.abs(dxl) >= Math.abs(dyl)) {
                return dxl > 0 ? x1 < x && x < x2 : x2 < x && x < x1;
            }
            return dyl > 0 ? y1 < y && y < y2 : y2 < y && y < y1;
        }
        return false;
    }
    var _default$8 = booleanPointOnLine;

    var js$8 = /*#__PURE__*/Object.defineProperty({
    	default: _default$8
    }, '__esModule', {value: true});

    var toStr$4 = Object.prototype.toString;

    var isArguments$1 = function isArguments(value) {
    	var str = toStr$4.call(value);
    	var isArgs = str === '[object Arguments]';
    	if (!isArgs) {
    		isArgs = str !== '[object Array]' &&
    			value !== null &&
    			typeof value === 'object' &&
    			typeof value.length === 'number' &&
    			value.length >= 0 &&
    			toStr$4.call(value.callee) === '[object Function]';
    	}
    	return isArgs;
    };

    var keysShim$1;
    if (!Object.keys) {
    	// modified from https://github.com/es-shims/es5-shim
    	var has$1 = Object.prototype.hasOwnProperty;
    	var toStr$3 = Object.prototype.toString;
    	var isArgs = isArguments$1; // eslint-disable-line global-require
    	var isEnumerable = Object.prototype.propertyIsEnumerable;
    	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
    	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
    	var dontEnums = [
    		'toString',
    		'toLocaleString',
    		'valueOf',
    		'hasOwnProperty',
    		'isPrototypeOf',
    		'propertyIsEnumerable',
    		'constructor'
    	];
    	var equalsConstructorPrototype = function (o) {
    		var ctor = o.constructor;
    		return ctor && ctor.prototype === o;
    	};
    	var excludedKeys = {
    		$applicationCache: true,
    		$console: true,
    		$external: true,
    		$frame: true,
    		$frameElement: true,
    		$frames: true,
    		$innerHeight: true,
    		$innerWidth: true,
    		$onmozfullscreenchange: true,
    		$onmozfullscreenerror: true,
    		$outerHeight: true,
    		$outerWidth: true,
    		$pageXOffset: true,
    		$pageYOffset: true,
    		$parent: true,
    		$scrollLeft: true,
    		$scrollTop: true,
    		$scrollX: true,
    		$scrollY: true,
    		$self: true,
    		$webkitIndexedDB: true,
    		$webkitStorageInfo: true,
    		$window: true
    	};
    	var hasAutomationEqualityBug = (function () {
    		/* global window */
    		if (typeof window === 'undefined') { return false; }
    		for (var k in window) {
    			try {
    				if (!excludedKeys['$' + k] && has$1.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
    					try {
    						equalsConstructorPrototype(window[k]);
    					} catch (e) {
    						return true;
    					}
    				}
    			} catch (e) {
    				return true;
    			}
    		}
    		return false;
    	}());
    	var equalsConstructorPrototypeIfNotBuggy = function (o) {
    		/* global window */
    		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
    			return equalsConstructorPrototype(o);
    		}
    		try {
    			return equalsConstructorPrototype(o);
    		} catch (e) {
    			return false;
    		}
    	};

    	keysShim$1 = function keys(object) {
    		var isObject = object !== null && typeof object === 'object';
    		var isFunction = toStr$3.call(object) === '[object Function]';
    		var isArguments = isArgs(object);
    		var isString = isObject && toStr$3.call(object) === '[object String]';
    		var theKeys = [];

    		if (!isObject && !isFunction && !isArguments) {
    			throw new TypeError('Object.keys called on a non-object');
    		}

    		var skipProto = hasProtoEnumBug && isFunction;
    		if (isString && object.length > 0 && !has$1.call(object, 0)) {
    			for (var i = 0; i < object.length; ++i) {
    				theKeys.push(String(i));
    			}
    		}

    		if (isArguments && object.length > 0) {
    			for (var j = 0; j < object.length; ++j) {
    				theKeys.push(String(j));
    			}
    		} else {
    			for (var name in object) {
    				if (!(skipProto && name === 'prototype') && has$1.call(object, name)) {
    					theKeys.push(String(name));
    				}
    			}
    		}

    		if (hasDontEnumBug) {
    			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

    			for (var k = 0; k < dontEnums.length; ++k) {
    				if (!(skipConstructor && dontEnums[k] === 'constructor') && has$1.call(object, dontEnums[k])) {
    					theKeys.push(dontEnums[k]);
    				}
    			}
    		}
    		return theKeys;
    	};
    }
    var implementation$3 = keysShim$1;

    var slice$1 = Array.prototype.slice;


    var origKeys = Object.keys;
    var keysShim = origKeys ? function keys(o) { return origKeys(o); } : implementation$3;

    var originalKeys = Object.keys;

    keysShim.shim = function shimObjectKeys() {
    	if (Object.keys) {
    		var keysWorksWithArguments = (function () {
    			// Safari 5.0 bug
    			var args = Object.keys(arguments);
    			return args && args.length === arguments.length;
    		}(1, 2));
    		if (!keysWorksWithArguments) {
    			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
    				if (isArguments$1(object)) {
    					return originalKeys(slice$1.call(object));
    				}
    				return originalKeys(object);
    			};
    		}
    	} else {
    		Object.keys = keysShim;
    	}
    	return Object.keys || keysShim;
    };

    var objectKeys = keysShim;

    /* eslint complexity: [2, 18], max-statements: [2, 33] */
    var shams$1 = function hasSymbols() {
    	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
    	if (typeof Symbol.iterator === 'symbol') { return true; }

    	var obj = {};
    	var sym = Symbol('test');
    	var symObj = Object(sym);
    	if (typeof sym === 'string') { return false; }

    	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
    	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

    	// temp disabled per https://github.com/ljharb/object.assign/issues/17
    	// if (sym instanceof Symbol) { return false; }
    	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
    	// if (!(symObj instanceof Symbol)) { return false; }

    	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
    	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

    	var symVal = 42;
    	obj[sym] = symVal;
    	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
    	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

    	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

    	var syms = Object.getOwnPropertySymbols(obj);
    	if (syms.length !== 1 || syms[0] !== sym) { return false; }

    	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

    	if (typeof Object.getOwnPropertyDescriptor === 'function') {
    		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
    		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
    	}

    	return true;
    };

    var shams = function hasToStringTagShams() {
    	return shams$1() && !!Symbol.toStringTag;
    };

    var origSymbol = typeof Symbol !== 'undefined' && Symbol;


    var hasSymbols$2 = function hasNativeSymbols() {
    	if (typeof origSymbol !== 'function') { return false; }
    	if (typeof Symbol !== 'function') { return false; }
    	if (typeof origSymbol('foo') !== 'symbol') { return false; }
    	if (typeof Symbol('bar') !== 'symbol') { return false; }

    	return shams$1();
    };

    /* eslint no-invalid-this: 1 */

    var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
    var slice = Array.prototype.slice;
    var toStr$2 = Object.prototype.toString;
    var funcType = '[object Function]';

    var implementation$2 = function bind(that) {
        var target = this;
        if (typeof target !== 'function' || toStr$2.call(target) !== funcType) {
            throw new TypeError(ERROR_MESSAGE + target);
        }
        var args = slice.call(arguments, 1);

        var bound;
        var binder = function () {
            if (this instanceof bound) {
                var result = target.apply(
                    this,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;
            } else {
                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );
            }
        };

        var boundLength = Math.max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push('$' + i);
        }

        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

        if (target.prototype) {
            var Empty = function Empty() {};
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }

        return bound;
    };

    var functionBind = Function.prototype.bind || implementation$2;

    var src$1 = functionBind.call(Function.call, Object.prototype.hasOwnProperty);

    var undefined$1;

    var $SyntaxError = SyntaxError;
    var $Function = Function;
    var $TypeError = TypeError;

    // eslint-disable-next-line consistent-return
    var getEvalledConstructor = function (expressionSyntax) {
    	try {
    		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
    	} catch (e) {}
    };

    var $gOPD$1 = Object.getOwnPropertyDescriptor;
    if ($gOPD$1) {
    	try {
    		$gOPD$1({}, '');
    	} catch (e) {
    		$gOPD$1 = null; // this is IE 8, which has a broken gOPD
    	}
    }

    var throwTypeError = function () {
    	throw new $TypeError();
    };
    var ThrowTypeError = $gOPD$1
    	? (function () {
    		try {
    			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
    			arguments.callee; // IE 8 does not throw here
    			return throwTypeError;
    		} catch (calleeThrows) {
    			try {
    				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
    				return $gOPD$1(arguments, 'callee').get;
    			} catch (gOPDthrows) {
    				return throwTypeError;
    			}
    		}
    	}())
    	: throwTypeError;

    var hasSymbols$1 = hasSymbols$2();

    var getProto$1 = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

    var needsEval = {};

    var TypedArray = typeof Uint8Array === 'undefined' ? undefined$1 : getProto$1(Uint8Array);

    var INTRINSICS = {
    	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined$1 : AggregateError,
    	'%Array%': Array,
    	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
    	'%ArrayIteratorPrototype%': hasSymbols$1 ? getProto$1([][Symbol.iterator]()) : undefined$1,
    	'%AsyncFromSyncIteratorPrototype%': undefined$1,
    	'%AsyncFunction%': needsEval,
    	'%AsyncGenerator%': needsEval,
    	'%AsyncGeneratorFunction%': needsEval,
    	'%AsyncIteratorPrototype%': needsEval,
    	'%Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
    	'%BigInt%': typeof BigInt === 'undefined' ? undefined$1 : BigInt,
    	'%Boolean%': Boolean,
    	'%DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
    	'%Date%': Date,
    	'%decodeURI%': decodeURI,
    	'%decodeURIComponent%': decodeURIComponent,
    	'%encodeURI%': encodeURI,
    	'%encodeURIComponent%': encodeURIComponent,
    	'%Error%': Error,
    	'%eval%': eval, // eslint-disable-line no-eval
    	'%EvalError%': EvalError,
    	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
    	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
    	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined$1 : FinalizationRegistry,
    	'%Function%': $Function,
    	'%GeneratorFunction%': needsEval,
    	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
    	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
    	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
    	'%isFinite%': isFinite,
    	'%isNaN%': isNaN,
    	'%IteratorPrototype%': hasSymbols$1 ? getProto$1(getProto$1([][Symbol.iterator]())) : undefined$1,
    	'%JSON%': typeof JSON === 'object' ? JSON : undefined$1,
    	'%Map%': typeof Map === 'undefined' ? undefined$1 : Map,
    	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols$1 ? undefined$1 : getProto$1(new Map()[Symbol.iterator]()),
    	'%Math%': Math,
    	'%Number%': Number,
    	'%Object%': Object,
    	'%parseFloat%': parseFloat,
    	'%parseInt%': parseInt,
    	'%Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
    	'%Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
    	'%RangeError%': RangeError,
    	'%ReferenceError%': ReferenceError,
    	'%Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
    	'%RegExp%': RegExp,
    	'%Set%': typeof Set === 'undefined' ? undefined$1 : Set,
    	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols$1 ? undefined$1 : getProto$1(new Set()[Symbol.iterator]()),
    	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
    	'%String%': String,
    	'%StringIteratorPrototype%': hasSymbols$1 ? getProto$1(''[Symbol.iterator]()) : undefined$1,
    	'%Symbol%': hasSymbols$1 ? Symbol : undefined$1,
    	'%SyntaxError%': $SyntaxError,
    	'%ThrowTypeError%': ThrowTypeError,
    	'%TypedArray%': TypedArray,
    	'%TypeError%': $TypeError,
    	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
    	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
    	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
    	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
    	'%URIError%': URIError,
    	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
    	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined$1 : WeakRef,
    	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet
    };

    var doEval = function doEval(name) {
    	var value;
    	if (name === '%AsyncFunction%') {
    		value = getEvalledConstructor('async function () {}');
    	} else if (name === '%GeneratorFunction%') {
    		value = getEvalledConstructor('function* () {}');
    	} else if (name === '%AsyncGeneratorFunction%') {
    		value = getEvalledConstructor('async function* () {}');
    	} else if (name === '%AsyncGenerator%') {
    		var fn = doEval('%AsyncGeneratorFunction%');
    		if (fn) {
    			value = fn.prototype;
    		}
    	} else if (name === '%AsyncIteratorPrototype%') {
    		var gen = doEval('%AsyncGenerator%');
    		if (gen) {
    			value = getProto$1(gen.prototype);
    		}
    	}

    	INTRINSICS[name] = value;

    	return value;
    };

    var LEGACY_ALIASES = {
    	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
    	'%ArrayPrototype%': ['Array', 'prototype'],
    	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
    	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
    	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
    	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
    	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
    	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
    	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
    	'%BooleanPrototype%': ['Boolean', 'prototype'],
    	'%DataViewPrototype%': ['DataView', 'prototype'],
    	'%DatePrototype%': ['Date', 'prototype'],
    	'%ErrorPrototype%': ['Error', 'prototype'],
    	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
    	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
    	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
    	'%FunctionPrototype%': ['Function', 'prototype'],
    	'%Generator%': ['GeneratorFunction', 'prototype'],
    	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
    	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
    	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
    	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
    	'%JSONParse%': ['JSON', 'parse'],
    	'%JSONStringify%': ['JSON', 'stringify'],
    	'%MapPrototype%': ['Map', 'prototype'],
    	'%NumberPrototype%': ['Number', 'prototype'],
    	'%ObjectPrototype%': ['Object', 'prototype'],
    	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
    	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
    	'%PromisePrototype%': ['Promise', 'prototype'],
    	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
    	'%Promise_all%': ['Promise', 'all'],
    	'%Promise_reject%': ['Promise', 'reject'],
    	'%Promise_resolve%': ['Promise', 'resolve'],
    	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
    	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
    	'%RegExpPrototype%': ['RegExp', 'prototype'],
    	'%SetPrototype%': ['Set', 'prototype'],
    	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
    	'%StringPrototype%': ['String', 'prototype'],
    	'%SymbolPrototype%': ['Symbol', 'prototype'],
    	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
    	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
    	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
    	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
    	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
    	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
    	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
    	'%URIErrorPrototype%': ['URIError', 'prototype'],
    	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
    	'%WeakSetPrototype%': ['WeakSet', 'prototype']
    };



    var $concat = functionBind.call(Function.call, Array.prototype.concat);
    var $spliceApply = functionBind.call(Function.apply, Array.prototype.splice);
    var $replace = functionBind.call(Function.call, String.prototype.replace);
    var $strSlice = functionBind.call(Function.call, String.prototype.slice);

    /* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
    var stringToPath = function stringToPath(string) {
    	var first = $strSlice(string, 0, 1);
    	var last = $strSlice(string, -1);
    	if (first === '%' && last !== '%') {
    		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
    	} else if (last === '%' && first !== '%') {
    		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
    	}
    	var result = [];
    	$replace(string, rePropName, function (match, number, quote, subString) {
    		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
    	});
    	return result;
    };
    /* end adaptation */

    var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
    	var intrinsicName = name;
    	var alias;
    	if (src$1(LEGACY_ALIASES, intrinsicName)) {
    		alias = LEGACY_ALIASES[intrinsicName];
    		intrinsicName = '%' + alias[0] + '%';
    	}

    	if (src$1(INTRINSICS, intrinsicName)) {
    		var value = INTRINSICS[intrinsicName];
    		if (value === needsEval) {
    			value = doEval(intrinsicName);
    		}
    		if (typeof value === 'undefined' && !allowMissing) {
    			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
    		}

    		return {
    			alias: alias,
    			name: intrinsicName,
    			value: value
    		};
    	}

    	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
    };

    var getIntrinsic = function GetIntrinsic(name, allowMissing) {
    	if (typeof name !== 'string' || name.length === 0) {
    		throw new $TypeError('intrinsic name must be a non-empty string');
    	}
    	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
    		throw new $TypeError('"allowMissing" argument must be a boolean');
    	}

    	var parts = stringToPath(name);
    	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

    	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
    	var intrinsicRealName = intrinsic.name;
    	var value = intrinsic.value;
    	var skipFurtherCaching = false;

    	var alias = intrinsic.alias;
    	if (alias) {
    		intrinsicBaseName = alias[0];
    		$spliceApply(parts, $concat([0, 1], alias));
    	}

    	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
    		var part = parts[i];
    		var first = $strSlice(part, 0, 1);
    		var last = $strSlice(part, -1);
    		if (
    			(
    				(first === '"' || first === "'" || first === '`')
    				|| (last === '"' || last === "'" || last === '`')
    			)
    			&& first !== last
    		) {
    			throw new $SyntaxError('property names with quotes must have matching quotes');
    		}
    		if (part === 'constructor' || !isOwn) {
    			skipFurtherCaching = true;
    		}

    		intrinsicBaseName += '.' + part;
    		intrinsicRealName = '%' + intrinsicBaseName + '%';

    		if (src$1(INTRINSICS, intrinsicRealName)) {
    			value = INTRINSICS[intrinsicRealName];
    		} else if (value != null) {
    			if (!(part in value)) {
    				if (!allowMissing) {
    					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
    				}
    				return void undefined$1;
    			}
    			if ($gOPD$1 && (i + 1) >= parts.length) {
    				var desc = $gOPD$1(value, part);
    				isOwn = !!desc;

    				// By convention, when a data property is converted to an accessor
    				// property to emulate a data property that does not suffer from
    				// the override mistake, that accessor's getter is marked with
    				// an `originalValue` property. Here, when we detect this, we
    				// uphold the illusion by pretending to see that original data
    				// property, i.e., returning the value rather than the getter
    				// itself.
    				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
    					value = desc.get;
    				} else {
    					value = value[part];
    				}
    			} else {
    				isOwn = src$1(value, part);
    				value = value[part];
    			}

    			if (isOwn && !skipFurtherCaching) {
    				INTRINSICS[intrinsicRealName] = value;
    			}
    		}
    	}
    	return value;
    };

    var callBind = createCommonjsModule(function (module) {




    var $apply = getIntrinsic('%Function.prototype.apply%');
    var $call = getIntrinsic('%Function.prototype.call%');
    var $reflectApply = getIntrinsic('%Reflect.apply%', true) || functionBind.call($call, $apply);

    var $gOPD = getIntrinsic('%Object.getOwnPropertyDescriptor%', true);
    var $defineProperty = getIntrinsic('%Object.defineProperty%', true);
    var $max = getIntrinsic('%Math.max%');

    if ($defineProperty) {
    	try {
    		$defineProperty({}, 'a', { value: 1 });
    	} catch (e) {
    		// IE 8 has a broken defineProperty
    		$defineProperty = null;
    	}
    }

    module.exports = function callBind(originalFunction) {
    	var func = $reflectApply(functionBind, $call, arguments);
    	if ($gOPD && $defineProperty) {
    		var desc = $gOPD(func, 'length');
    		if (desc.configurable) {
    			// original length, plus the receiver, minus any additional arguments (after the receiver)
    			$defineProperty(
    				func,
    				'length',
    				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
    			);
    		}
    	}
    	return func;
    };

    var applyBind = function applyBind() {
    	return $reflectApply(functionBind, $apply, arguments);
    };

    if ($defineProperty) {
    	$defineProperty(module.exports, 'apply', { value: applyBind });
    } else {
    	module.exports.apply = applyBind;
    }
    });

    var $indexOf = callBind(getIntrinsic('String.prototype.indexOf'));

    var callBound = function callBoundIntrinsic(name, allowMissing) {
    	var intrinsic = getIntrinsic(name, !!allowMissing);
    	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
    		return callBind(intrinsic);
    	}
    	return intrinsic;
    };

    var hasToStringTag$2 = shams();


    var $toString$1 = callBound('Object.prototype.toString');

    var isStandardArguments = function isArguments(value) {
    	if (hasToStringTag$2 && value && typeof value === 'object' && Symbol.toStringTag in value) {
    		return false;
    	}
    	return $toString$1(value) === '[object Arguments]';
    };

    var isLegacyArguments = function isArguments(value) {
    	if (isStandardArguments(value)) {
    		return true;
    	}
    	return value !== null &&
    		typeof value === 'object' &&
    		typeof value.length === 'number' &&
    		value.length >= 0 &&
    		$toString$1(value) !== '[object Array]' &&
    		$toString$1(value.callee) === '[object Function]';
    };

    var supportsStandardArguments = (function () {
    	return isStandardArguments(arguments);
    }());

    isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

    var isArguments = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

    var $defineProperty = getIntrinsic('%Object.defineProperty%', true);

    var hasPropertyDescriptors$1 = function hasPropertyDescriptors() {
    	if ($defineProperty) {
    		try {
    			$defineProperty({}, 'a', { value: 1 });
    			return true;
    		} catch (e) {
    			// IE 8 has a broken defineProperty
    			return false;
    		}
    	}
    	return false;
    };

    hasPropertyDescriptors$1.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
    	// node v0.6 has a bug where array lengths can be Set but not Defined
    	if (!hasPropertyDescriptors$1()) {
    		return null;
    	}
    	try {
    		return $defineProperty([], 'length', { value: 1 }).length !== 1;
    	} catch (e) {
    		// In Firefox 4-22, defining length on an array throws an exception.
    		return true;
    	}
    };

    var hasPropertyDescriptors_1 = hasPropertyDescriptors$1;

    var require$$0$1 = hasPropertyDescriptors_1;

    var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

    var toStr$1 = Object.prototype.toString;
    var concat = Array.prototype.concat;
    var origDefineProperty = Object.defineProperty;

    var isFunction = function (fn) {
    	return typeof fn === 'function' && toStr$1.call(fn) === '[object Function]';
    };

    var hasPropertyDescriptors = require$$0$1();

    var supportsDescriptors$2 = origDefineProperty && hasPropertyDescriptors;

    var defineProperty$1 = function (object, name, value, predicate) {
    	if (name in object && (!isFunction(predicate) || !predicate())) {
    		return;
    	}
    	if (supportsDescriptors$2) {
    		origDefineProperty(object, name, {
    			configurable: true,
    			enumerable: false,
    			value: value,
    			writable: true
    		});
    	} else {
    		object[name] = value; // eslint-disable-line no-param-reassign
    	}
    };

    var defineProperties = function (object, map) {
    	var predicates = arguments.length > 2 ? arguments[2] : {};
    	var props = objectKeys(map);
    	if (hasSymbols) {
    		props = concat.call(props, Object.getOwnPropertySymbols(map));
    	}
    	for (var i = 0; i < props.length; i += 1) {
    		defineProperty$1(object, props[i], map[props[i]], predicates[props[i]]);
    	}
    };

    defineProperties.supportsDescriptors = !!supportsDescriptors$2;

    var defineProperties_1 = defineProperties;

    var numberIsNaN = function (value) {
    	return value !== value;
    };

    var implementation$1 = function is(a, b) {
    	if (a === 0 && b === 0) {
    		return 1 / a === 1 / b;
    	}
    	if (a === b) {
    		return true;
    	}
    	if (numberIsNaN(a) && numberIsNaN(b)) {
    		return true;
    	}
    	return false;
    };

    var polyfill$2 = function getPolyfill() {
    	return typeof Object.is === 'function' ? Object.is : implementation$1;
    };

    var shim$1 = function shimObjectIs() {
    	var polyfill = polyfill$2();
    	defineProperties_1(Object, { is: polyfill }, {
    		is: function testObjectIs() {
    			return Object.is !== polyfill;
    		}
    	});
    	return polyfill;
    };

    var polyfill$1 = callBind(polyfill$2(), Object);

    defineProperties_1(polyfill$1, {
    	getPolyfill: polyfill$2,
    	implementation: implementation$1,
    	shim: shim$1
    });

    var objectIs = polyfill$1;

    var hasToStringTag$1 = shams();
    var has;
    var $exec;
    var isRegexMarker;
    var badStringifier;

    if (hasToStringTag$1) {
    	has = callBound('Object.prototype.hasOwnProperty');
    	$exec = callBound('RegExp.prototype.exec');
    	isRegexMarker = {};

    	var throwRegexMarker = function () {
    		throw isRegexMarker;
    	};
    	badStringifier = {
    		toString: throwRegexMarker,
    		valueOf: throwRegexMarker
    	};

    	if (typeof Symbol.toPrimitive === 'symbol') {
    		badStringifier[Symbol.toPrimitive] = throwRegexMarker;
    	}
    }

    var $toString = callBound('Object.prototype.toString');
    var gOPD$2 = Object.getOwnPropertyDescriptor;
    var regexClass = '[object RegExp]';

    var isRegex = hasToStringTag$1
    	// eslint-disable-next-line consistent-return
    	? function isRegex(value) {
    		if (!value || typeof value !== 'object') {
    			return false;
    		}

    		var descriptor = gOPD$2(value, 'lastIndex');
    		var hasLastIndexDataProperty = descriptor && has(descriptor, 'value');
    		if (!hasLastIndexDataProperty) {
    			return false;
    		}

    		try {
    			$exec(value, badStringifier);
    		} catch (e) {
    			return e === isRegexMarker;
    		}
    	}
    	: function isRegex(value) {
    		// In older browsers, typeof regex incorrectly returns 'function'
    		if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
    			return false;
    		}

    		return $toString(value) === regexClass;
    	};

    var functionsHaveNames = function functionsHaveNames() {
    	return typeof function f() {}.name === 'string';
    };

    var gOPD$1 = Object.getOwnPropertyDescriptor;
    if (gOPD$1) {
    	try {
    		gOPD$1([], 'length');
    	} catch (e) {
    		// IE 8 has a broken gOPD
    		gOPD$1 = null;
    	}
    }

    functionsHaveNames.functionsHaveConfigurableNames = function functionsHaveConfigurableNames() {
    	if (!functionsHaveNames() || !gOPD$1) {
    		return false;
    	}
    	var desc = gOPD$1(function () {}, 'name');
    	return !!desc && !!desc.configurable;
    };

    var $bind = Function.prototype.bind;

    functionsHaveNames.boundFunctionsHaveNames = function boundFunctionsHaveNames() {
    	return functionsHaveNames() && typeof $bind === 'function' && function f() {}.bind().name !== '';
    };

    var functionsHaveNames_1 = functionsHaveNames;

    var implementation = createCommonjsModule(function (module) {

    var functionsHaveConfigurableNames = functionsHaveNames_1.functionsHaveConfigurableNames();

    var $Object = Object;
    var $TypeError = TypeError;

    module.exports = function flags() {
    	if (this != null && this !== $Object(this)) {
    		throw new $TypeError('RegExp.prototype.flags getter called on non-object');
    	}
    	var result = '';
    	if (this.hasIndices) {
    		result += 'd';
    	}
    	if (this.global) {
    		result += 'g';
    	}
    	if (this.ignoreCase) {
    		result += 'i';
    	}
    	if (this.multiline) {
    		result += 'm';
    	}
    	if (this.dotAll) {
    		result += 's';
    	}
    	if (this.unicode) {
    		result += 'u';
    	}
    	if (this.sticky) {
    		result += 'y';
    	}
    	return result;
    };

    if (functionsHaveConfigurableNames && Object.defineProperty) {
    	Object.defineProperty(module.exports, 'name', { value: 'get flags' });
    }
    });

    var supportsDescriptors$1 = defineProperties_1.supportsDescriptors;
    var $gOPD = Object.getOwnPropertyDescriptor;

    var polyfill = function getPolyfill() {
    	if (supportsDescriptors$1 && (/a/mig).flags === 'gim') {
    		var descriptor = $gOPD(RegExp.prototype, 'flags');
    		if (
    			descriptor
    			&& typeof descriptor.get === 'function'
    			&& typeof RegExp.prototype.dotAll === 'boolean'
    			&& typeof RegExp.prototype.hasIndices === 'boolean'
    		) {
    			/* eslint getter-return: 0 */
    			var calls = '';
    			var o = {};
    			Object.defineProperty(o, 'hasIndices', {
    				get: function () {
    					calls += 'd';
    				}
    			});
    			Object.defineProperty(o, 'sticky', {
    				get: function () {
    					calls += 'y';
    				}
    			});
    			if (calls === 'dy') {
    				return descriptor.get;
    			}
    		}
    	}
    	return implementation;
    };

    var supportsDescriptors = defineProperties_1.supportsDescriptors;

    var gOPD = Object.getOwnPropertyDescriptor;
    var defineProperty = Object.defineProperty;
    var TypeErr = TypeError;
    var getProto = Object.getPrototypeOf;
    var regex = /a/;

    var shim = function shimFlags() {
    	if (!supportsDescriptors || !getProto) {
    		throw new TypeErr('RegExp.prototype.flags requires a true ES5 environment that supports property descriptors');
    	}
    	var polyfill$1 = polyfill();
    	var proto = getProto(regex);
    	var descriptor = gOPD(proto, 'flags');
    	if (!descriptor || descriptor.get !== polyfill$1) {
    		defineProperty(proto, 'flags', {
    			configurable: true,
    			enumerable: false,
    			get: polyfill$1
    		});
    	}
    	return polyfill$1;
    };

    var flagsBound = callBind(polyfill());

    defineProperties_1(flagsBound, {
    	getPolyfill: polyfill,
    	implementation: implementation,
    	shim: shim
    });

    var regexp_prototype_flags = flagsBound;

    var getDay = Date.prototype.getDay;
    var tryDateObject = function tryDateGetDayCall(value) {
    	try {
    		getDay.call(value);
    		return true;
    	} catch (e) {
    		return false;
    	}
    };

    var toStr = Object.prototype.toString;
    var dateClass = '[object Date]';
    var hasToStringTag = shams();

    var isDateObject = function isDateObject(value) {
    	if (typeof value !== 'object' || value === null) {
    		return false;
    	}
    	return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
    };

    var getTime = Date.prototype.getTime;

    function deepEqual(actual, expected, options) {
      var opts = options || {};

      // 7.1. All identical values are equivalent, as determined by ===.
      if (opts.strict ? objectIs(actual, expected) : actual === expected) {
        return true;
      }

      // 7.3. Other pairs that do not both pass typeof value == 'object', equivalence is determined by ==.
      if (!actual || !expected || (typeof actual !== 'object' && typeof expected !== 'object')) {
        return opts.strict ? objectIs(actual, expected) : actual == expected;
      }

      /*
       * 7.4. For all other Object pairs, including Array objects, equivalence is
       * determined by having the same number of owned properties (as verified
       * with Object.prototype.hasOwnProperty.call), the same set of keys
       * (although not necessarily the same order), equivalent values for every
       * corresponding key, and an identical 'prototype' property. Note: this
       * accounts for both named and indexed properties on Arrays.
       */
      // eslint-disable-next-line no-use-before-define
      return objEquiv(actual, expected, opts);
    }

    function isUndefinedOrNull(value) {
      return value === null || value === undefined;
    }

    function isBuffer(x) {
      if (!x || typeof x !== 'object' || typeof x.length !== 'number') {
        return false;
      }
      if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
        return false;
      }
      if (x.length > 0 && typeof x[0] !== 'number') {
        return false;
      }
      return true;
    }

    function objEquiv(a, b, opts) {
      /* eslint max-statements: [2, 50] */
      var i, key;
      if (typeof a !== typeof b) { return false; }
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) { return false; }

      // an identical 'prototype' property.
      if (a.prototype !== b.prototype) { return false; }

      if (isArguments(a) !== isArguments(b)) { return false; }

      var aIsRegex = isRegex(a);
      var bIsRegex = isRegex(b);
      if (aIsRegex !== bIsRegex) { return false; }
      if (aIsRegex || bIsRegex) {
        return a.source === b.source && regexp_prototype_flags(a) === regexp_prototype_flags(b);
      }

      if (isDateObject(a) && isDateObject(b)) {
        return getTime.call(a) === getTime.call(b);
      }

      var aIsBuffer = isBuffer(a);
      var bIsBuffer = isBuffer(b);
      if (aIsBuffer !== bIsBuffer) { return false; }
      if (aIsBuffer || bIsBuffer) { // && would work too, because both are true or both false here
        if (a.length !== b.length) { return false; }
        for (i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) { return false; }
        }
        return true;
      }

      if (typeof a !== typeof b) { return false; }

      try {
        var ka = objectKeys(a);
        var kb = objectKeys(b);
      } catch (e) { // happens when one is a string literal and the other isn't
        return false;
      }
      // having the same number of owned properties (keys incorporates hasOwnProperty)
      if (ka.length !== kb.length) { return false; }

      // the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      // ~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i]) { return false; }
      }
      // equivalent values for every corresponding key, and ~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], opts)) { return false; }
      }

      return true;
    }

    var deepEqual_1 = deepEqual;

    var nearestPointOnLine = js$9;

    var require$$1 = js$8;

    var __importDefault$2 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    var geojson_rbush_1 = __importDefault$2(geojsonRbush_1);
    var line_segment_1 = __importDefault$2(lineSegment);
    var nearest_point_on_line_1 = __importDefault$2(nearestPointOnLine);
    var boolean_point_on_line_1$1 = __importDefault$2(require$$1);



    var deep_equal_1 = __importDefault$2(deepEqual_1);
    /**
     * Takes any LineString or Polygon and returns the overlapping lines between both features.
     *
     * @name lineOverlap
     * @param {Geometry|Feature<LineString|MultiLineString|Polygon|MultiPolygon>} line1 any LineString or Polygon
     * @param {Geometry|Feature<LineString|MultiLineString|Polygon|MultiPolygon>} line2 any LineString or Polygon
     * @param {Object} [options={}] Optional parameters
     * @param {number} [options.tolerance=0] Tolerance distance to match overlapping line segments (in kilometers)
     * @returns {FeatureCollection<LineString>} lines(s) that are overlapping between both features
     * @example
     * var line1 = turf.lineString([[115, -35], [125, -30], [135, -30], [145, -35]]);
     * var line2 = turf.lineString([[115, -25], [125, -30], [135, -30], [145, -25]]);
     *
     * var overlapping = turf.lineOverlap(line1, line2);
     *
     * //addToMap
     * var addToMap = [line1, line2, overlapping]
     */
    function lineOverlap(line1, line2, options) {
        if (options === void 0) { options = {}; }
        // Optional parameters
        options = options || {};
        if (!require$$0$3.isObject(options))
            throw new Error("options is invalid");
        var tolerance = options.tolerance || 0;
        // Containers
        var features = [];
        // Create Spatial Index
        var tree = geojson_rbush_1.default();
        // To-Do -- HACK way to support typescript
        var line = line_segment_1.default(line1);
        tree.load(line);
        var overlapSegment;
        // Line Intersection
        // Iterate over line segments
        meta_1.segmentEach(line2, function (segment) {
            var doesOverlaps = false;
            if (!segment) {
                return;
            }
            // Iterate over each segments which falls within the same bounds
            meta_1.featureEach(tree.search(segment), function (match) {
                if (doesOverlaps === false) {
                    var coordsSegment = invariant.getCoords(segment).sort();
                    var coordsMatch = invariant.getCoords(match).sort();
                    // Segment overlaps feature
                    if (deep_equal_1.default(coordsSegment, coordsMatch)) {
                        doesOverlaps = true;
                        // Overlaps already exists - only append last coordinate of segment
                        if (overlapSegment)
                            overlapSegment = concatSegment(overlapSegment, segment);
                        else
                            overlapSegment = segment;
                        // Match segments which don't share nodes (Issue #901)
                    }
                    else if (tolerance === 0
                        ? boolean_point_on_line_1$1.default(coordsSegment[0], match) &&
                            boolean_point_on_line_1$1.default(coordsSegment[1], match)
                        : nearest_point_on_line_1.default(match, coordsSegment[0]).properties.dist <=
                            tolerance &&
                            nearest_point_on_line_1.default(match, coordsSegment[1]).properties.dist <=
                                tolerance) {
                        doesOverlaps = true;
                        if (overlapSegment)
                            overlapSegment = concatSegment(overlapSegment, segment);
                        else
                            overlapSegment = segment;
                    }
                    else if (tolerance === 0
                        ? boolean_point_on_line_1$1.default(coordsMatch[0], segment) &&
                            boolean_point_on_line_1$1.default(coordsMatch[1], segment)
                        : nearest_point_on_line_1.default(segment, coordsMatch[0]).properties.dist <=
                            tolerance &&
                            nearest_point_on_line_1.default(segment, coordsMatch[1]).properties.dist <=
                                tolerance) {
                        // Do not define (doesOverlap = true) since more matches can occur within the same segment
                        // doesOverlaps = true;
                        if (overlapSegment)
                            overlapSegment = concatSegment(overlapSegment, match);
                        else
                            overlapSegment = match;
                    }
                }
            });
            // Segment doesn't overlap - add overlaps to results & reset
            if (doesOverlaps === false && overlapSegment) {
                features.push(overlapSegment);
                overlapSegment = undefined;
            }
        });
        // Add last segment if exists
        if (overlapSegment)
            features.push(overlapSegment);
        return require$$0$3.featureCollection(features);
    }
    /**
     * Concat Segment
     *
     * @private
     * @param {Feature<LineString>} line LineString
     * @param {Feature<LineString>} segment 2-vertex LineString
     * @returns {Feature<LineString>} concat linestring
     */
    function concatSegment(line, segment) {
        var coords = invariant.getCoords(segment);
        var lineCoords = invariant.getCoords(line);
        var start = lineCoords[0];
        var end = lineCoords[lineCoords.length - 1];
        var geom = line.geometry.coordinates;
        if (deep_equal_1.default(coords[0], start))
            geom.unshift(coords[1]);
        else if (deep_equal_1.default(coords[0], end))
            geom.push(coords[1]);
        else if (deep_equal_1.default(coords[1], start))
            geom.unshift(coords[0]);
        else if (deep_equal_1.default(coords[1], end))
            geom.push(coords[0]);
        return line;
    }
    var _default$7 = lineOverlap;

    var js$7 = /*#__PURE__*/Object.defineProperty({
    	default: _default$7
    }, '__esModule', {value: true});

    //index.js


    var Equality = function(opt) {
      this.precision = opt && opt.precision ? opt.precision : 17;
      this.direction = opt && opt.direction ? opt.direction : false;
      this.pseudoNode = opt && opt.pseudoNode ? opt.pseudoNode : false;
      this.objectComparator = opt && opt.objectComparator ? opt.objectComparator : objectComparator;
    };

    Equality.prototype.compare = function(g1,g2) {
      if (g1.type !== g2.type || !sameLength(g1,g2)) return false;

      switch(g1.type) {
      case 'Point':
        return this.compareCoord(g1.coordinates, g2.coordinates);
      case 'LineString':
        return this.compareLine(g1.coordinates, g2.coordinates,0,false);
      case 'Polygon':
        return this.comparePolygon(g1,g2);
      case 'Feature':
        return this.compareFeature(g1, g2);
      default:
        if (g1.type.indexOf('Multi') === 0) {
          var context = this;
          var g1s = explode(g1);
          var g2s = explode(g2);
          return g1s.every(function(g1part) {
            return this.some(function(g2part) {
              return context.compare(g1part,g2part);
            });
          },g2s);
        }
      }
      return false;
    };

    function explode(g) {
      return g.coordinates.map(function(part) {
        return {
          type: g.type.replace('Multi', ''),
          coordinates: part}
      });
    }
    //compare length of coordinates/array
    function sameLength(g1,g2) {
       return g1.hasOwnProperty('coordinates') ?
        g1.coordinates.length === g2.coordinates.length
        : g1.length === g2.length;
    }

    // compare the two coordinates [x,y]
    Equality.prototype.compareCoord = function(c1,c2) {
      if (c1.length !== c2.length) {
        return false;
      }

      for (var i=0; i < c1.length; i++) {
        if (c1[i].toFixed(this.precision) !== c2[i].toFixed(this.precision)) {
          return false;
        }
      }
      return true;
    };

    Equality.prototype.compareLine = function(path1,path2,ind,isPoly) {
      if (!sameLength(path1,path2)) return false;
      var p1 = this.pseudoNode ? path1 : this.removePseudo(path1);
      var p2 = this.pseudoNode ? path2 : this.removePseudo(path2);
      if (isPoly && !this.compareCoord(p1[0],p2[0])) {
        // fix start index of both to same point
        p2 = this.fixStartIndex(p2,p1);
        if(!p2) return;
      }
      // for linestring ind =0 and for polygon ind =1
      var sameDirection = this.compareCoord(p1[ind],p2[ind]);
      if (this.direction || sameDirection
      ) {
        return this.comparePath(p1, p2);
      } else {
        if (this.compareCoord(p1[ind],p2[p2.length - (1+ind)])
        ) {
          return this.comparePath(p1.slice().reverse(), p2);
        }
        return false;
      }
    };
    Equality.prototype.fixStartIndex = function(sourcePath,targetPath) {
      //make sourcePath first point same as of targetPath
      var correctPath,ind = -1;
      for (var i=0; i< sourcePath.length; i++) {
        if(this.compareCoord(sourcePath[i],targetPath[0])) {
          ind = i;
          break;
        }
      }
      if (ind >= 0) {
        correctPath = [].concat(
          sourcePath.slice(ind,sourcePath.length),
          sourcePath.slice(1,ind+1));
      }
      return correctPath;
    };
    Equality.prototype.comparePath = function (p1,p2) {
      var cont = this;
      return p1.every(function(c,i) {
        return cont.compareCoord(c,this[i]);
      },p2);
    };

    Equality.prototype.comparePolygon = function(g1,g2) {
      if (this.compareLine(g1.coordinates[0],g2.coordinates[0],1,true)) {
        var holes1 = g1.coordinates.slice(1,g1.coordinates.length);
        var holes2 = g2.coordinates.slice(1,g2.coordinates.length);
        var cont = this;
        return holes1.every(function(h1) {
          return this.some(function(h2) {
            return cont.compareLine(h1,h2,1,true);
          });
        },holes2);
      } else {
        return false;
      }
    };

    Equality.prototype.compareFeature = function(g1,g2) {
      if (
        g1.id !== g2.id ||
        !this.objectComparator(g1.properties, g2.properties) ||
        !this.compareBBox(g1,g2)
      ) {
        return false;
      }
      return this.compare(g1.geometry, g2.geometry);
    };

    Equality.prototype.compareBBox = function(g1,g2) {
      if (
        (!g1.bbox && !g2.bbox) || 
        (
          g1.bbox && g2.bbox &&
          this.compareCoord(g1.bbox, g2.bbox)
        )
      )  {
        return true;
      }
      return false;
    };
    Equality.prototype.removePseudo = function(path) {
      //TODO to be implement
      return path;
    };

    function objectComparator(obj1, obj2) {
      return deepEqual_1(obj1, obj2, {strict: true});
    }

    var geojsonEquality = Equality;

    var require$$0 = js$7;

    var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };



    var line_overlap_1 = __importDefault$1(require$$0);
    var line_intersect_1 = __importDefault$1(lineIntersect);
    var geojson_equality_1 = __importDefault$1(geojsonEquality);
    /**
     * Compares two geometries of the same dimension and returns true if their intersection set results in a geometry
     * different from both but of the same dimension. It applies to Polygon/Polygon, LineString/LineString,
     * Multipoint/Multipoint, MultiLineString/MultiLineString and MultiPolygon/MultiPolygon.
     *
     * In other words, it returns true if the two geometries overlap, provided that neither completely contains the other.
     *
     * @name booleanOverlap
     * @param  {Geometry|Feature<LineString|MultiLineString|Polygon|MultiPolygon>} feature1 input
     * @param  {Geometry|Feature<LineString|MultiLineString|Polygon|MultiPolygon>} feature2 input
     * @returns {boolean} true/false
     * @example
     * var poly1 = turf.polygon([[[0,0],[0,5],[5,5],[5,0],[0,0]]]);
     * var poly2 = turf.polygon([[[1,1],[1,6],[6,6],[6,1],[1,1]]]);
     * var poly3 = turf.polygon([[[10,10],[10,15],[15,15],[15,10],[10,10]]]);
     *
     * turf.booleanOverlap(poly1, poly2)
     * //=true
     * turf.booleanOverlap(poly2, poly3)
     * //=false
     */
    function booleanOverlap(feature1, feature2) {
        var geom1 = invariant.getGeom(feature1);
        var geom2 = invariant.getGeom(feature2);
        var type1 = geom1.type;
        var type2 = geom2.type;
        if ((type1 === "MultiPoint" && type2 !== "MultiPoint") ||
            ((type1 === "LineString" || type1 === "MultiLineString") &&
                type2 !== "LineString" &&
                type2 !== "MultiLineString") ||
            ((type1 === "Polygon" || type1 === "MultiPolygon") &&
                type2 !== "Polygon" &&
                type2 !== "MultiPolygon")) {
            throw new Error("features must be of the same type");
        }
        if (type1 === "Point")
            throw new Error("Point geometry not supported");
        // features must be not equal
        var equality = new geojson_equality_1.default({ precision: 6 });
        if (equality.compare(feature1, feature2))
            return false;
        var overlap = 0;
        switch (type1) {
            case "MultiPoint":
                for (var i = 0; i < geom1.coordinates.length; i++) {
                    for (var j = 0; j < geom2.coordinates.length; j++) {
                        var coord1 = geom1.coordinates[i];
                        var coord2 = geom2.coordinates[j];
                        if (coord1[0] === coord2[0] && coord1[1] === coord2[1]) {
                            return true;
                        }
                    }
                }
                return false;
            case "LineString":
            case "MultiLineString":
                meta_1.segmentEach(feature1, function (segment1) {
                    meta_1.segmentEach(feature2, function (segment2) {
                        if (line_overlap_1.default(segment1, segment2).features.length)
                            overlap++;
                    });
                });
                break;
            case "Polygon":
            case "MultiPolygon":
                meta_1.segmentEach(feature1, function (segment1) {
                    meta_1.segmentEach(feature2, function (segment2) {
                        if (line_intersect_1.default(segment1, segment2).features.length)
                            overlap++;
                    });
                });
                break;
        }
        return overlap > 0;
    }
    var _default$6 = booleanOverlap;

    var js$6 = /*#__PURE__*/Object.defineProperty({
    	default: _default$6
    }, '__esModule', {value: true});

    // http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
    // modified from: https://github.com/substack/point-in-polygon/blob/master/index.js
    // which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    /**
     * Takes a {@link Point} and a {@link Polygon} or {@link MultiPolygon} and determines if the point
     * resides inside the polygon. The polygon can be convex or concave. The function accounts for holes.
     *
     * @name booleanPointInPolygon
     * @param {Coord} point input point
     * @param {Feature<Polygon|MultiPolygon>} polygon input polygon or multipolygon
     * @param {Object} [options={}] Optional parameters
     * @param {boolean} [options.ignoreBoundary=false] True if polygon boundary should be ignored when determining if
     * the point is inside the polygon otherwise false.
     * @returns {boolean} `true` if the Point is inside the Polygon; `false` if the Point is not inside the Polygon
     * @example
     * var pt = turf.point([-77, 44]);
     * var poly = turf.polygon([[
     *   [-81, 41],
     *   [-81, 47],
     *   [-72, 47],
     *   [-72, 41],
     *   [-81, 41]
     * ]]);
     *
     * turf.booleanPointInPolygon(pt, poly);
     * //= true
     */
    function booleanPointInPolygon(point, polygon, options) {
        if (options === void 0) { options = {}; }
        // validation
        if (!point) {
            throw new Error("point is required");
        }
        if (!polygon) {
            throw new Error("polygon is required");
        }
        var pt = invariant.getCoord(point);
        var geom = invariant.getGeom(polygon);
        var type = geom.type;
        var bbox = polygon.bbox;
        var polys = geom.coordinates;
        // Quick elimination if point is not inside bbox
        if (bbox && inBBox(pt, bbox) === false) {
            return false;
        }
        // normalize to multipolygon
        if (type === "Polygon") {
            polys = [polys];
        }
        var insidePoly = false;
        for (var i = 0; i < polys.length && !insidePoly; i++) {
            // check if it is in the outer ring first
            if (inRing(pt, polys[i][0], options.ignoreBoundary)) {
                var inHole = false;
                var k = 1;
                // check for the point in any of the holes
                while (k < polys[i].length && !inHole) {
                    if (inRing(pt, polys[i][k], !options.ignoreBoundary)) {
                        inHole = true;
                    }
                    k++;
                }
                if (!inHole) {
                    insidePoly = true;
                }
            }
        }
        return insidePoly;
    }
    var _default$5 = booleanPointInPolygon;
    /**
     * inRing
     *
     * @private
     * @param {Array<number>} pt [x,y]
     * @param {Array<Array<number>>} ring [[x,y], [x,y],..]
     * @param {boolean} ignoreBoundary ignoreBoundary
     * @returns {boolean} inRing
     */
    function inRing(pt, ring, ignoreBoundary) {
        var isInside = false;
        if (ring[0][0] === ring[ring.length - 1][0] &&
            ring[0][1] === ring[ring.length - 1][1]) {
            ring = ring.slice(0, ring.length - 1);
        }
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var xi = ring[i][0];
            var yi = ring[i][1];
            var xj = ring[j][0];
            var yj = ring[j][1];
            var onBoundary = pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0 &&
                (xi - pt[0]) * (xj - pt[0]) <= 0 &&
                (yi - pt[1]) * (yj - pt[1]) <= 0;
            if (onBoundary) {
                return !ignoreBoundary;
            }
            var intersect = yi > pt[1] !== yj > pt[1] &&
                pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi;
            if (intersect) {
                isInside = !isInside;
            }
        }
        return isInside;
    }
    /**
     * inBBox
     *
     * @private
     * @param {Position} pt point [x,y]
     * @param {BBox} bbox BBox [west, south, east, north]
     * @returns {boolean} true/false if point is inside BBox
     */
    function inBBox(pt, bbox) {
        return (bbox[0] <= pt[0] && bbox[1] <= pt[1] && bbox[2] >= pt[0] && bbox[3] >= pt[1]);
    }

    var js$5 = /*#__PURE__*/Object.defineProperty({
    	default: _default$5
    }, '__esModule', {value: true});

    var require$$7 = js$5;

    var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    var bbox_1 = __importDefault(require$$2$1);
    var boolean_point_on_line_1 = __importDefault(require$$1);
    var boolean_point_in_polygon_1 = __importDefault(require$$7);

    /**
     * Boolean-within returns true if the first geometry is completely within the second geometry.
     * The interiors of both geometries must intersect and, the interior and boundary of the primary (geometry a)
     * must not intersect the exterior of the secondary (geometry b).
     * Boolean-within returns the exact opposite result of the `@turf/boolean-contains`.
     *
     * @name booleanWithin
     * @param {Geometry|Feature<any>} feature1 GeoJSON Feature or Geometry
     * @param {Geometry|Feature<any>} feature2 GeoJSON Feature or Geometry
     * @returns {boolean} true/false
     * @example
     * var line = turf.lineString([[1, 1], [1, 2], [1, 3], [1, 4]]);
     * var point = turf.point([1, 2]);
     *
     * turf.booleanWithin(point, line);
     * //=true
     */
    function booleanWithin(feature1, feature2) {
        var geom1 = invariant.getGeom(feature1);
        var geom2 = invariant.getGeom(feature2);
        var type1 = geom1.type;
        var type2 = geom2.type;
        switch (type1) {
            case "Point":
                switch (type2) {
                    case "MultiPoint":
                        return isPointInMultiPoint(geom1, geom2);
                    case "LineString":
                        return boolean_point_on_line_1.default(geom1, geom2, { ignoreEndVertices: true });
                    case "Polygon":
                    case "MultiPolygon":
                        return boolean_point_in_polygon_1.default(geom1, geom2, { ignoreBoundary: true });
                    default:
                        throw new Error("feature2 " + type2 + " geometry not supported");
                }
            case "MultiPoint":
                switch (type2) {
                    case "MultiPoint":
                        return isMultiPointInMultiPoint(geom1, geom2);
                    case "LineString":
                        return isMultiPointOnLine(geom1, geom2);
                    case "Polygon":
                    case "MultiPolygon":
                        return isMultiPointInPoly(geom1, geom2);
                    default:
                        throw new Error("feature2 " + type2 + " geometry not supported");
                }
            case "LineString":
                switch (type2) {
                    case "LineString":
                        return isLineOnLine(geom1, geom2);
                    case "Polygon":
                    case "MultiPolygon":
                        return isLineInPoly(geom1, geom2);
                    default:
                        throw new Error("feature2 " + type2 + " geometry not supported");
                }
            case "Polygon":
                switch (type2) {
                    case "Polygon":
                    case "MultiPolygon":
                        return isPolyInPoly(geom1, geom2);
                    default:
                        throw new Error("feature2 " + type2 + " geometry not supported");
                }
            default:
                throw new Error("feature1 " + type1 + " geometry not supported");
        }
    }
    function isPointInMultiPoint(point, multiPoint) {
        var i;
        var output = false;
        for (i = 0; i < multiPoint.coordinates.length; i++) {
            if (compareCoords(multiPoint.coordinates[i], point.coordinates)) {
                output = true;
                break;
            }
        }
        return output;
    }
    function isMultiPointInMultiPoint(multiPoint1, multiPoint2) {
        for (var i = 0; i < multiPoint1.coordinates.length; i++) {
            var anyMatch = false;
            for (var i2 = 0; i2 < multiPoint2.coordinates.length; i2++) {
                if (compareCoords(multiPoint1.coordinates[i], multiPoint2.coordinates[i2])) {
                    anyMatch = true;
                }
            }
            if (!anyMatch) {
                return false;
            }
        }
        return true;
    }
    function isMultiPointOnLine(multiPoint, lineString) {
        var foundInsidePoint = false;
        for (var i = 0; i < multiPoint.coordinates.length; i++) {
            if (!boolean_point_on_line_1.default(multiPoint.coordinates[i], lineString)) {
                return false;
            }
            if (!foundInsidePoint) {
                foundInsidePoint = boolean_point_on_line_1.default(multiPoint.coordinates[i], lineString, { ignoreEndVertices: true });
            }
        }
        return foundInsidePoint;
    }
    function isMultiPointInPoly(multiPoint, polygon) {
        var output = true;
        var isInside = false;
        for (var i = 0; i < multiPoint.coordinates.length; i++) {
            isInside = boolean_point_in_polygon_1.default(multiPoint.coordinates[1], polygon);
            if (!isInside) {
                output = false;
                break;
            }
            {
                isInside = boolean_point_in_polygon_1.default(multiPoint.coordinates[1], polygon, {
                    ignoreBoundary: true,
                });
            }
        }
        return output && isInside;
    }
    function isLineOnLine(lineString1, lineString2) {
        for (var i = 0; i < lineString1.coordinates.length; i++) {
            if (!boolean_point_on_line_1.default(lineString1.coordinates[i], lineString2)) {
                return false;
            }
        }
        return true;
    }
    function isLineInPoly(linestring, polygon) {
        var polyBbox = bbox_1.default(polygon);
        var lineBbox = bbox_1.default(linestring);
        if (!doBBoxOverlap(polyBbox, lineBbox)) {
            return false;
        }
        var foundInsidePoint = false;
        for (var i = 0; i < linestring.coordinates.length - 1; i++) {
            if (!boolean_point_in_polygon_1.default(linestring.coordinates[i], polygon)) {
                return false;
            }
            if (!foundInsidePoint) {
                foundInsidePoint = boolean_point_in_polygon_1.default(linestring.coordinates[i], polygon, { ignoreBoundary: true });
            }
            if (!foundInsidePoint) {
                var midpoint = getMidpoint(linestring.coordinates[i], linestring.coordinates[i + 1]);
                foundInsidePoint = boolean_point_in_polygon_1.default(midpoint, polygon, {
                    ignoreBoundary: true,
                });
            }
        }
        return foundInsidePoint;
    }
    /**
     * Is Polygon2 in Polygon1
     * Only takes into account outer rings
     *
     * @private
     * @param {Polygon} geometry1
     * @param {Polygon|MultiPolygon} geometry2
     * @returns {boolean} true/false
     */
    function isPolyInPoly(geometry1, geometry2) {
        var poly1Bbox = bbox_1.default(geometry1);
        var poly2Bbox = bbox_1.default(geometry2);
        if (!doBBoxOverlap(poly2Bbox, poly1Bbox)) {
            return false;
        }
        for (var i = 0; i < geometry1.coordinates[0].length; i++) {
            if (!boolean_point_in_polygon_1.default(geometry1.coordinates[0][i], geometry2)) {
                return false;
            }
        }
        return true;
    }
    function doBBoxOverlap(bbox1, bbox2) {
        if (bbox1[0] > bbox2[0])
            return false;
        if (bbox1[2] < bbox2[2])
            return false;
        if (bbox1[1] > bbox2[1])
            return false;
        if (bbox1[3] < bbox2[3])
            return false;
        return true;
    }
    /**
     * compareCoords
     *
     * @private
     * @param {Position} pair1 point [x,y]
     * @param {Position} pair2 point [x,y]
     * @returns {boolean} true/false if coord pairs match
     */
    function compareCoords(pair1, pair2) {
        return pair1[0] === pair2[0] && pair1[1] === pair2[1];
    }
    /**
     * getMidpoint
     *
     * @private
     * @param {Position} pair1 point [x,y]
     * @param {Position} pair2 point [x,y]
     * @returns {Position} midpoint of pair1 and pair2
     */
    function getMidpoint(pair1, pair2) {
        return [(pair1[0] + pair2[0]) / 2, (pair1[1] + pair2[1]) / 2];
    }
    var _default$4 = booleanWithin;

    var js$4 = /*#__PURE__*/Object.defineProperty({
    	default: _default$4
    }, '__esModule', {value: true});

    function _interopDefaultLegacy$2 (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var distance__default = /*#__PURE__*/_interopDefaultLegacy$2(distance);

    /**
     * Takes a bounding box and calculates the minimum square bounding box that
     * would contain the input.
     *
     * @name square
     * @param {BBox} bbox extent in [west, south, east, north] order
     * @returns {BBox} a square surrounding `bbox`
     * @example
     * var bbox = [-20, -20, -15, 0];
     * var squared = turf.square(bbox);
     *
     * //addToMap
     * var addToMap = [turf.bboxPolygon(bbox), turf.bboxPolygon(squared)]
     */
    function square$1(bbox) {
      var west = bbox[0];
      var south = bbox[1];
      var east = bbox[2];
      var north = bbox[3];

      var horizontalDistance = distance__default['default'](bbox.slice(0, 2), [east, south]);
      var verticalDistance = distance__default['default'](bbox.slice(0, 2), [west, north]);
      if (horizontalDistance >= verticalDistance) {
        var verticalMidpoint = (south + north) / 2;
        return [
          west,
          verticalMidpoint - (east - west) / 2,
          east,
          verticalMidpoint + (east - west) / 2,
        ];
      } else {
        var horizontalMidpoint = (west + east) / 2;
        return [
          horizontalMidpoint - (north - south) / 2,
          south,
          horizontalMidpoint + (north - south) / 2,
          north,
        ];
      }
    }

    var js$3 = square$1;
    var _default$3 = square$1;
    js$3.default = _default$3;

    /**
     * Takes a GeoJSON Feature or FeatureCollection and truncates the precision of the geometry.
     *
     * @name truncate
     * @param {GeoJSON} geojson any GeoJSON Feature, FeatureCollection, Geometry or GeometryCollection.
     * @param {Object} [options={}] Optional parameters
     * @param {number} [options.precision=6] coordinate decimal precision
     * @param {number} [options.coordinates=3] maximum number of coordinates (primarly used to remove z coordinates)
     * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated (significant performance increase if true)
     * @returns {GeoJSON} layer with truncated geometry
     * @example
     * var point = turf.point([
     *     70.46923055566859,
     *     58.11088890802906,
     *     1508
     * ]);
     * var options = {precision: 3, coordinates: 2};
     * var truncated = turf.truncate(point, options);
     * //=truncated.geometry.coordinates => [70.469, 58.111]
     *
     * //addToMap
     * var addToMap = [truncated];
     */
    function truncate$1(geojson, options) {
        if (options === void 0) { options = {}; }
        // Optional parameters
        var precision = options.precision;
        var coordinates = options.coordinates;
        var mutate = options.mutate;
        // default params
        precision =
            precision === undefined || precision === null || isNaN(precision)
                ? 6
                : precision;
        coordinates =
            coordinates === undefined || coordinates === null || isNaN(coordinates)
                ? 3
                : coordinates;
        // validation
        if (!geojson)
            throw new Error("<geojson> is required");
        if (typeof precision !== "number")
            throw new Error("<precision> must be a number");
        if (typeof coordinates !== "number")
            throw new Error("<coordinates> must be a number");
        // prevent input mutation
        if (mutate === false || mutate === undefined)
            geojson = JSON.parse(JSON.stringify(geojson));
        var factor = Math.pow(10, precision);
        // Truncate Coordinates
        meta_1.coordEach(geojson, function (coords) {
            truncateCoords(coords, factor, coordinates);
        });
        return geojson;
    }
    /**
     * Truncate Coordinates - Mutates coordinates in place
     *
     * @private
     * @param {Array<any>} coords Geometry Coordinates
     * @param {number} factor rounding factor for coordinate decimal precision
     * @param {number} coordinates maximum number of coordinates (primarly used to remove z coordinates)
     * @returns {Array<any>} mutated coordinates
     */
    function truncateCoords(coords, factor, coordinates) {
        // Remove extra coordinates (usually elevation coordinates and more)
        if (coords.length > coordinates)
            coords.splice(coordinates, coords.length);
        // Truncate coordinate decimals
        for (var i = 0; i < coords.length; i++) {
            coords[i] = Math.round(coords[i] * factor) / factor;
        }
        return coords;
    }
    var _default$2 = truncate$1;

    var js$2 = /*#__PURE__*/Object.defineProperty({
    	default: _default$2
    }, '__esModule', {value: true});

    var square = js$3;

    var truncate = js$2;

    function _interopDefaultLegacy$1 (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var rbush__default = /*#__PURE__*/_interopDefaultLegacy$1(geojsonRbush_1);
    var square__default = /*#__PURE__*/_interopDefaultLegacy$1(square);
    var bbox__default = /*#__PURE__*/_interopDefaultLegacy$1(require$$2$1);
    var truncate__default = /*#__PURE__*/_interopDefaultLegacy$1(truncate);
    var lineSegment__default = /*#__PURE__*/_interopDefaultLegacy$1(lineSegment);
    var lineIntersect__default = /*#__PURE__*/_interopDefaultLegacy$1(lineIntersect);
    var nearestPointOnLine__default = /*#__PURE__*/_interopDefaultLegacy$1(nearestPointOnLine);

    /**
     * Split a LineString by another GeoJSON Feature.
     *
     * @name lineSplit
     * @param {Feature<LineString>} line LineString Feature to split
     * @param {Feature<any>} splitter Feature used to split line
     * @returns {FeatureCollection<LineString>} Split LineStrings
     * @example
     * var line = turf.lineString([[120, -25], [145, -25]]);
     * var splitter = turf.lineString([[130, -15], [130, -35]]);
     *
     * var split = turf.lineSplit(line, splitter);
     *
     * //addToMap
     * var addToMap = [line, splitter]
     */
    function lineSplit(line, splitter) {
      if (!line) throw new Error("line is required");
      if (!splitter) throw new Error("splitter is required");

      var lineType = invariant.getType(line);
      var splitterType = invariant.getType(splitter);

      if (lineType !== "LineString") throw new Error("line must be LineString");
      if (splitterType === "FeatureCollection")
        throw new Error("splitter cannot be a FeatureCollection");
      if (splitterType === "GeometryCollection")
        throw new Error("splitter cannot be a GeometryCollection");

      // remove excessive decimals from splitter
      // to avoid possible approximation issues in rbush
      var truncatedSplitter = truncate__default['default'](splitter, { precision: 7 });

      switch (splitterType) {
        case "Point":
          return splitLineWithPoint(line, truncatedSplitter);
        case "MultiPoint":
          return splitLineWithPoints(line, truncatedSplitter);
        case "LineString":
        case "MultiLineString":
        case "Polygon":
        case "MultiPolygon":
          return splitLineWithPoints(line, lineIntersect__default['default'](line, truncatedSplitter));
      }
    }

    /**
     * Split LineString with MultiPoint
     *
     * @private
     * @param {Feature<LineString>} line LineString
     * @param {FeatureCollection<Point>} splitter Point
     * @returns {FeatureCollection<LineString>} split LineStrings
     */
    function splitLineWithPoints(line, splitter) {
      var results = [];
      var tree = rbush__default['default']();

      meta_1.flattenEach(splitter, function (point) {
        // Add index/id to features (needed for filter)
        results.forEach(function (feature, index) {
          feature.id = index;
        });
        // First Point - doesn't need to handle any previous line results
        if (!results.length) {
          results = splitLineWithPoint(line, point).features;

          // Add Square BBox to each feature for GeoJSON-RBush
          results.forEach(function (feature) {
            if (!feature.bbox) feature.bbox = square__default['default'](bbox__default['default'](feature));
          });
          tree.load(require$$0$3.featureCollection(results));
          // Split with remaining points - lines might needed to be split multiple times
        } else {
          // Find all lines that are within the splitter's bbox
          var search = tree.search(point);

          if (search.features.length) {
            // RBush might return multiple lines - only process the closest line to splitter
            var closestLine = findClosestFeature(point, search);

            // Remove closest line from results since this will be split into two lines
            // This removes any duplicates inside the results & index
            results = results.filter(function (feature) {
              return feature.id !== closestLine.id;
            });
            tree.remove(closestLine);

            // Append the two newly split lines into the results
            meta_1.featureEach(splitLineWithPoint(closestLine, point), function (line) {
              results.push(line);
              tree.insert(line);
            });
          }
        }
      });
      return require$$0$3.featureCollection(results);
    }

    /**
     * Split LineString with Point
     *
     * @private
     * @param {Feature<LineString>} line LineString
     * @param {Feature<Point>} splitter Point
     * @returns {FeatureCollection<LineString>} split LineStrings
     */
    function splitLineWithPoint(line, splitter) {
      var results = [];

      // handle endpoints
      var startPoint = invariant.getCoords(line)[0];
      var endPoint = invariant.getCoords(line)[line.geometry.coordinates.length - 1];
      if (
        pointsEquals(startPoint, invariant.getCoord(splitter)) ||
        pointsEquals(endPoint, invariant.getCoord(splitter))
      )
        return require$$0$3.featureCollection([line]);

      // Create spatial index
      var tree = rbush__default['default']();
      var segments = lineSegment__default['default'](line);
      tree.load(segments);

      // Find all segments that are within bbox of splitter
      var search = tree.search(splitter);

      // Return itself if point is not within spatial index
      if (!search.features.length) return require$$0$3.featureCollection([line]);

      // RBush might return multiple lines - only process the closest line to splitter
      var closestSegment = findClosestFeature(splitter, search);

      // Initial value is the first point of the first segments (beginning of line)
      var initialValue = [startPoint];
      var lastCoords = meta_1.featureReduce(
        segments,
        function (previous, current, index) {
          var currentCoords = invariant.getCoords(current)[1];
          var splitterCoords = invariant.getCoord(splitter);

          // Location where segment intersects with line
          if (index === closestSegment.id) {
            previous.push(splitterCoords);
            results.push(require$$0$3.lineString(previous));
            // Don't duplicate splitter coordinate (Issue #688)
            if (pointsEquals(splitterCoords, currentCoords))
              return [splitterCoords];
            return [splitterCoords, currentCoords];

            // Keep iterating over coords until finished or intersection is found
          } else {
            previous.push(currentCoords);
            return previous;
          }
        },
        initialValue
      );
      // Append last line to final split results
      if (lastCoords.length > 1) {
        results.push(require$$0$3.lineString(lastCoords));
      }
      return require$$0$3.featureCollection(results);
    }

    /**
     * Find Closest Feature
     *
     * @private
     * @param {Feature<Point>} point Feature must be closest to this point
     * @param {FeatureCollection<LineString>} lines Collection of Features
     * @returns {Feature<LineString>} closest LineString
     */
    function findClosestFeature(point, lines) {
      if (!lines.features.length) throw new Error("lines must contain features");
      // Filter to one segment that is the closest to the line
      if (lines.features.length === 1) return lines.features[0];

      var closestFeature;
      var closestDistance = Infinity;
      meta_1.featureEach(lines, function (segment) {
        var pt = nearestPointOnLine__default['default'](segment, point);
        var dist = pt.properties.dist;
        if (dist < closestDistance) {
          closestFeature = segment;
          closestDistance = dist;
        }
      });
      return closestFeature;
    }

    /**
     * Compares two points and returns if they are equals
     *
     * @private
     * @param {Array<number>} pt1 point
     * @param {Array<number>} pt2 point
     * @returns {boolean} true if they are equals
     */
    function pointsEquals(pt1, pt2) {
      return pt1[0] === pt2[0] && pt1[1] === pt2[1];
    }

    var js$1 = lineSplit;
    var _default$1 = lineSplit;
    js$1.default = _default$1;

    // Note: change RADIUS => earthRadius
    var RADIUS = 6378137;
    /**
     * Takes one or more features and returns their area in square meters.
     *
     * @name area
     * @param {GeoJSON} geojson input GeoJSON feature(s)
     * @returns {number} area in square meters
     * @example
     * var polygon = turf.polygon([[[125, -15], [113, -22], [154, -27], [144, -15], [125, -15]]]);
     *
     * var area = turf.area(polygon);
     *
     * //addToMap
     * var addToMap = [polygon]
     * polygon.properties.area = area
     */
    function area(geojson) {
        return meta_1.geomReduce(geojson, function (value, geom) {
            return value + calculateArea(geom);
        }, 0);
    }
    var _default = area;
    /**
     * Calculate Area
     *
     * @private
     * @param {Geometry} geom GeoJSON Geometries
     * @returns {number} area
     */
    function calculateArea(geom) {
        var total = 0;
        var i;
        switch (geom.type) {
            case "Polygon":
                return polygonArea(geom.coordinates);
            case "MultiPolygon":
                for (i = 0; i < geom.coordinates.length; i++) {
                    total += polygonArea(geom.coordinates[i]);
                }
                return total;
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
                return 0;
        }
        return 0;
    }
    function polygonArea(coords) {
        var total = 0;
        if (coords && coords.length > 0) {
            total += Math.abs(ringArea(coords[0]));
            for (var i = 1; i < coords.length; i++) {
                total -= Math.abs(ringArea(coords[i]));
            }
        }
        return total;
    }
    /**
     * @private
     * Calculate the approximate area of the polygon were it projected onto the earth.
     * Note that this area will be positive if ring is oriented clockwise, otherwise it will be negative.
     *
     * Reference:
     * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for Polygons on a Sphere",
     * JPL Publication 07-03, Jet Propulsion
     * Laboratory, Pasadena, CA, June 2007 https://trs.jpl.nasa.gov/handle/2014/40409
     *
     * @param {Array<Array<number>>} coords Ring Coordinates
     * @returns {number} The approximate signed geodesic area of the polygon in square meters.
     */
    function ringArea(coords) {
        var p1;
        var p2;
        var p3;
        var lowerIndex;
        var middleIndex;
        var upperIndex;
        var i;
        var total = 0;
        var coordsLength = coords.length;
        if (coordsLength > 2) {
            for (i = 0; i < coordsLength; i++) {
                if (i === coordsLength - 2) {
                    // i = N-2
                    lowerIndex = coordsLength - 2;
                    middleIndex = coordsLength - 1;
                    upperIndex = 0;
                }
                else if (i === coordsLength - 1) {
                    // i = N-1
                    lowerIndex = coordsLength - 1;
                    middleIndex = 0;
                    upperIndex = 1;
                }
                else {
                    // i = 0 to N-3
                    lowerIndex = i;
                    middleIndex = i + 1;
                    upperIndex = i + 2;
                }
                p1 = coords[lowerIndex];
                p2 = coords[middleIndex];
                p3 = coords[upperIndex];
                total += (rad(p3[0]) - rad(p1[0])) * Math.sin(rad(p2[1]));
            }
            total = (total * RADIUS * RADIUS) / 2;
        }
        return total;
    }
    function rad(num) {
        return (num * Math.PI) / 180;
    }

    var js = /*#__PURE__*/Object.defineProperty({
    	default: _default
    }, '__esModule', {value: true});

    /**
     * Copyright (c) 2011, Sun Ning.
     *
     * Permission is hereby granted, free of charge, to any person
     * obtaining a copy of this software and associated documentation
     * files (the "Software"), to deal in the Software without
     * restriction, including without limitation the rights to use, copy,
     * modify, merge, publish, distribute, sublicense, and/or sell copies
     * of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
     * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
     * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
     * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    var BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
    var BASE32_CODES_DICT = {};
    for (var i = 0; i < BASE32_CODES.length; i++) {
      BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
    }

    var ENCODE_AUTO = 'auto';

    var MIN_LAT = -90;
    var MAX_LAT = 90;
    var MIN_LON = -180;
    var MAX_LON = 180;
    /**
     * Significant Figure Hash Length
     *
     * This is a quick and dirty lookup to figure out how long our hash
     * should be in order to guarantee a certain amount of trailing
     * significant figures. This was calculated by determining the error:
     * 45/2^(n-1) where n is the number of bits for a latitude or
     * longitude. Key is # of desired sig figs, value is minimum length of
     * the geohash.
     * @type Array
     */
    //     Desired sig figs:  0  1  2  3  4   5   6   7   8   9  10
    var SIGFIG_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];
    /**
     * Encode
     *
     * Create a Geohash out of a latitude and longitude that is
     * `numberOfChars` long.
     *
     * @param {Number|String} latitude
     * @param {Number|String} longitude
     * @param {Number} numberOfChars
     * @returns {String}
     */
    var encode = function (latitude, longitude, numberOfChars) {
      if (numberOfChars === ENCODE_AUTO) {
        if (typeof(latitude) === 'number' || typeof(longitude) === 'number') {
          throw new Error('string notation required for auto precision.');
        }
        var decSigFigsLat = latitude.split('.')[1].length;
        var decSigFigsLong = longitude.split('.')[1].length;
        var numberOfSigFigs = Math.max(decSigFigsLat, decSigFigsLong);
        numberOfChars = SIGFIG_HASH_LENGTH[numberOfSigFigs];
      } else if (numberOfChars === undefined) {
        numberOfChars = 9;
      }

      var chars = [],
      bits = 0,
      bitsTotal = 0,
      hash_value = 0,
      maxLat = MAX_LAT,
      minLat = MIN_LAT,
      maxLon = MAX_LON,
      minLon = MIN_LON,
      mid;
      while (chars.length < numberOfChars) {
        if (bitsTotal % 2 === 0) {
          mid = (maxLon + minLon) / 2;
          if (longitude > mid) {
            hash_value = (hash_value << 1) + 1;
            minLon = mid;
          } else {
            hash_value = (hash_value << 1) + 0;
            maxLon = mid;
          }
        } else {
          mid = (maxLat + minLat) / 2;
          if (latitude > mid) {
            hash_value = (hash_value << 1) + 1;
            minLat = mid;
          } else {
            hash_value = (hash_value << 1) + 0;
            maxLat = mid;
          }
        }

        bits++;
        bitsTotal++;
        if (bits === 5) {
          var code = BASE32_CODES[hash_value];
          chars.push(code);
          bits = 0;
          hash_value = 0;
        }
      }
      return chars.join('');
    };

    /**
     * Encode Integer
     *
     * Create a Geohash out of a latitude and longitude that is of 'bitDepth'.
     *
     * @param {Number} latitude
     * @param {Number} longitude
     * @param {Number} bitDepth
     * @returns {Number}
     */
    var encode_int = function (latitude, longitude, bitDepth) {

      bitDepth = bitDepth || 52;

      var bitsTotal = 0,
      maxLat = MAX_LAT,
      minLat = MIN_LAT,
      maxLon = MAX_LON,
      minLon = MIN_LON,
      mid,
      combinedBits = 0;

      while (bitsTotal < bitDepth) {
        combinedBits *= 2;
        if (bitsTotal % 2 === 0) {
          mid = (maxLon + minLon) / 2;
          if (longitude > mid) {
            combinedBits += 1;
            minLon = mid;
          } else {
            maxLon = mid;
          }
        } else {
          mid = (maxLat + minLat) / 2;
          if (latitude > mid) {
            combinedBits += 1;
            minLat = mid;
          } else {
            maxLat = mid;
          }
        }
        bitsTotal++;
      }
      return combinedBits;
    };

    /**
     * Decode Bounding Box
     *
     * Decode hashString into a bound box matches it. Data returned in a four-element array: [minlat, minlon, maxlat, maxlon]
     * @param {String} hash_string
     * @returns {Array}
     */
    var decode_bbox = function (hash_string) {
      var isLon = true,
        maxLat = MAX_LAT,
        minLat = MIN_LAT,
        maxLon = MAX_LON,
        minLon = MIN_LON,
        mid;

      var hashValue = 0;
      for (var i = 0, l = hash_string.length; i < l; i++) {
        var code = hash_string[i].toLowerCase();
        hashValue = BASE32_CODES_DICT[code];

        for (var bits = 4; bits >= 0; bits--) {
          var bit = (hashValue >> bits) & 1;
          if (isLon) {
            mid = (maxLon + minLon) / 2;
            if (bit === 1) {
              minLon = mid;
            } else {
              maxLon = mid;
            }
          } else {
            mid = (maxLat + minLat) / 2;
            if (bit === 1) {
              minLat = mid;
            } else {
              maxLat = mid;
            }
          }
          isLon = !isLon;
        }
      }
      return [minLat, minLon, maxLat, maxLon];
    };

    /**
     * Decode Bounding Box Integer
     *
     * Decode hash number into a bound box matches it. Data returned in a four-element array: [minlat, minlon, maxlat, maxlon]
     * @param {Number} hashInt
     * @param {Number} bitDepth
     * @returns {Array}
     */
    var decode_bbox_int = function (hashInt, bitDepth) {

      bitDepth = bitDepth || 52;

      var maxLat = MAX_LAT,
      minLat = MIN_LAT,
      maxLon = MAX_LON,
      minLon = MIN_LON;

      var latBit = 0, lonBit = 0;
      var step = bitDepth / 2;

      for (var i = 0; i < step; i++) {

        lonBit = get_bit(hashInt, ((step - i) * 2) - 1);
        latBit = get_bit(hashInt, ((step - i) * 2) - 2);

        if (latBit === 0) {
          maxLat = (maxLat + minLat) / 2;
        }
        else {
          minLat = (maxLat + minLat) / 2;
        }

        if (lonBit === 0) {
          maxLon = (maxLon + minLon) / 2;
        }
        else {
          minLon = (maxLon + minLon) / 2;
        }
      }
      return [minLat, minLon, maxLat, maxLon];
    };

    function get_bit(bits, position) {
      return (bits / Math.pow(2, position)) & 0x01;
    }

    /**
     * Decode
     *
     * Decode a hash string into pair of latitude and longitude. A javascript object is returned with keys `latitude`,
     * `longitude` and `error`.
     * @param {String} hashString
     * @returns {Object}
     */
    var decode = function (hashString) {
      var bbox = decode_bbox(hashString);
      var lat = (bbox[0] + bbox[2]) / 2;
      var lon = (bbox[1] + bbox[3]) / 2;
      var latErr = bbox[2] - lat;
      var lonErr = bbox[3] - lon;
      return {latitude: lat, longitude: lon,
          error: {latitude: latErr, longitude: lonErr}};
    };

    /**
     * Decode Integer
     *
     * Decode a hash number into pair of latitude and longitude. A javascript object is returned with keys `latitude`,
     * `longitude` and `error`.
     * @param {Number} hash_int
     * @param {Number} bitDepth
     * @returns {Object}
     */
    var decode_int = function (hash_int, bitDepth) {
      var bbox = decode_bbox_int(hash_int, bitDepth);
      var lat = (bbox[0] + bbox[2]) / 2;
      var lon = (bbox[1] + bbox[3]) / 2;
      var latErr = bbox[2] - lat;
      var lonErr = bbox[3] - lon;
      return {latitude: lat, longitude: lon,
              error: {latitude: latErr, longitude: lonErr}};
    };

    /**
     * Neighbor
     *
     * Find neighbor of a geohash string in certain direction. Direction is a two-element array, i.e. [1,0] means north, [-1,-1] means southwest.
     * direction [lat, lon], i.e.
     * [1,0] - north
     * [1,1] - northeast
     * ...
     * @param {String} hashString
     * @param {Array} Direction as a 2D normalized vector.
     * @returns {String}
     */
    var neighbor = function (hashString, direction) {
      var lonLat = decode(hashString);
      var neighborLat = lonLat.latitude
        + direction[0] * lonLat.error.latitude * 2;
      var neighborLon = lonLat.longitude
        + direction[1] * lonLat.error.longitude * 2;
      neighborLon = ensure_valid_lon(neighborLon);
      neighborLat = ensure_valid_lat(neighborLat);
      return encode(neighborLat, neighborLon, hashString.length);
    };

    /**
     * Neighbor Integer
     *
     * Find neighbor of a geohash integer in certain direction. Direction is a two-element array, i.e. [1,0] means north, [-1,-1] means southwest.
     * direction [lat, lon], i.e.
     * [1,0] - north
     * [1,1] - northeast
     * ...
     * @param {String} hash_string
     * @returns {Array}
    */
    var neighbor_int = function (hash_int, direction, bitDepth) {
        bitDepth = bitDepth || 52;
        var lonlat = decode_int(hash_int, bitDepth);
        var neighbor_lat = lonlat.latitude + direction[0] * lonlat.error.latitude * 2;
        var neighbor_lon = lonlat.longitude + direction[1] * lonlat.error.longitude * 2;
        neighbor_lon = ensure_valid_lon(neighbor_lon);
        neighbor_lat = ensure_valid_lat(neighbor_lat);
        return encode_int(neighbor_lat, neighbor_lon, bitDepth);
    };

    /**
     * Neighbors
     *
     * Returns all neighbors' hashstrings clockwise from north around to northwest
     * 7 0 1
     * 6 x 2
     * 5 4 3
     * @param {String} hash_string
     * @returns {encoded neighborHashList|Array}
     */
    var neighbors = function (hash_string) {

        var hashstringLength = hash_string.length;

        var lonlat = decode(hash_string);
        var lat = lonlat.latitude;
        var lon = lonlat.longitude;
        var latErr = lonlat.error.latitude * 2;
        var lonErr = lonlat.error.longitude * 2;

        var neighbor_lat,
            neighbor_lon;

        var neighborHashList = [
                                encodeNeighbor(1,0),
                                encodeNeighbor(1,1),
                                encodeNeighbor(0,1),
                                encodeNeighbor(-1,1),
                                encodeNeighbor(-1,0),
                                encodeNeighbor(-1,-1),
                                encodeNeighbor(0,-1),
                                encodeNeighbor(1,-1)
                                ];

        function encodeNeighbor(neighborLatDir, neighborLonDir){
            neighbor_lat = lat + neighborLatDir * latErr;
            neighbor_lon = lon + neighborLonDir * lonErr;
            neighbor_lon = ensure_valid_lon(neighbor_lon);
            neighbor_lat = ensure_valid_lat(neighbor_lat);
            return encode(neighbor_lat, neighbor_lon, hashstringLength);
        }

        return neighborHashList;
    };

    /**
     * Neighbors Integer
     *
     * Returns all neighbors' hash integers clockwise from north around to northwest
     * 7 0 1
     * 6 x 2
     * 5 4 3
     * @param {Number} hash_int
     * @param {Number} bitDepth
     * @returns {encode_int'd neighborHashIntList|Array}
     */
    var neighbors_int = function(hash_int, bitDepth){

        bitDepth = bitDepth || 52;

        var lonlat = decode_int(hash_int, bitDepth);
        var lat = lonlat.latitude;
        var lon = lonlat.longitude;
        var latErr = lonlat.error.latitude * 2;
        var lonErr = lonlat.error.longitude * 2;

        var neighbor_lat,
            neighbor_lon;

        var neighborHashIntList = [
                                   encodeNeighbor_int(1,0),
                                   encodeNeighbor_int(1,1),
                                   encodeNeighbor_int(0,1),
                                   encodeNeighbor_int(-1,1),
                                   encodeNeighbor_int(-1,0),
                                   encodeNeighbor_int(-1,-1),
                                   encodeNeighbor_int(0,-1),
                                   encodeNeighbor_int(1,-1)
                                   ];

        function encodeNeighbor_int(neighborLatDir, neighborLonDir){
            neighbor_lat = lat + neighborLatDir * latErr;
            neighbor_lon = lon + neighborLonDir * lonErr;
            neighbor_lon = ensure_valid_lon(neighbor_lon);
            neighbor_lat = ensure_valid_lat(neighbor_lat);
            return encode_int(neighbor_lat, neighbor_lon, bitDepth);
        }

        return neighborHashIntList;
    };


    /**
     * Bounding Boxes
     *
     * Return all the hashString between minLat, minLon, maxLat, maxLon in numberOfChars
     * @param {Number} minLat
     * @param {Number} minLon
     * @param {Number} maxLat
     * @param {Number} maxLon
     * @param {Number} numberOfChars
     * @returns {bboxes.hashList|Array}
     */
    var bboxes = function (minLat, minLon, maxLat, maxLon, numberOfChars) {
      numberOfChars = numberOfChars || 9;

      var hashSouthWest = encode(minLat, minLon, numberOfChars);
      var hashNorthEast = encode(maxLat, maxLon, numberOfChars);

      var latLon = decode(hashSouthWest);

      var perLat = latLon.error.latitude * 2;
      var perLon = latLon.error.longitude * 2;

      var boxSouthWest = decode_bbox(hashSouthWest);
      var boxNorthEast = decode_bbox(hashNorthEast);

      var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
      var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

      var hashList = [];

      for (var lat = 0; lat <= latStep; lat++) {
        for (var lon = 0; lon <= lonStep; lon++) {
          hashList.push(neighbor(hashSouthWest, [lat, lon]));
        }
      }

      return hashList;
    };

    /**
     * Bounding Boxes Integer
     *
     * Return all the hash integers between minLat, minLon, maxLat, maxLon in bitDepth
     * @param {Number} minLat
     * @param {Number} minLon
     * @param {Number} maxLat
     * @param {Number} maxLon
     * @param {Number} bitDepth
     * @returns {bboxes_int.hashList|Array}
     */
    var bboxes_int = function(minLat, minLon, maxLat, maxLon, bitDepth){
        bitDepth = bitDepth || 52;

        var hashSouthWest = encode_int(minLat, minLon, bitDepth);
        var hashNorthEast = encode_int(maxLat, maxLon, bitDepth);

        var latlon = decode_int(hashSouthWest, bitDepth);

        var perLat = latlon.error.latitude * 2;
        var perLon = latlon.error.longitude * 2;

        var boxSouthWest = decode_bbox_int(hashSouthWest, bitDepth);
        var boxNorthEast = decode_bbox_int(hashNorthEast, bitDepth);

        var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0])/perLat);
        var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1])/perLon);

        var hashList = [];

        for(var lat = 0; lat <= latStep; lat++){
            for(var lon = 0; lon <= lonStep; lon++){
                hashList.push(neighbor_int(hashSouthWest,[lat, lon], bitDepth));
            }
        }

      return hashList;
    };

    function ensure_valid_lon(lon) {
      if (lon > MAX_LON)
        return MIN_LON + lon % MAX_LON;
      if (lon < MIN_LON)
        return MAX_LON + lon % MAX_LON;
      return lon;
    }
    function ensure_valid_lat(lat) {
      if (lat > MAX_LAT)
        return MAX_LAT;
      if (lat < MIN_LAT)
        return MIN_LAT;
      return lat;
    }
    var geohash = {
      'ENCODE_AUTO': ENCODE_AUTO,
      'encode': encode,
      'encode_uint64': encode_int, // keeping for backwards compatibility, will deprecate
      'encode_int': encode_int,
      'decode': decode,
      'decode_int': decode_int,
      'decode_uint64': decode_int, // keeping for backwards compatibility, will deprecate
      'decode_bbox': decode_bbox,
      'decode_bbox_uint64': decode_bbox_int, // keeping for backwards compatibility, will deprecate
      'decode_bbox_int': decode_bbox_int,
      'neighbor': neighbor,
      'neighbor_int': neighbor_int,
      'neighbors': neighbors,
      'neighbors_int': neighbors_int,
      'bboxes': bboxes,
      'bboxes_int': bboxes_int
    };

    var main = geohash;

    var require$$8 = js$1;

    const { default: turfBbox$1 } = require$$2$1;
    const { lineString: turfLine$1 } = require$$0$3;
    const { default: turfLineSplit$1 } = require$$8;

    function switchBbox$1(bbox) {
      const [y1, x1, y2, x2] = bbox;
      return [x1, y1, x2, y2]
    }

    function isMulti$1(coordinates) {
      return Array.isArray(coordinates[0][0][0])
    }

    function isLine$1(coordinates) {
      return !Array.isArray(coordinates[0][0])
    }

    function isPoint$1(coordinates) {
      return !Array.isArray(coordinates[0])
    }

    function allRectangleEdgesWithin$1(polygon1, polygon2) {
      const bbox = turfBbox$1(polygon1);
      const edge = turfLine$1([
        [bbox[0], bbox[3]], // Top edge
        [bbox[2], bbox[3]], // Top edge
        [bbox[2], bbox[3]], // Right edge
        [bbox[2], bbox[1]], // Right edge
        [bbox[2], bbox[1]], // Bottom edge
        [bbox[0], bbox[1]], // Bottom edge
        [bbox[0], bbox[1]], // Left edge
        [bbox[0], bbox[3]], // Left edge
      ]);
      // Make sure the polygon does not split the line into separate segments
      return turfLineSplit$1(edge, polygon2).features.length === 0
    }

    function extractCoordinatesFromGeoJSON$1(geoJSON) {
      let result = [];

      if (!geoJSON.hasOwnProperty("type")) {
        throw new Error("GeoJSON Error: GeoJSON object is missing type property")
      }

      const checkForCoordinates = [
        "Polygon",
        "MultiPolygon",
        "LineString",
        "MultiLineString",
        "Point",
        "MultiPoint",
      ];
      if (checkForCoordinates.includes(geoJSON.type)) {
        if (!geoJSON.hasOwnProperty("coordinates")) {
          throw new Error(`GeoJSON Error: ${geoJSON.type} is missing "coordinates" property`)
        }
      }

      switch (geoJSON.type) {
        case "FeatureCollection":
          geoJSON.features.forEach(f => {
            const coordinates = extractCoordinatesFromGeoJSON$1(f);
            result.push(...coordinates);
          });
          break
        case "Feature":
          if (!geoJSON.hasOwnProperty("geometry")) {
            throw new Error("GeoJSON Error: Feature is missing geometry property")
          }

          const coordinates = extractCoordinatesFromGeoJSON$1(geoJSON.geometry);
          result.push(...coordinates);
          break
        case "Polygon":
          result.push(geoJSON.coordinates);
          break
        case "MultiPolygon":
          if (!isMulti$1(geoJSON.coordinates)) {
            throw new Error("GeoJSON Error: MultiPolygon is actually not a MultiPolygon")
          }

          result.push(...geoJSON.coordinates);
          break
        case "LineString":
          result.push(geoJSON.coordinates);
          break
        case "MultiLineString":
          result.push(...geoJSON.coordinates);
          break
        case "Point":
          result.push(geoJSON.coordinates);
          break
        case "MultiPoint":
          result.push(...geoJSON.coordinates);
          break
      }

      return result
    }

    var helpers = {
      switchBbox: switchBbox$1,
      isPoint: isPoint$1,
      isLine: isLine$1,
      isMulti: isMulti$1,
      allRectangleEdgesWithin: allRectangleEdgesWithin$1,
      extractCoordinatesFromGeoJSON: extractCoordinatesFromGeoJSON$1,
    };

    var require$$3 = js$h;

    var require$$4 = js$f;

    var require$$5 = js$6;

    var require$$6 = js$4;

    var require$$9 = js;

    const { polygon: turfPolygon, lineString: turfLine, point: turfPoint } = require$$0$3;
    const { default: turfBboxPolygon } = require$$1$1;
    const { default: turfBbox } = require$$2$1;
    const { default: turfEnvelope } = require$$3;
    const { default: turfIntersect } = require$$4;
    const { default: turfBooleanOverlap } = require$$5;
    const { default: turfBooleanWithin } = require$$6;
    const { default: turfBooleanPointInPolygon } = require$$7;
    const { default: turfLineSplit } = require$$8;
    const { default: turfArea } = require$$9;



    const {
      isPoint,
      isLine,
      isMulti,
      switchBbox,
      allRectangleEdgesWithin,
      extractCoordinatesFromGeoJSON,
    } = helpers;

    const defaultOptions = {
      precision: 6,
      hashMode: "intersect",
      minIntersect: 0,
      customWriter: null,
      allowDuplicates: true,
    };

    async function shape2geohash(shapes, options = {}) {
      options = { ...defaultOptions, ...options }; // overwrite default options

      let allShapes = null;
      if (Array.isArray(shapes)) {
        // The input is either an array of polygon coordinates or a list of polygons
        allShapes = isMulti(shapes) ? shapes : [shapes]; // Make sure allShapes is always an array of shapes
      } else {
        allShapes = extractCoordinatesFromGeoJSON(shapes);
      }

      let allGeohashes = [];

      if (!options.allowDuplicates) {
        allGeohashes = new Set();
      }

      const addGeohashes = geohashes => {
        if (!options.allowDuplicates) {
          geohashes.forEach(gh => allGeohashes.add(gh));
          return
        }
        allGeohashes.push(...geohashes);
      };

      const allShapePromises = allShapes.map(shape => {
        return new Promise((resolve, reject) => {
          if (isPoint(shape) && options.customWriter === null) {
            // Optimization for points. No need for streams.
            addGeohashes([main.encode(...shape.reverse(), options.precision)]);
            resolve();
            return
          }

          const geohashStream = new GeohashStream(shape, options);

          const writer = new Stream__default["default"].Writable({
            objectMode: true,
            write: (rowGeohashes, enc, callback) => {
              addGeohashes(rowGeohashes);
              callback();
            },
          });

          if (options.customWriter) {
            geohashStream.pipe(options.customWriter);
          } else {
            geohashStream.pipe(writer); // Kick off the stream
          }

          geohashStream.on("end", () => {
            resolve();
          });
        })
      });

      return Promise.all(allShapePromises).then(() => Array.from(allGeohashes))
    }

    class GeohashStream extends Stream__default["default"].Readable {
      constructor(shapeCoordinates, options) {
        super({ objectMode: true });

        this.options = options;

        this.shapeIsPoint = isPoint(shapeCoordinates);
        if (this.shapeIsPoint) {
          this.pointCoordinates = shapeCoordinates;
          return
        }

        this.originalShape = isLine(shapeCoordinates)
          ? turfLine(shapeCoordinates)
          : turfPolygon(shapeCoordinates);

        // [minX, minY, maxX, maxY]
        const originalEnvelopeBbox = turfBbox(turfEnvelope(this.originalShape));

        // [minX, minY, maxX, maxY]
        const topLeftGeohashBbox = switchBbox(
          main.decode_bbox(
            main.encode(originalEnvelopeBbox[3], originalEnvelopeBbox[0], this.options.precision)
          )
        );

        // [minX, minY, maxX, maxY]
        const bottomRightGeohashBbox = switchBbox(
          main.decode_bbox(
            main.encode(originalEnvelopeBbox[1], originalEnvelopeBbox[2], this.options.precision)
          )
        );

        // The extended geohash envelope covers the area from top left geohash until bottom right geohash
        // I use it instead of the original envelope because I want every row match the real geohash row
        const geohashEnvelopeBbox = [
          topLeftGeohashBbox[0],
          bottomRightGeohashBbox[1],
          bottomRightGeohashBbox[2],
          topLeftGeohashBbox[3],
        ];

        this.rowWidth = Math.abs(geohashEnvelopeBbox[2] - geohashEnvelopeBbox[0]);
        this.geohashHeight = Math.abs(topLeftGeohashBbox[3] - topLeftGeohashBbox[1]);

        // Current point is the top left corner of the extended geohash envelope
        // Traversing the polygon from top to bottom
        this.currentPoint = [geohashEnvelopeBbox[0], geohashEnvelopeBbox[3]];

        // Bottom border of the extended geohash envelope
        this.bottomLimit = geohashEnvelopeBbox[1];

        // The minimum shared area between the polygon and the geohash
        this.minIntersectArea =
          this.options.minIntersect * turfArea(turfBboxPolygon(topLeftGeohashBbox));

        // Used in processRowSegment to keep track of how much area of the row
        // has been covered by the matching geohashes
        // Prevent duplicate geohashes
        this.rowProgress = -Infinity;
      }

      _read(size) {
        if (this.shapeIsPoint) {
          this.push([main.encode(...this.pointCoordinates.reverse(), this.options.precision)]);
          this.push(null);
          return
        }

        const rowGeohashes = this.processNextRow();
        if (rowGeohashes !== null) {
          this.push(rowGeohashes); // Push data out of the stream
        } else {
          this.push(null); // End the stream
        }
      }

      processNextRow() {
        if (this.currentPoint[1] <= this.bottomLimit) {
          // We have reached the bottom of the polygon
          return null
        }

        // Calculate the row polygon
        const rowPolygon = turfBboxPolygon([
          this.currentPoint[0],
          this.currentPoint[1] - this.geohashHeight,
          this.currentPoint[0] + this.rowWidth,
          this.currentPoint[1],
        ]);

        const geohashes = []; // Geohashes for this row

        if (this.options.hashMode === "envelope") {
          geohashes.push(...this.processRowSegment(rowPolygon.geometry.coordinates));
        } else {
          if (this.originalShape.geometry.type === "LineString") {
            const lineSegments = turfLineSplit(this.originalShape, rowPolygon).features;

            if (lineSegments.length === 0) {
              // Line is completely inside rowPolygon so just add the originalShape
              lineSegments.push(this.originalShape);
            }

            let evenPairs;
            const firstPointOfFirstSegment = lineSegments[0].geometry.coordinates[0];
            if (turfBooleanPointInPolygon(firstPointOfFirstSegment, rowPolygon)) {
              evenPairs = true;
            } else {
              evenPairs = false;
            }
            // Filter for line segments that are inside the row polygon
            // Put an envelope around the segment and get geohashes
            lineSegments
              .filter((p, i) => (evenPairs ? i % 2 == 0 : i % 2 == 1))
              .forEach(lineSegment => {
                const lineSegmentEnvelope = turfEnvelope(lineSegment).geometry.coordinates;
                geohashes.push(...this.processRowSegment(lineSegmentEnvelope));
              });
          } else {
            // Its a Polygon
            // Calculate the intersection between the row and the original polygon
            const intersectionGeoJSON = turfIntersect(this.originalShape, rowPolygon);
            if (intersectionGeoJSON !== null) {
              let coordinates = intersectionGeoJSON.geometry.coordinates;
              coordinates = isMulti(coordinates) ? coordinates : [coordinates];

              // Check every intersection part for geohashes
              coordinates.forEach(polygon => {
                geohashes.push(...this.processRowSegment(polygon));
              });
            }
          }
        }

        // Move one row lower
        this.currentPoint[1] -= this.geohashHeight;

        // Reset rowProgress
        this.rowProgress = -Infinity;

        return geohashes
      }

      // Returns all the geohashes that are within the current row
      processRowSegment(coordinates) {
        // Convert coordinates into polygon object
        const segmentPolygon = turfPolygon(coordinates);
        const envelopeBbox = turfBbox(turfEnvelope(segmentPolygon));

        // Most left geohash in box OR the next geohash after current rowProgress
        const startingGeohash = main.encode(
          envelopeBbox[3],
          Math.max(this.rowProgress, envelopeBbox[0] + 0.00001), // Add some small long value to avoid edge cases
          this.options.precision
        );

        const geohashList = [];

        // Checking every geohash in the row from left to right
        let currentGeohash = startingGeohash;

        while (true) {
          const geohashPolygon = turfBboxPolygon(switchBbox(main.decode_bbox(currentGeohash)));

          let addGeohash = false;

          if (this.originalShape.geometry.type === "LineString") {
            // We add every geohash because all segments that come in are envelopes of the relevant line segments
            addGeohash = true;
          } else {
            // Its a polygon
            switch (this.options.hashMode) {
              case "intersect":
                // Only add geohash if they intersect/overlap with the original polygon
                addGeohash = turfBooleanOverlap(segmentPolygon, geohashPolygon);

                if (addGeohash && this.minIntersectArea > 0) {
                  const intersect = turfIntersect(this.originalShape, geohashPolygon);
                  addGeohash = turfArea(intersect) >= this.minIntersectArea;
                }
                break
              case "envelope":
                addGeohash = true; // add every geohash
                break
              case "insideOnly":
                // Only add geohash if it is completely within the original polygon
                addGeohash =
                  turfBooleanWithin(geohashPolygon, this.originalShape) &&
                  allRectangleEdgesWithin(geohashPolygon, this.originalShape);
                // Extra check to avoid turf.js bug
                // REMOVE allRectangleEdgesWithin CHECK IF POSSIBLE -> NEGATIVE PERFORMANCE IMPACT
                break
              case "border":
                // Only add geohash if they overlap
                addGeohash =
                  turfBooleanOverlap(segmentPolygon, geohashPolygon) &&
                  !turfBooleanWithin(geohashPolygon, this.originalShape);
                break
            }
          }

          // Check if geohash polygon overlaps/intersects with original polygon
          // I need to check both because of some weird bug with turf

          // If yes -> add it to the list of geohashes
          if (addGeohash) {
            geohashList.push(currentGeohash);
          }

          // Save rowProgress
          // maxX plus some small amount to avoid overlapping edges due to lat/long inaccuracies
          this.rowProgress = turfBbox(geohashPolygon)[2] + 0.00001;

          const maxX = geohashPolygon.bbox[2];
          if (maxX >= envelopeBbox[2]) {
            // If right edge of current geohash is out of bounds we are done
            currentGeohash = null;
            break
          }

          // Get eastern neighbor and set him as next geohash to be checked
          currentGeohash = main.neighbor(currentGeohash, [0, 1]);
        }

        return geohashList
      }
    }

    var src = shape2geohash;

    var shape2geohash_1 = src;

    function getGeohashAsBBox(geohash) {
      const [minLat, minLon, maxLat, maxLon] = main.decode_bbox(geohash);
      return [minLon, minLat, maxLon, maxLat];
    }
    function feature(geometry, properties) {
      return {
        type: "Feature",
        geometry,
        properties
      };
    }
    function polygon$1(coordinates, properties) {
      return feature({
        type: "Polygon",
        coordinates
      }, properties);
    }

    // src/index.ts
    function geohashToPolygonFeature(geohash, properties = {}) {
      const [minLon, minLat, maxLon, maxLat] = getGeohashAsBBox(geohash);
      const sw = [minLon, minLat];
      const se = [maxLon, minLat];
      const nw = [minLon, maxLat];
      const ne = [maxLon, maxLat];
      const coordinates = [[sw, se, ne, nw, sw]];
      return polygon$1(coordinates, properties);
    }

    /* src\components\Map.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$9 = "src\\components\\Map.svelte";

    function create_fragment$a(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "map");
    			attr_dev(div, "class", "h-96 md:h-full card");
    			add_location(div, file$9, 468, 0, 14449);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Map', slots, []);
    	let { collectionList } = $$props;
    	let { selectedGeohash } = $$props;
    	let { mapStyle } = $$props;
    	let { isReadyForStyleSwitching } = $$props;
    	let { kingstonDetails } = $$props;
    	let { pointOfInterest } = $$props;
    	let layerDictionary;
    	let isDataLoaded = false;
    	let map;
    	const small_popup = new mapboxgl.Popup();

    	const fetchInitialMapData = async () => {
    		try {
    			let tempList = [];
    			let tempDictionary = {};

    			tempList.push({
    				id: 0,
    				menu: 1,
    				icon: "fa-building",
    				type: "Polygon",
    				isShown: true,
    				name: "Buildings",
    				layerName: "add-3d-buildings",
    				sourceName: "building"
    			});

    			tempDictionary["Buildings"] = 0;

    			tempList.push({
    				id: 1,
    				menu: 1,
    				icon: "fa-cloud",
    				type: "Polygon",
    				isShown: true,
    				name: "sky",
    				layerName: "sky",
    				sourceName: "sky"
    			});

    			tempDictionary["Sky"] = 1;

    			// Kingston geohash Data
    			let geohashLayerName = "Kingston Geohash";

    			let geohashSourceName = "geohashSource";
    			let geohashData = await getDataWithAxios(Data.GEOHASH_URL);

    			tempList.push({
    				id: 2,
    				menu: 1,
    				icon: "fa-border-all",
    				type: "Polygon",
    				isShown: true,
    				name: geohashLayerName,
    				layerName: geohashLayerName,
    				sourceName: geohashSourceName,
    				data: geohashData
    			});

    			tempList.push({
    				id: 3,
    				menu: 1,
    				icon: "fa-border-all",
    				type: "Polygon",
    				isShown: false,
    				name: geohashLayerName + " Outline",
    				layerName: geohashLayerName + " Outline",
    				sourceName: geohashSourceName,
    				data: geohashData
    			});

    			tempDictionary["Geohash"] = 2;
    			tempDictionary["Geohash_Outline"] = 3;

    			// // Neighbourhoods Data
    			let neighbourhoodsLayerName = "Neighbourhoods";

    			let neighbourhoodsSourceName = "neighbourhoodsSource";
    			let neighbourhoodsData = await getDataWithAxios(Data.NEIGHBOURHOODS_URL);

    			tempList.push({
    				id: 4,
    				menu: 1,
    				icon: "fa-border-all",
    				type: "Polygon",
    				isShown: false,
    				name: neighbourhoodsLayerName,
    				layerName: neighbourhoodsLayerName,
    				sourceName: neighbourhoodsSourceName,
    				data: neighbourhoodsData
    			});

    			tempList.push({
    				id: 5,
    				menu: 1,
    				icon: "fa-border-all",
    				type: "Polygon",
    				isShown: false,
    				name: neighbourhoodsLayerName + " Outline",
    				layerName: neighbourhoodsLayerName + " Outline",
    				sourceName: neighbourhoodsSourceName,
    				data: neighbourhoodsData
    			});

    			tempDictionary["Neighbourhoods"] = 4;
    			tempDictionary["Neighbourhoods_Outline"] = 5;
    			let treesLayerName = "Trees";
    			let treesSourceName = "treesSource";
    			let treesData = await getDataWithAxios(Data.TREES_URL);

    			tempList.push({
    				id: 6,
    				icon: "fa-tree",
    				type: "Point",
    				isShown: true,
    				name: treesLayerName,
    				layerName: treesLayerName,
    				sourceName: treesSourceName,
    				data: treesData
    			});

    			tempDictionary["Trees"] = 6;
    			$$invalidate(0, collectionList = tempList);
    			layerDictionary = tempDictionary;
    			console.log(layerDictionary);
    		} catch(e) {
    			
    		}
    	};

    	const addDataSources = () => {
    		try {
    			const geohashList = collectionList[layerDictionary["Geohash"]];
    			map.addSource(geohashList.sourceName, { type: "geojson", data: geohashList.data });
    			const neighbourhoodsList = collectionList[layerDictionary["Neighbourhoods"]];

    			map.addSource(neighbourhoodsList.sourceName, {
    				type: "geojson",
    				data: neighbourhoodsList.data
    			});

    			const treesList = collectionList[layerDictionary["Trees"]];
    			map.addSource(treesList.sourceName, { type: "geojson", data: treesList.data });
    			$$invalidate(6, isDataLoaded = true);
    			addLayers();
    		} catch(e) {
    			console.error(e);
    		}
    	};

    	const addLayers = () => {
    		addTerrainLayer();
    		addBuildingLayer(collectionList[layerDictionary["Buildings"]]);
    		addKingstonGeohashLayer(collectionList[layerDictionary["Geohash"]], collectionList[layerDictionary["Geohash_Outline"]]);
    		addNeighbourhoodsLayer(collectionList[layerDictionary["Neighbourhoods"]], collectionList[layerDictionary["Neighbourhoods_Outline"]]);
    		const treesList = collectionList[layerDictionary["Trees"]];
    		addTreesLayer(treesList);
    	};

    	const addTerrainLayer = () => {
    		map.addSource("mapbox-dem", {
    			type: "raster-dem",
    			url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    			tileSize: 512,
    			maxzoom: 14
    		});

    		// add the DEM source as a terrain layer with exaggerated height
    		map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    		// add a sky layer that will show when the map is highly pitched
    		map.addLayer({
    			id: "sky",
    			type: "sky",
    			paint: {
    				"sky-type": "atmosphere",
    				"sky-atmosphere-sun": [0.0, 0.0],
    				"sky-atmosphere-sun-intensity": 15
    			}
    		});
    	};

    	const addBuildingLayer = fillList => {
    		map.addLayer({
    			id: fillList.layerName,
    			source: "composite",
    			"source-layer": "building",
    			filter: ["==", "extrude", "true"],
    			type: "fill-extrusion",
    			minzoom: 15,
    			paint: {
    				"fill-extrusion-color": "#dee7e7",
    				"fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
    				"fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
    				"fill-extrusion-opacity": 1
    			}
    		});
    	};

    	const addKingstonGeohashLayer = (fillList, outlineList) => {
    		map.addLayer({
    			id: fillList.layerName,
    			type: "fill",
    			source: fillList.sourceName,
    			layout: {},
    			paint: {
    				"fill-color": ["get", "fill"], // blue color fill
    				"fill-opacity": [
    					"case",
    					["boolean", ["feature-state", "clicked"], false],
    					0.5,
    					["case", ["boolean", ["feature-state", "hover"], false], 0.5, 0.0]
    				]
    			}
    		});

    		map.setLayoutProperty(fillList.layerName, "visibility", "none");
    		let clickedStateId = null;
    		let hoveredStateId = null;

    		map.on("click", fillList.layerName, e => {
    			if (clickedStateId !== null) {
    				map.setFeatureState(
    					{
    						source: fillList.sourceName,
    						id: clickedStateId
    					},
    					{ clicked: false }
    				);
    			}

    			clickedStateId = e.features[0].id;

    			map.setFeatureState(
    				{
    					source: fillList.sourceName,
    					id: clickedStateId
    				},
    				{ clicked: true }
    			);
    			const sliced = Object.fromEntries(Object.entries(e.features[0].properties).slice(0, 6));

    			for (const [key, value] of Object.entries(sliced)) {
    			}

    			$$invalidate(1, selectedGeohash = e.features[0].properties.geohash_list);
    		});

    		map.on("mousemove", fillList.layerName, e => {
    			if (e.features.length > 0) {
    				if (hoveredStateId !== null) {
    					map.setFeatureState(
    						{
    							source: fillList.sourceName,
    							id: hoveredStateId
    						},
    						{ hover: false }
    					);
    				}

    				hoveredStateId = e.features[0].id;

    				map.setFeatureState(
    					{
    						source: fillList.sourceName,
    						id: hoveredStateId
    					},
    					{ hover: true }
    				);
    			}
    		});

    		map.on("mouseleave", fillList.layerName, () => {
    			if (hoveredStateId !== null) {
    				map.setFeatureState(
    					{
    						source: fillList.sourceName,
    						id: hoveredStateId
    					},
    					{ hover: false }
    				);
    			}

    			hoveredStateId = null;
    		});

    		map.addLayer({
    			id: outlineList.layerName,
    			type: "line",
    			source: outlineList.sourceName,
    			layout: {},
    			paint: { "line-color": "#0083b7", "line-width": 1 }
    		});

    		map.setLayoutProperty(outlineList.layerName, "visibility", "none");
    	};

    	const addNeighbourhoodsLayer = (fillList, outlineList) => {
    		map.addLayer({
    			id: fillList.layerName,
    			type: "fill",
    			source: fillList.sourceName,
    			layout: {},
    			paint: {
    				"fill-color": ["get", "fill"],
    				"fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 0.2]
    			}
    		});

    		map.setLayoutProperty(fillList.layerName, "visibility", "none");

    		map.addLayer({
    			id: outlineList.layerName,
    			type: "line",
    			source: outlineList.sourceName,
    			layout: {},
    			paint: { "line-color": "#ffffff", "line-width": 1 }
    		});

    		map.setLayoutProperty(outlineList.layerName, "visibility", "none");
    		let hoveredStateId = null;

    		map.on("mousemove", fillList.layerName, e => {
    			if (e.features.length > 0) {
    				if (hoveredStateId !== null) {
    					map.setFeatureState(
    						{
    							source: fillList.sourceName,
    							id: hoveredStateId
    						},
    						{ hover: false }
    					);
    				}

    				hoveredStateId = e.features[0].id;

    				map.setFeatureState(
    					{
    						source: fillList.sourceName,
    						id: hoveredStateId
    					},
    					{ hover: true }
    				);
    			}
    		});

    		map.on("mouseleave", fillList.layerName, () => {
    			if (hoveredStateId !== null) {
    				map.setFeatureState(
    					{
    						source: fillList.sourceName,
    						id: hoveredStateId
    					},
    					{ hover: false }
    				);
    			}

    			hoveredStateId = null;
    		});
    	};

    	const addTreesLayer = fillList => {
    		map.addLayer(
    			{
    				id: fillList.layerName,
    				type: "circle",
    				source: fillList.sourceName,
    				minzoom: 12,
    				paint: {
    					"circle-radius": [
    						"interpolate",
    						["linear"],
    						["zoom"],
    						7,
    						["interpolate", ["linear"], ["get", "trunk_diameter"], 1, 2, 3, 4],
    						16,
    						["interpolate", ["linear"], ["get", "trunk_diameter"], 3, 6, 9, 12]
    					],
    					"circle-color": "green"
    				}
    			},
    			"waterway-label"
    		);

    		map.setLayoutProperty(fillList.layerName, "visibility", "none");
    		map.moveLayer(fillList.layerName);

    		map.on("click", fillList.layerName, e => {
    			let description = "";
    			const sliced = Object.fromEntries(Object.entries(e.features[0].properties).slice(0, 4));

    			for (const [key, value] of Object.entries(sliced)) {
    				description += `<span class="block font-bold">${key}</span><span class="block">${value}</span>`;
    			}

    			small_popup.setLngLat(e.lngLat).setHTML(description).addTo(map);

    			$$invalidate(2, pointOfInterest = {
    				lat: e.lngLat["lat"],
    				lng: e.lngLat["lng"]
    			});
    		});

    		// Change the cursor to a pointer when the mouse is over the places layer.
    		map.on("mouseenter", fillList.layerName, e => {
    			map.getCanvas().style.cursor = "pointer";
    		});

    		// Change it back to a pointer when it leaves.
    		map.on("mouseleave", fillList.layerName, () => {
    			map.getCanvas().style.cursor = "";
    		});
    	};

    	const addLineLayer = (fillList, color) => {
    		map.addLayer({
    			id: fillList.layerName,
    			type: "line",
    			source: fillList.sourceName,
    			layout: {
    				"line-join": "round",
    				"line-cap": "round"
    			},
    			paint: { "line-color": color, "line-width": 4 }
    		});

    		map.on("click", fillList.layerName, e => {
    			let description = "";
    			const sliced = Object.fromEntries(Object.entries(e.features[0].properties).slice(0, 4));

    			for (const [key, value] of Object.entries(sliced)) {
    				description += `<span class="block font-bold">${key}</span><span class="block">${value}</span>`;
    			}

    			small_popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
    		});

    		// Change the cursor to a pointer when the mouse is over the places layer.
    		map.on("mouseenter", fillList.layerName, e => {
    			map.getCanvas().style.cursor = "pointer";
    		});

    		// Change it back to a pointer when it leaves.
    		map.on("mouseleave", fillList.layerName, () => {
    			map.getCanvas().style.cursor = "";
    		});
    	};

    	const addFilter = () => {
    		// If map not loaded, abort
    		if (map === null) return;

    		try {
    			// If any of the layers are not loaded, abort
    			for (let i = 0; i < collectionList.length; i++) {
    				const tempLayerName = collectionList[i]["layerName"];
    				const tempLayerIsShown = collectionList[i]["isShown"];

    				if (!map.getLayer(tempLayerName)) {
    					return;
    				}

    				if (tempLayerIsShown === true) {
    					map.setLayoutProperty(tempLayerName, "visibility", "visible");
    				} else {
    					map.setLayoutProperty(tempLayerName, "visibility", "none");
    				}

    				if (tempLayerName.includes("Trees") && tempLayerIsShown === false) {
    					small_popup.remove();
    				}
    			}
    		} catch(e) {
    			
    		}
    	};

    	const switchStyle = () => {
    		if (isReadyForStyleSwitching === false) return;

    		try {
    			map.setStyle("mapbox://styles/mapbox/" + mapStyle);
    			small_popup.remove();
    			$$invalidate(1, selectedGeohash = null);
    		} catch(e) {
    			
    		}
    	};

    	const createGeohashes = async ({ features }) => {
    		console.log(features[0]);

    		geohashpoly({ coords: polygon, precision: 7 }, function (err, hashes) {
    			console.log(hashes);
    		});
    	};

    	onMount(async () => {
    		// Get the initial Data
    		await fetchInitialMapData();

    		mapboxgl.accessToken = "pk.eyJ1IjoiY2FuYWxlYWwiLCJhIjoiY2t6NmgzdGd0MTBhcTJ3bXprNjM1a3NsbiJ9.umUsk2Ky68kLBFUa6PeAxA";

    		map = new mapboxgl.Map({
    				center: kingstonDetails.center,
    				zoom: kingstonDetails.zoom,
    				pitch: kingstonDetails.pitch,
    				bearing: kingstonDetails.bearing,
    				container: "map",
    				antialias: true,
    				style: "mapbox://styles/mapbox/" + mapStyle
    			});

    		const draw = new mapboxGlDraw({
    				displayControlsDefault: false,
    				// Select which mapbox-gl-draw control buttons to add to the map.
    				controls: { polygon: true, trash: true },
    				// Set mapbox-gl-draw to draw by default.
    				// The user does not have to click the polygon control button first.
    				defaultMode: "draw_polygon"
    			});

    		map.addControl(draw, "bottom-left");

    		map.addControl(new MapboxGeocoder({
    				accessToken: mapboxgl.accessToken,
    				mapboxgl
    			}));

    		map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
    		map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    		map.on("style.load", function () {
    			addDataSources();
    			addFilter();
    		});

    		map.on("draw.create", createGeohashes);
    	});

    	onDestroy(() => {
    		try {
    			// Remove all the layers and data sources as they are cached and take up a lot of memory
    			for (let i = 0; i < collectionList.length; i++) {
    				map.removeLayer(collectionList[i]["layerName"]);
    				map.removeSource(collectionList[i]["sourceName"]);
    			}

    			map = null;
    		} catch(e) {
    			
    		}
    	});

    	const writable_props = [
    		'collectionList',
    		'selectedGeohash',
    		'mapStyle',
    		'isReadyForStyleSwitching',
    		'kingstonDetails',
    		'pointOfInterest'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('collectionList' in $$props) $$invalidate(0, collectionList = $$props.collectionList);
    		if ('selectedGeohash' in $$props) $$invalidate(1, selectedGeohash = $$props.selectedGeohash);
    		if ('mapStyle' in $$props) $$invalidate(3, mapStyle = $$props.mapStyle);
    		if ('isReadyForStyleSwitching' in $$props) $$invalidate(4, isReadyForStyleSwitching = $$props.isReadyForStyleSwitching);
    		if ('kingstonDetails' in $$props) $$invalidate(5, kingstonDetails = $$props.kingstonDetails);
    		if ('pointOfInterest' in $$props) $$invalidate(2, pointOfInterest = $$props.pointOfInterest);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		getDataWithAxios,
    		Data,
    		getListOfObjectWhereKeyContainsString,
    		MapboxDraw: mapboxGlDraw,
    		shape2geohash: shape2geohash_1,
    		geohashToPolygonFeature,
    		collectionList,
    		selectedGeohash,
    		mapStyle,
    		isReadyForStyleSwitching,
    		kingstonDetails,
    		pointOfInterest,
    		layerDictionary,
    		isDataLoaded,
    		map,
    		small_popup,
    		fetchInitialMapData,
    		addDataSources,
    		addLayers,
    		addTerrainLayer,
    		addBuildingLayer,
    		addKingstonGeohashLayer,
    		addNeighbourhoodsLayer,
    		addTreesLayer,
    		addLineLayer,
    		addFilter,
    		switchStyle,
    		createGeohashes
    	});

    	$$self.$inject_state = $$props => {
    		if ('collectionList' in $$props) $$invalidate(0, collectionList = $$props.collectionList);
    		if ('selectedGeohash' in $$props) $$invalidate(1, selectedGeohash = $$props.selectedGeohash);
    		if ('mapStyle' in $$props) $$invalidate(3, mapStyle = $$props.mapStyle);
    		if ('isReadyForStyleSwitching' in $$props) $$invalidate(4, isReadyForStyleSwitching = $$props.isReadyForStyleSwitching);
    		if ('kingstonDetails' in $$props) $$invalidate(5, kingstonDetails = $$props.kingstonDetails);
    		if ('pointOfInterest' in $$props) $$invalidate(2, pointOfInterest = $$props.pointOfInterest);
    		if ('layerDictionary' in $$props) layerDictionary = $$props.layerDictionary;
    		if ('isDataLoaded' in $$props) $$invalidate(6, isDataLoaded = $$props.isDataLoaded);
    		if ('map' in $$props) map = $$props.map;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*collectionList, isDataLoaded*/ 65) {
    			collectionList && isDataLoaded && addFilter();
    		}

    		if ($$self.$$.dirty & /*mapStyle, isDataLoaded*/ 72) {
    			mapStyle && isDataLoaded && switchStyle();
    		}
    	};

    	return [
    		collectionList,
    		selectedGeohash,
    		pointOfInterest,
    		mapStyle,
    		isReadyForStyleSwitching,
    		kingstonDetails,
    		isDataLoaded
    	];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			collectionList: 0,
    			selectedGeohash: 1,
    			mapStyle: 3,
    			isReadyForStyleSwitching: 4,
    			kingstonDetails: 5,
    			pointOfInterest: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*collectionList*/ ctx[0] === undefined && !('collectionList' in props)) {
    			console_1.warn("<Map> was created without expected prop 'collectionList'");
    		}

    		if (/*selectedGeohash*/ ctx[1] === undefined && !('selectedGeohash' in props)) {
    			console_1.warn("<Map> was created without expected prop 'selectedGeohash'");
    		}

    		if (/*mapStyle*/ ctx[3] === undefined && !('mapStyle' in props)) {
    			console_1.warn("<Map> was created without expected prop 'mapStyle'");
    		}

    		if (/*isReadyForStyleSwitching*/ ctx[4] === undefined && !('isReadyForStyleSwitching' in props)) {
    			console_1.warn("<Map> was created without expected prop 'isReadyForStyleSwitching'");
    		}

    		if (/*kingstonDetails*/ ctx[5] === undefined && !('kingstonDetails' in props)) {
    			console_1.warn("<Map> was created without expected prop 'kingstonDetails'");
    		}

    		if (/*pointOfInterest*/ ctx[2] === undefined && !('pointOfInterest' in props)) {
    			console_1.warn("<Map> was created without expected prop 'pointOfInterest'");
    		}
    	}

    	get collectionList() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collectionList(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedGeohash() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedGeohash(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mapStyle() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mapStyle(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isReadyForStyleSwitching() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isReadyForStyleSwitching(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get kingstonDetails() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kingstonDetails(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointOfInterest() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointOfInterest(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const getCurrentDateTime = () => {
      const currentDate = new Date();
      const currentDateTime = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

      return currentDateTime;
    };

    const getCurrentDateInYYYYMMDD = () => {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const yyyy = today.getFullYear();
      return `${yyyy}-${mm}-${dd}`;
    };

    const getCurrentTime = () => {
      const currentDate = new Date();
      const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;
      return currentTime;
    };

    /* src\components\AttentionBar.svelte generated by Svelte v3.48.0 */
    const file$8 = "src\\components\\AttentionBar.svelte";

    function create_fragment$9(ctx) {
    	let section1;
    	let div0;
    	let p;
    	let span;
    	let t1;
    	let t2_value = getCurrentDateTime() + "";
    	let t2;
    	let t3;
    	let section0;
    	let div1;
    	let t4;
    	let div2;
    	let button0;
    	let t5;
    	let button0_class_value;
    	let t6;
    	let div3;
    	let button1;
    	let t7;
    	let button1_class_value;
    	let t8;
    	let div4;
    	let button2;
    	let t9;
    	let button2_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			div0 = element("div");
    			p = element("p");
    			span = element("span");
    			span.textContent = "Last Updated :";
    			t1 = text(" Fetch to API on ");
    			t2 = text(t2_value);
    			t3 = space();
    			section0 = element("section");
    			div1 = element("div");
    			t4 = space();
    			div2 = element("div");
    			button0 = element("button");
    			t5 = text("Date Time View");
    			t6 = space();
    			div3 = element("div");
    			button1 = element("button");
    			t7 = text("Street View");
    			t8 = space();
    			div4 = element("div");
    			button2 = element("button");
    			t9 = text("Chart View");
    			attr_dev(span, "class", "font-bold");
    			add_location(span, file$8, 7, 32, 211);
    			attr_dev(p, "class", "text-white text-sm");
    			add_location(p, file$8, 7, 2, 181);
    			attr_dev(div0, "class", "bg-blue py-1 px-5");
    			add_location(div0, file$8, 6, 1, 146);
    			attr_dev(div1, "class", "col-span-1 md:col-span-3 row-span-1 ");
    			add_location(div1, file$8, 11, 2, 398);
    			attr_dev(button0, "class", button0_class_value = `card-btn ${/*selectedMenu*/ ctx[0] == 1 ? "card-btn-green" : ""} my-1 `);
    			add_location(button0, file$8, 13, 3, 509);
    			attr_dev(div2, "class", "col-span-1 md:col-span-3 row-span-1 ");
    			add_location(div2, file$8, 12, 2, 454);
    			attr_dev(button1, "class", button1_class_value = `card-btn ${/*selectedMenu*/ ctx[0] == 2 ? "card-btn-green" : ""} my-1 `);
    			add_location(button1, file$8, 16, 3, 716);
    			attr_dev(div3, "class", "col-span-1 md:col-span-3 row-span-1");
    			add_location(div3, file$8, 15, 2, 662);
    			attr_dev(button2, "class", button2_class_value = `card-btn ${/*selectedMenu*/ ctx[0] == 3 ? "card-btn-green" : ""} my-1 `);
    			add_location(button2, file$8, 19, 3, 920);
    			attr_dev(div4, "class", "col-span-1 md:col-span-3 row-span-1");
    			add_location(div4, file$8, 18, 2, 866);
    			attr_dev(section0, "class", "grid grid-cols-1 md:grid-cols-12 grid-rows-1 gap-4 px-4 h-fit");
    			add_location(section0, file$8, 10, 1, 313);
    			attr_dev(section1, "class", "sticky top-0 z-10");
    			add_location(section1, file$8, 5, 0, 107);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div0);
    			append_dev(div0, p);
    			append_dev(p, span);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(section1, t3);
    			append_dev(section1, section0);
    			append_dev(section0, div1);
    			append_dev(section0, t4);
    			append_dev(section0, div2);
    			append_dev(div2, button0);
    			append_dev(button0, t5);
    			append_dev(section0, t6);
    			append_dev(section0, div3);
    			append_dev(div3, button1);
    			append_dev(button1, t7);
    			append_dev(section0, t8);
    			append_dev(section0, div4);
    			append_dev(div4, button2);
    			append_dev(button2, t9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedMenu*/ 1 && button0_class_value !== (button0_class_value = `card-btn ${/*selectedMenu*/ ctx[0] == 1 ? "card-btn-green" : ""} my-1 `)) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty & /*selectedMenu*/ 1 && button1_class_value !== (button1_class_value = `card-btn ${/*selectedMenu*/ ctx[0] == 2 ? "card-btn-green" : ""} my-1 `)) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (dirty & /*selectedMenu*/ 1 && button2_class_value !== (button2_class_value = `card-btn ${/*selectedMenu*/ ctx[0] == 3 ? "card-btn-green" : ""} my-1 `)) {
    				attr_dev(button2, "class", button2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AttentionBar', slots, []);
    	let { selectedMenu } = $$props;
    	const writable_props = ['selectedMenu'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AttentionBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, selectedMenu = 1);
    	const click_handler_1 = () => $$invalidate(0, selectedMenu = 2);
    	const click_handler_2 = () => $$invalidate(0, selectedMenu = 3);

    	$$self.$$set = $$props => {
    		if ('selectedMenu' in $$props) $$invalidate(0, selectedMenu = $$props.selectedMenu);
    	};

    	$$self.$capture_state = () => ({ getCurrentDateTime, selectedMenu });

    	$$self.$inject_state = $$props => {
    		if ('selectedMenu' in $$props) $$invalidate(0, selectedMenu = $$props.selectedMenu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedMenu, click_handler, click_handler_1, click_handler_2];
    }

    class AttentionBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { selectedMenu: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AttentionBar",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedMenu*/ ctx[0] === undefined && !('selectedMenu' in props)) {
    			console.warn("<AttentionBar> was created without expected prop 'selectedMenu'");
    		}
    	}

    	get selectedMenu() {
    		throw new Error("<AttentionBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedMenu(value) {
    		throw new Error("<AttentionBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Profile.svelte generated by Svelte v3.48.0 */
    const file$7 = "src\\components\\Profile.svelte";

    // (16:1) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let button;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*selectedGeohash*/ ctx[0]);
    			t1 = space();
    			button = element("button");
    			i = element("i");
    			attr_dev(i, "class", "fa-solid fa-xmark ");
    			add_location(i, file$7, 17, 87, 569);
    			attr_dev(button, "class", "float-right fa-lg");
    			add_location(button, file$7, 17, 21, 503);
    			attr_dev(div, "class", "alert alert-green my-1");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$7, 16, 2, 431);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*clearSelectedGeohash*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedGeohash*/ 1) set_data_dev(t0, /*selectedGeohash*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(16:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:1) {#if selectedGeohash === null}
    function create_if_block$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Select a Geohash before Searching.";
    			attr_dev(div, "class", "alert alert-red my-1");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$7, 14, 2, 330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(14:1) {#if selectedGeohash === null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let p0;
    	let t1;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t5_value = /*kingstonDetails*/ ctx[1].displayName + "";
    	let t5;
    	let t6;
    	let p3;
    	let t8;
    	let p4;

    	function select_block_type(ctx, dirty) {
    		if (/*selectedGeohash*/ ctx[0] === null) return create_if_block$4;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			p0 = element("p");
    			p0.textContent = "Selected Geohash:";
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "City:";
    			t4 = space();
    			p2 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			p3 = element("p");
    			p3.textContent = "Map Data:";
    			t8 = space();
    			p4 = element("p");
    			p4.textContent = `Data taken from API on ${getCurrentDateTime()}`;
    			attr_dev(p0, "class", "font-bold my-1");
    			add_location(p0, file$7, 11, 1, 244);
    			attr_dev(p1, "class", "font-bold my-1");
    			add_location(p1, file$7, 21, 1, 633);
    			add_location(p2, file$7, 22, 1, 671);
    			attr_dev(p3, "class", "font-bold my-1");
    			add_location(p3, file$7, 24, 1, 712);
    			add_location(p4, file$7, 25, 1, 754);
    			attr_dev(section, "class", "card h-fit");
    			add_location(section, file$7, 10, 0, 213);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p0);
    			append_dev(section, t1);
    			if_block.m(section, null);
    			append_dev(section, t2);
    			append_dev(section, p1);
    			append_dev(section, t4);
    			append_dev(section, p2);
    			append_dev(p2, t5);
    			append_dev(section, t6);
    			append_dev(section, p3);
    			append_dev(section, t8);
    			append_dev(section, p4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, t2);
    				}
    			}

    			if (dirty & /*kingstonDetails*/ 2 && t5_value !== (t5_value = /*kingstonDetails*/ ctx[1].displayName + "")) set_data_dev(t5, t5_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Profile', slots, []);
    	let { kingstonDetails } = $$props;
    	let { selectedGeohash } = $$props;

    	const clearSelectedGeohash = () => {
    		$$invalidate(0, selectedGeohash = null);
    	};

    	const writable_props = ['kingstonDetails', 'selectedGeohash'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('kingstonDetails' in $$props) $$invalidate(1, kingstonDetails = $$props.kingstonDetails);
    		if ('selectedGeohash' in $$props) $$invalidate(0, selectedGeohash = $$props.selectedGeohash);
    	};

    	$$self.$capture_state = () => ({
    		getCurrentDateTime,
    		kingstonDetails,
    		selectedGeohash,
    		clearSelectedGeohash
    	});

    	$$self.$inject_state = $$props => {
    		if ('kingstonDetails' in $$props) $$invalidate(1, kingstonDetails = $$props.kingstonDetails);
    		if ('selectedGeohash' in $$props) $$invalidate(0, selectedGeohash = $$props.selectedGeohash);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedGeohash, kingstonDetails, clearSelectedGeohash];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { kingstonDetails: 1, selectedGeohash: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*kingstonDetails*/ ctx[1] === undefined && !('kingstonDetails' in props)) {
    			console.warn("<Profile> was created without expected prop 'kingstonDetails'");
    		}

    		if (/*selectedGeohash*/ ctx[0] === undefined && !('selectedGeohash' in props)) {
    			console.warn("<Profile> was created without expected prop 'selectedGeohash'");
    		}
    	}

    	get kingstonDetails() {
    		throw new Error("<Profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kingstonDetails(value) {
    		throw new Error("<Profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedGeohash() {
    		throw new Error("<Profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedGeohash(value) {
    		throw new Error("<Profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\DateTime.svelte generated by Svelte v3.48.0 */

    const file$6 = "src\\components\\DateTime.svelte";

    // (46:1) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let button;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*selectedDate*/ ctx[0]);
    			t1 = text(" at ");
    			t2 = text(/*selectedTime*/ ctx[1]);
    			t3 = space();
    			button = element("button");
    			i = element("i");
    			attr_dev(i, "class", "fa-solid fa-xmark ");
    			add_location(i, file$6, 47, 95, 1877);
    			attr_dev(button, "class", "float-right fa-lg");
    			add_location(button, file$6, 47, 36, 1818);
    			attr_dev(div, "class", "alert alert-green my-1");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$6, 46, 2, 1731);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, button);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*clearDateTime*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedDate*/ 1) set_data_dev(t0, /*selectedDate*/ ctx[0]);
    			if (dirty & /*selectedTime*/ 2) set_data_dev(t2, /*selectedTime*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(46:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:1) {#if selectedDate === "" || selectedTime === ""}
    function create_if_block$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Select a Date and Time before Searching.";
    			attr_dev(div, "class", "alert alert-red my-1");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$6, 44, 2, 1624);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(44:1) {#if selectedDate === \\\"\\\" || selectedTime === \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let p;
    	let t1;
    	let div1;
    	let div0;
    	let input0;
    	let t2;
    	let label0;
    	let t4;
    	let div3;
    	let div2;
    	let input1;
    	let t5;
    	let label1;
    	let t7;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*selectedDate*/ ctx[0] === "" || /*selectedTime*/ ctx[1] === "") return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			p = element("p");
    			p.textContent = "Date Time Selection:";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "Select a date";
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			input1 = element("input");
    			t5 = space();
    			label1 = element("label");
    			label1.textContent = "Select a time";
    			t7 = space();
    			if_block.c();
    			attr_dev(p, "class", "font-bold my-1");
    			add_location(p, file$6, 11, 1, 219);
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "class", "form-control block w-full text-sm text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none");
    			attr_dev(input0, "placeholder", "Select a date");
    			attr_dev(input0, "data-mdb-toggle", "datepicker");
    			attr_dev(input0, "min", "2010-01-01");
    			attr_dev(input0, "max", "2022-12-31");
    			add_location(input0, file$6, 15, 3, 410);
    			attr_dev(label0, "for", "floatingInput");
    			attr_dev(label0, "class", "text-gray-700 text-sm");
    			add_location(label0, file$6, 24, 3, 820);
    			attr_dev(div0, "class", "datepicker form-floating my-1 w-full");
    			attr_dev(div0, "data-mdb-toggle-button", "false");
    			add_location(div0, file$6, 14, 2, 324);
    			attr_dev(div1, "class", "flex items-center justify-center");
    			add_location(div1, file$6, 13, 1, 274);
    			attr_dev(input1, "type", "time");
    			attr_dev(input1, "class", "form-control block w-full text-sm text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none");
    			attr_dev(input1, "placeholder", "Select a time");
    			attr_dev(input1, "data-mdb-toggle", "timepicker");
    			attr_dev(input1, "min", "2010-01-01");
    			attr_dev(input1, "max", "2022-12-31");
    			add_location(input1, file$6, 30, 3, 1059);
    			attr_dev(label1, "for", "floatingInput");
    			attr_dev(label1, "class", "text-gray-700 text-sm");
    			add_location(label1, file$6, 39, 3, 1469);
    			attr_dev(div2, "class", "datepicker form-floating my-1 w-full");
    			attr_dev(div2, "data-mdb-toggle-button", "false");
    			add_location(div2, file$6, 29, 2, 973);
    			attr_dev(div3, "class", "flex items-center justify-center");
    			add_location(div3, file$6, 28, 1, 923);
    			attr_dev(section, "class", "h-fit rounded-lg shadow-xl p-4 text-sm");
    			add_location(section, file$6, 10, 0, 160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p);
    			append_dev(section, t1);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*selectedDate*/ ctx[0]);
    			append_dev(div0, t2);
    			append_dev(div0, label0);
    			append_dev(section, t4);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*selectedTime*/ ctx[1]);
    			append_dev(div2, t5);
    			append_dev(div2, label1);
    			append_dev(section, t7);
    			if_block.m(section, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedDate*/ 1) {
    				set_input_value(input0, /*selectedDate*/ ctx[0]);
    			}

    			if (dirty & /*selectedTime*/ 2) {
    				set_input_value(input1, /*selectedTime*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DateTime', slots, []);
    	let { selectedDate } = $$props;
    	let { selectedTime } = $$props;

    	const clearDateTime = () => {
    		$$invalidate(0, selectedDate = "");
    		$$invalidate(1, selectedTime = "");
    	};

    	const writable_props = ['selectedDate', 'selectedTime'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DateTime> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		selectedDate = this.value;
    		$$invalidate(0, selectedDate);
    	}

    	function input1_input_handler() {
    		selectedTime = this.value;
    		$$invalidate(1, selectedTime);
    	}

    	$$self.$$set = $$props => {
    		if ('selectedDate' in $$props) $$invalidate(0, selectedDate = $$props.selectedDate);
    		if ('selectedTime' in $$props) $$invalidate(1, selectedTime = $$props.selectedTime);
    	};

    	$$self.$capture_state = () => ({
    		selectedDate,
    		selectedTime,
    		clearDateTime
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedDate' in $$props) $$invalidate(0, selectedDate = $$props.selectedDate);
    		if ('selectedTime' in $$props) $$invalidate(1, selectedTime = $$props.selectedTime);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedDate,
    		selectedTime,
    		clearDateTime,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class DateTime extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { selectedDate: 0, selectedTime: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DateTime",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedDate*/ ctx[0] === undefined && !('selectedDate' in props)) {
    			console.warn("<DateTime> was created without expected prop 'selectedDate'");
    		}

    		if (/*selectedTime*/ ctx[1] === undefined && !('selectedTime' in props)) {
    			console.warn("<DateTime> was created without expected prop 'selectedTime'");
    		}
    	}

    	get selectedDate() {
    		throw new Error("<DateTime>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedDate(value) {
    		throw new Error("<DateTime>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedTime() {
    		throw new Error("<DateTime>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedTime(value) {
    		throw new Error("<DateTime>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Layers.svelte generated by Svelte v3.48.0 */

    const file$5 = "src\\components\\Layers.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (66:1) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Loading Data.";
    			attr_dev(div, "class", "bg-green-100 rounded-lg py-4 px-6 text-green-700 my-1");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$5, 66, 2, 2036);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(66:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:1) {#if collectionList.length >= 1}
    function create_if_block$2(ctx) {
    	let button;
    	let t0;
    	let button_class_value;
    	let t1;
    	let div;
    	let mounted;
    	let dispose;
    	let each_value = /*collectionList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(/*toggleName*/ ctx[2]);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "class", button_class_value = `card-btn   ${/*toggleBool*/ ctx[1]
			? "card-btn-green"
			: "card-btn-red"}  my-1 `);

    			add_location(button, file$5, 56, 2, 1583);
    			attr_dev(div, "class", "overflow-auto ");
    			add_location(div, file$5, 57, 2, 1725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*toggleName*/ 4) set_data_dev(t0, /*toggleName*/ ctx[2]);

    			if (dirty & /*toggleBool*/ 2 && button_class_value !== (button_class_value = `card-btn   ${/*toggleBool*/ ctx[1]
			? "card-btn-green"
			: "card-btn-red"}  my-1 `)) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*collectionList, toggleIsShown*/ 17) {
    				each_value = /*collectionList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(56:1) {#if collectionList.length >= 1}",
    		ctx
    	});

    	return block;
    }

    // (59:3) {#each collectionList as layer}
    function create_each_block$1(ctx) {
    	let button;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = /*layer*/ ctx[8].name + "";
    	let t1;
    	let t2;
    	let button_key_value;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[6](/*layer*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(i, "class", i_class_value = "fa-solid " + /*layer*/ ctx[8].icon + "");
    			add_location(i, file$5, 60, 5, 1930);
    			attr_dev(button, "key", button_key_value = /*layer*/ ctx[8].name);
    			attr_dev(button, "class", button_class_value = `card-btn ${/*layer*/ ctx[8].isShown ? "card-btn-blue" : ""} my-1 `);
    			add_location(button, file$5, 59, 4, 1795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			append_dev(button, t2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*collectionList*/ 1 && i_class_value !== (i_class_value = "fa-solid " + /*layer*/ ctx[8].icon + "")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*collectionList*/ 1 && t1_value !== (t1_value = /*layer*/ ctx[8].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*collectionList*/ 1 && button_key_value !== (button_key_value = /*layer*/ ctx[8].name)) {
    				attr_dev(button, "key", button_key_value);
    			}

    			if (dirty & /*collectionList*/ 1 && button_class_value !== (button_class_value = `card-btn ${/*layer*/ ctx[8].isShown ? "card-btn-blue" : ""} my-1 `)) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(59:3) {#each collectionList as layer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let p;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*collectionList*/ ctx[0].length >= 1) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			p = element("p");
    			p.textContent = "Layers:";
    			t1 = space();
    			if_block.c();
    			attr_dev(p, "class", "font-bold my-1");
    			add_location(p, file$5, 53, 1, 1505);
    			attr_dev(section, "class", "card h-fit");
    			add_location(section, file$5, 52, 0, 1474);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p);
    			append_dev(section, t1);
    			if_block.m(section, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Layers', slots, []);
    	let { collectionList = [] } = $$props;
    	let toggleBool = false;
    	let toggleName = "Disable All";

    	function toggleAll() {
    		try {
    			//Change all the isShow values to true or false
    			let tempCollection = collectionList;

    			tempCollection = tempCollection.map(item => {
    				item["isShown"] = toggleBool;
    				return item;
    			});

    			$$invalidate(1, toggleBool = !toggleBool);
    			$$invalidate(2, toggleName = toggleBool ? "Show All" : "Disable All");
    			$$invalidate(0, collectionList = tempCollection);
    		} catch(e) {
    			
    		}
    	}

    	function toggleIsShown(item) {
    		try {
    			// Get the object from the list and toggle the is shown
    			let tempCollection = collectionList;

    			let objIndex = tempCollection.findIndex(obj => obj.id == item["id"]);
    			tempCollection[objIndex]["isShown"] = !tempCollection[objIndex]["isShown"];
    			$$invalidate(0, collectionList = tempCollection);
    			allToggleButton();
    		} catch(e) {
    			
    		}
    	}

    	const allToggleButton = () => {
    		// Get a list of all the is shown values and check if they are all the same
    		let tempCollection = collectionList;

    		const isShownList = tempCollection.map(item => item["isShown"]);
    		const allSame = isShownList.every((element, index, isShownList) => element === isShownList[0]);

    		// If they are all the same, change the toggle
    		if (allSame === true) {
    			if (isShownList[0] === true) {
    				$$invalidate(1, toggleBool = false);
    				$$invalidate(2, toggleName = "Disable All");
    			} else {
    				$$invalidate(1, toggleBool = true);
    				$$invalidate(2, toggleName = "Show All");
    			}
    		}
    	};

    	const writable_props = ['collectionList'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Layers> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => toggleAll();
    	const click_handler_1 = layer => toggleIsShown(layer);

    	$$self.$$set = $$props => {
    		if ('collectionList' in $$props) $$invalidate(0, collectionList = $$props.collectionList);
    	};

    	$$self.$capture_state = () => ({
    		collectionList,
    		toggleBool,
    		toggleName,
    		toggleAll,
    		toggleIsShown,
    		allToggleButton
    	});

    	$$self.$inject_state = $$props => {
    		if ('collectionList' in $$props) $$invalidate(0, collectionList = $$props.collectionList);
    		if ('toggleBool' in $$props) $$invalidate(1, toggleBool = $$props.toggleBool);
    		if ('toggleName' in $$props) $$invalidate(2, toggleName = $$props.toggleName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		collectionList,
    		toggleBool,
    		toggleName,
    		toggleAll,
    		toggleIsShown,
    		click_handler,
    		click_handler_1
    	];
    }

    class Layers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { collectionList: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layers",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get collectionList() {
    		throw new Error("<Layers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collectionList(value) {
    		throw new Error("<Layers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\StyleSelector.svelte generated by Svelte v3.48.0 */

    const file$4 = "src\\components\\StyleSelector.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (23:1) {#each mapStyleList as item}
    function create_each_block(ctx) {
    	let div;
    	let input;
    	let input_checked_value;
    	let t0;
    	let label;
    	let t1_value = /*item*/ ctx[5]["name"] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*item*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "id", /*item*/ ctx[5].name);
    			attr_dev(input, "type", "radio");
    			input.value = /*item*/ ctx[5].value;
    			input.checked = input_checked_value = /*mapStyle*/ ctx[0] === /*item*/ ctx[5].value;
    			attr_dev(input, "data-bs-toggle", "collapse");
    			attr_dev(input, "data-bs-target", "#collapseMenu");
    			add_location(input, file$4, 24, 3, 637);
    			attr_dev(label, "class", "ml-2");
    			attr_dev(label, "for", /*item*/ ctx[5]["name"]);
    			add_location(label, file$4, 25, 3, 833);
    			attr_dev(div, "key", /*item*/ ctx[5].name);
    			add_location(div, file$4, 23, 2, 611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*mapStyle*/ 1 && input_checked_value !== (input_checked_value = /*mapStyle*/ ctx[0] === /*item*/ ctx[5].value)) {
    				prop_dev(input, "checked", input_checked_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(23:1) {#each mapStyleList as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let p;
    	let t1;
    	let each_value = /*mapStyleList*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			p = element("p");
    			p.textContent = "Map Style:";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "font-bold my-1");
    			add_location(p, file$4, 21, 1, 536);
    			attr_dev(section, "class", "card h-fit mb-4");
    			add_location(section, file$4, 20, 0, 500);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p);
    			append_dev(section, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mapStyleList, mapStyle, toggleStyle*/ 7) {
    				each_value = /*mapStyleList*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StyleSelector', slots, []);
    	let { mapStyle } = $$props;
    	let { isReadyForStyleSwitching } = $$props;

    	const mapStyleList = [
    		{ name: "Streets", value: "streets-v11" },
    		{ name: "Dark", value: "dark-v10" },
    		{ name: "Outdoors", value: "outdoors-v11" },
    		{
    			name: "Satellite",
    			value: "satellite-streets-v11"
    		},
    		{
    			name: "Navigation - Night",
    			value: "navigation-night-v1"
    		}
    	];

    	const toggleStyle = item => {
    		try {
    			$$invalidate(0, mapStyle = item);
    			$$invalidate(3, isReadyForStyleSwitching = true);
    		} catch(e) {
    			
    		}
    	};

    	const writable_props = ['mapStyle', 'isReadyForStyleSwitching'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StyleSelector> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => toggleStyle(item["value"]);

    	$$self.$$set = $$props => {
    		if ('mapStyle' in $$props) $$invalidate(0, mapStyle = $$props.mapStyle);
    		if ('isReadyForStyleSwitching' in $$props) $$invalidate(3, isReadyForStyleSwitching = $$props.isReadyForStyleSwitching);
    	};

    	$$self.$capture_state = () => ({
    		mapStyle,
    		isReadyForStyleSwitching,
    		mapStyleList,
    		toggleStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ('mapStyle' in $$props) $$invalidate(0, mapStyle = $$props.mapStyle);
    		if ('isReadyForStyleSwitching' in $$props) $$invalidate(3, isReadyForStyleSwitching = $$props.isReadyForStyleSwitching);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mapStyle, mapStyleList, toggleStyle, isReadyForStyleSwitching, click_handler];
    }

    class StyleSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { mapStyle: 0, isReadyForStyleSwitching: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StyleSelector",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*mapStyle*/ ctx[0] === undefined && !('mapStyle' in props)) {
    			console.warn("<StyleSelector> was created without expected prop 'mapStyle'");
    		}

    		if (/*isReadyForStyleSwitching*/ ctx[3] === undefined && !('isReadyForStyleSwitching' in props)) {
    			console.warn("<StyleSelector> was created without expected prop 'isReadyForStyleSwitching'");
    		}
    	}

    	get mapStyle() {
    		throw new Error("<StyleSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mapStyle(value) {
    		throw new Error("<StyleSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isReadyForStyleSwitching() {
    		throw new Error("<StyleSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isReadyForStyleSwitching(value) {
    		throw new Error("<StyleSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\FormRequest.svelte generated by Svelte v3.48.0 */

    const file$3 = "src\\components\\FormRequest.svelte";

    // (13:1) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Search Data";
    			attr_dev(button, "class", `card-btn card-btn-green my-1`);
    			add_location(button, file$3, 13, 2, 422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*fetchData*/ ctx[3])) /*fetchData*/ ctx[3].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(13:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:1) {#if selectedDate === "" || selectedTime === "" || selectedGeohash === null}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Select a Date, Time, and Geohash before Searching.";
    			attr_dev(div, "class", "alert alert-red my-1");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$3, 11, 2, 305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:1) {#if selectedDate === \\\"\\\" || selectedTime === \\\"\\\" || selectedGeohash === null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let p;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*selectedDate*/ ctx[0] === "" || /*selectedTime*/ ctx[1] === "" || /*selectedGeohash*/ ctx[2] === null) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			p = element("p");
    			p.textContent = "Search Geohash Vehicle Data:";
    			t1 = space();
    			if_block.c();
    			attr_dev(p, "class", "font-bold my-1");
    			add_location(p, file$3, 8, 1, 162);
    			attr_dev(section, "class", "card h-fit");
    			add_location(section, file$3, 7, 0, 131);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p);
    			append_dev(section, t1);
    			if_block.m(section, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FormRequest', slots, []);
    	let { selectedDate } = $$props;
    	let { selectedTime } = $$props;
    	let { selectedGeohash } = $$props;
    	let { fetchData } = $$props;
    	const writable_props = ['selectedDate', 'selectedTime', 'selectedGeohash', 'fetchData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FormRequest> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('selectedDate' in $$props) $$invalidate(0, selectedDate = $$props.selectedDate);
    		if ('selectedTime' in $$props) $$invalidate(1, selectedTime = $$props.selectedTime);
    		if ('selectedGeohash' in $$props) $$invalidate(2, selectedGeohash = $$props.selectedGeohash);
    		if ('fetchData' in $$props) $$invalidate(3, fetchData = $$props.fetchData);
    	};

    	$$self.$capture_state = () => ({
    		selectedDate,
    		selectedTime,
    		selectedGeohash,
    		fetchData
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedDate' in $$props) $$invalidate(0, selectedDate = $$props.selectedDate);
    		if ('selectedTime' in $$props) $$invalidate(1, selectedTime = $$props.selectedTime);
    		if ('selectedGeohash' in $$props) $$invalidate(2, selectedGeohash = $$props.selectedGeohash);
    		if ('fetchData' in $$props) $$invalidate(3, fetchData = $$props.fetchData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedDate, selectedTime, selectedGeohash, fetchData];
    }

    class FormRequest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			selectedDate: 0,
    			selectedTime: 1,
    			selectedGeohash: 2,
    			fetchData: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormRequest",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedDate*/ ctx[0] === undefined && !('selectedDate' in props)) {
    			console.warn("<FormRequest> was created without expected prop 'selectedDate'");
    		}

    		if (/*selectedTime*/ ctx[1] === undefined && !('selectedTime' in props)) {
    			console.warn("<FormRequest> was created without expected prop 'selectedTime'");
    		}

    		if (/*selectedGeohash*/ ctx[2] === undefined && !('selectedGeohash' in props)) {
    			console.warn("<FormRequest> was created without expected prop 'selectedGeohash'");
    		}

    		if (/*fetchData*/ ctx[3] === undefined && !('fetchData' in props)) {
    			console.warn("<FormRequest> was created without expected prop 'fetchData'");
    		}
    	}

    	get selectedDate() {
    		throw new Error("<FormRequest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedDate(value) {
    		throw new Error("<FormRequest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedTime() {
    		throw new Error("<FormRequest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedTime(value) {
    		throw new Error("<FormRequest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedGeohash() {
    		throw new Error("<FormRequest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedGeohash(value) {
    		throw new Error("<FormRequest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fetchData() {
    		throw new Error("<FormRequest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fetchData(value) {
    		throw new Error("<FormRequest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\StreetView.svelte generated by Svelte v3.48.0 */
    const file$2 = "src\\components\\StreetView.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let div;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			attr_dev(div, "class", "h-full w-full rounded-lg");
    			add_location(div, file$2, 26, 1, 595);
    			attr_dev(section, "class", "card card-2xl");
    			add_location(section, file$2, 25, 0, 561);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			/*div_binding*/ ctx[2](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			/*div_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StreetView', slots, []);
    	let { pointOfInterest } = $$props;
    	let mapContainer = null;

    	onMount(() => {
    		$$invalidate(0, mapContainer = new google.maps.StreetViewPanorama(mapContainer,
    		{
    				position: pointOfInterest,
    				pov: { heading: 34, pitch: 10 }
    			}));
    	});

    	// When the location changes, set the new lat long to the map
    	const onLocationChange = () => {
    		try {
    			mapContainer.setPosition(pointOfInterest);
    		} catch(e) {
    			
    		}
    	};

    	const writable_props = ['pointOfInterest'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StreetView> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mapContainer = $$value;
    			$$invalidate(0, mapContainer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('pointOfInterest' in $$props) $$invalidate(1, pointOfInterest = $$props.pointOfInterest);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		pointOfInterest,
    		mapContainer,
    		onLocationChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('pointOfInterest' in $$props) $$invalidate(1, pointOfInterest = $$props.pointOfInterest);
    		if ('mapContainer' in $$props) $$invalidate(0, mapContainer = $$props.mapContainer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*pointOfInterest, mapContainer*/ 3) {
    			pointOfInterest && mapContainer != null && onLocationChange();
    		}
    	};

    	return [mapContainer, pointOfInterest, div_binding];
    }

    class StreetView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { pointOfInterest: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StreetView",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pointOfInterest*/ ctx[1] === undefined && !('pointOfInterest' in props)) {
    			console.warn("<StreetView> was created without expected prop 'pointOfInterest'");
    		}
    	}

    	get pointOfInterest() {
    		throw new Error("<StreetView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointOfInterest(value) {
    		throw new Error("<StreetView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Chart.svelte generated by Svelte v3.48.0 */

    const file$1 = "src\\components\\Chart.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let p;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			section = element("section");
    			p = element("p");
    			p.textContent = "Chart:";
    			t1 = space();
    			div = element("div");
    			attr_dev(p, "class", "font-bold my-1");
    			add_location(p, file$1, 1, 1, 31);
    			attr_dev(div, "id", "chartdiv");
    			attr_dev(div, "class", "h-72 w-full");
    			add_location(div, file$1, 2, 1, 70);
    			attr_dev(section, "class", "card h-fit");
    			add_location(section, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p);
    			append_dev(section, t1);
    			append_dev(section, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chart', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chart> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Chart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chart",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\HomePage.svelte generated by Svelte v3.48.0 */
    const file = "src\\pages\\HomePage.svelte";

    // (64:31) 
    function create_if_block_2(ctx) {
    	let chart;
    	let current;
    	chart = new Chart({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(chart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chart, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(64:31) ",
    		ctx
    	});

    	return block;
    }

    // (60:31) 
    function create_if_block_1(ctx) {
    	let div;
    	let streetview;
    	let updating_pointOfInterest;
    	let current;

    	function streetview_pointOfInterest_binding(value) {
    		/*streetview_pointOfInterest_binding*/ ctx[18](value);
    	}

    	let streetview_props = {};

    	if (/*pointOfInterest*/ ctx[1] !== void 0) {
    		streetview_props.pointOfInterest = /*pointOfInterest*/ ctx[1];
    	}

    	streetview = new StreetView({ props: streetview_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(streetview, 'pointOfInterest', streetview_pointOfInterest_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(streetview.$$.fragment);
    			attr_dev(div, "class", "col-span-1 md:col-span-1 row-span-1");
    			add_location(div, file, 60, 3, 2127);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(streetview, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const streetview_changes = {};

    			if (!updating_pointOfInterest && dirty & /*pointOfInterest*/ 2) {
    				updating_pointOfInterest = true;
    				streetview_changes.pointOfInterest = /*pointOfInterest*/ ctx[1];
    				add_flush_callback(() => updating_pointOfInterest = false);
    			}

    			streetview.$set(streetview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(streetview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(streetview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(streetview);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(60:31) ",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#if selectedMenu === 1}
    function create_if_block(ctx) {
    	let div0;
    	let datetime;
    	let updating_selectedDate;
    	let updating_selectedTime;
    	let t0;
    	let div1;
    	let profile;
    	let updating_selectedGeohash;
    	let t1;
    	let div2;
    	let formrequest;
    	let updating_selectedDate_1;
    	let updating_selectedTime_1;
    	let updating_selectedGeohash_1;
    	let current;

    	function datetime_selectedDate_binding(value) {
    		/*datetime_selectedDate_binding*/ ctx[12](value);
    	}

    	function datetime_selectedTime_binding(value) {
    		/*datetime_selectedTime_binding*/ ctx[13](value);
    	}

    	let datetime_props = {};

    	if (/*selectedDate*/ ctx[4] !== void 0) {
    		datetime_props.selectedDate = /*selectedDate*/ ctx[4];
    	}

    	if (/*selectedTime*/ ctx[5] !== void 0) {
    		datetime_props.selectedTime = /*selectedTime*/ ctx[5];
    	}

    	datetime = new DateTime({ props: datetime_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(datetime, 'selectedDate', datetime_selectedDate_binding));
    	binding_callbacks.push(() => bind$1(datetime, 'selectedTime', datetime_selectedTime_binding));

    	function profile_selectedGeohash_binding(value) {
    		/*profile_selectedGeohash_binding*/ ctx[14](value);
    	}

    	let profile_props = {
    		kingstonDetails: /*kingstonDetails*/ ctx[8]
    	};

    	if (/*selectedGeohash*/ ctx[3] !== void 0) {
    		profile_props.selectedGeohash = /*selectedGeohash*/ ctx[3];
    	}

    	profile = new Profile({ props: profile_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(profile, 'selectedGeohash', profile_selectedGeohash_binding));

    	function formrequest_selectedDate_binding(value) {
    		/*formrequest_selectedDate_binding*/ ctx[15](value);
    	}

    	function formrequest_selectedTime_binding(value) {
    		/*formrequest_selectedTime_binding*/ ctx[16](value);
    	}

    	function formrequest_selectedGeohash_binding(value) {
    		/*formrequest_selectedGeohash_binding*/ ctx[17](value);
    	}

    	let formrequest_props = { fetchData: /*fetchData*/ ctx[9] };

    	if (/*selectedDate*/ ctx[4] !== void 0) {
    		formrequest_props.selectedDate = /*selectedDate*/ ctx[4];
    	}

    	if (/*selectedTime*/ ctx[5] !== void 0) {
    		formrequest_props.selectedTime = /*selectedTime*/ ctx[5];
    	}

    	if (/*selectedGeohash*/ ctx[3] !== void 0) {
    		formrequest_props.selectedGeohash = /*selectedGeohash*/ ctx[3];
    	}

    	formrequest = new FormRequest({ props: formrequest_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(formrequest, 'selectedDate', formrequest_selectedDate_binding));
    	binding_callbacks.push(() => bind$1(formrequest, 'selectedTime', formrequest_selectedTime_binding));
    	binding_callbacks.push(() => bind$1(formrequest, 'selectedGeohash', formrequest_selectedGeohash_binding));

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(datetime.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(profile.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(formrequest.$$.fragment);
    			attr_dev(div0, "class", "col-span-1 md:col-span-1 row-span-1");
    			add_location(div0, file, 48, 3, 1695);
    			attr_dev(div1, "class", "col-span-1 md:col-span-1 row-span-1");
    			add_location(div1, file, 52, 3, 1816);
    			attr_dev(div2, "class", "col-span-1 md:col-span-1 row-span-1");
    			add_location(div2, file, 56, 3, 1939);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(datetime, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(profile, div1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(formrequest, div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const datetime_changes = {};

    			if (!updating_selectedDate && dirty & /*selectedDate*/ 16) {
    				updating_selectedDate = true;
    				datetime_changes.selectedDate = /*selectedDate*/ ctx[4];
    				add_flush_callback(() => updating_selectedDate = false);
    			}

    			if (!updating_selectedTime && dirty & /*selectedTime*/ 32) {
    				updating_selectedTime = true;
    				datetime_changes.selectedTime = /*selectedTime*/ ctx[5];
    				add_flush_callback(() => updating_selectedTime = false);
    			}

    			datetime.$set(datetime_changes);
    			const profile_changes = {};

    			if (!updating_selectedGeohash && dirty & /*selectedGeohash*/ 8) {
    				updating_selectedGeohash = true;
    				profile_changes.selectedGeohash = /*selectedGeohash*/ ctx[3];
    				add_flush_callback(() => updating_selectedGeohash = false);
    			}

    			profile.$set(profile_changes);
    			const formrequest_changes = {};

    			if (!updating_selectedDate_1 && dirty & /*selectedDate*/ 16) {
    				updating_selectedDate_1 = true;
    				formrequest_changes.selectedDate = /*selectedDate*/ ctx[4];
    				add_flush_callback(() => updating_selectedDate_1 = false);
    			}

    			if (!updating_selectedTime_1 && dirty & /*selectedTime*/ 32) {
    				updating_selectedTime_1 = true;
    				formrequest_changes.selectedTime = /*selectedTime*/ ctx[5];
    				add_flush_callback(() => updating_selectedTime_1 = false);
    			}

    			if (!updating_selectedGeohash_1 && dirty & /*selectedGeohash*/ 8) {
    				updating_selectedGeohash_1 = true;
    				formrequest_changes.selectedGeohash = /*selectedGeohash*/ ctx[3];
    				add_flush_callback(() => updating_selectedGeohash_1 = false);
    			}

    			formrequest.$set(formrequest_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datetime.$$.fragment, local);
    			transition_in(profile.$$.fragment, local);
    			transition_in(formrequest.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datetime.$$.fragment, local);
    			transition_out(profile.$$.fragment, local);
    			transition_out(formrequest.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(datetime);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(profile);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_component(formrequest);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(48:2) {#if selectedMenu === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let navbar;
    	let t0;
    	let attentionbar;
    	let updating_selectedMenu;
    	let t1;
    	let section;
    	let div1;
    	let div0;
    	let layers;
    	let updating_collectionList;
    	let t2;
    	let current_block_type_index;
    	let if_block;
    	let t3;
    	let div3;
    	let map;
    	let updating_collectionList_1;
    	let updating_mapStyle;
    	let updating_isReadyForStyleSwitching;
    	let updating_selectedGeohash;
    	let updating_pointOfInterest;
    	let t4;
    	let div2;
    	let styleselector;
    	let updating_mapStyle_1;
    	let updating_isReadyForStyleSwitching_1;
    	let t5;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	function attentionbar_selectedMenu_binding(value) {
    		/*attentionbar_selectedMenu_binding*/ ctx[10](value);
    	}

    	let attentionbar_props = {};

    	if (/*selectedMenu*/ ctx[0] !== void 0) {
    		attentionbar_props.selectedMenu = /*selectedMenu*/ ctx[0];
    	}

    	attentionbar = new AttentionBar({
    			props: attentionbar_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind$1(attentionbar, 'selectedMenu', attentionbar_selectedMenu_binding));

    	function layers_collectionList_binding(value) {
    		/*layers_collectionList_binding*/ ctx[11](value);
    	}

    	let layers_props = {};

    	if (/*collectionList*/ ctx[2] !== void 0) {
    		layers_props.collectionList = /*collectionList*/ ctx[2];
    	}

    	layers = new Layers({ props: layers_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(layers, 'collectionList', layers_collectionList_binding));
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedMenu*/ ctx[0] === 1) return 0;
    		if (/*selectedMenu*/ ctx[0] === 2) return 1;
    		if (/*selectedMenu*/ ctx[0] === 3) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function map_collectionList_binding(value) {
    		/*map_collectionList_binding*/ ctx[19](value);
    	}

    	function map_mapStyle_binding(value) {
    		/*map_mapStyle_binding*/ ctx[20](value);
    	}

    	function map_isReadyForStyleSwitching_binding(value) {
    		/*map_isReadyForStyleSwitching_binding*/ ctx[21](value);
    	}

    	function map_selectedGeohash_binding(value) {
    		/*map_selectedGeohash_binding*/ ctx[22](value);
    	}

    	function map_pointOfInterest_binding(value) {
    		/*map_pointOfInterest_binding*/ ctx[23](value);
    	}

    	let map_props = {
    		kingstonDetails: /*kingstonDetails*/ ctx[8]
    	};

    	if (/*collectionList*/ ctx[2] !== void 0) {
    		map_props.collectionList = /*collectionList*/ ctx[2];
    	}

    	if (/*mapStyle*/ ctx[6] !== void 0) {
    		map_props.mapStyle = /*mapStyle*/ ctx[6];
    	}

    	if (/*isReadyForStyleSwitching*/ ctx[7] !== void 0) {
    		map_props.isReadyForStyleSwitching = /*isReadyForStyleSwitching*/ ctx[7];
    	}

    	if (/*selectedGeohash*/ ctx[3] !== void 0) {
    		map_props.selectedGeohash = /*selectedGeohash*/ ctx[3];
    	}

    	if (/*pointOfInterest*/ ctx[1] !== void 0) {
    		map_props.pointOfInterest = /*pointOfInterest*/ ctx[1];
    	}

    	map = new Map$1({ props: map_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(map, 'collectionList', map_collectionList_binding));
    	binding_callbacks.push(() => bind$1(map, 'mapStyle', map_mapStyle_binding));
    	binding_callbacks.push(() => bind$1(map, 'isReadyForStyleSwitching', map_isReadyForStyleSwitching_binding));
    	binding_callbacks.push(() => bind$1(map, 'selectedGeohash', map_selectedGeohash_binding));
    	binding_callbacks.push(() => bind$1(map, 'pointOfInterest', map_pointOfInterest_binding));

    	function styleselector_mapStyle_binding(value) {
    		/*styleselector_mapStyle_binding*/ ctx[24](value);
    	}

    	function styleselector_isReadyForStyleSwitching_binding(value) {
    		/*styleselector_isReadyForStyleSwitching_binding*/ ctx[25](value);
    	}

    	let styleselector_props = {};

    	if (/*mapStyle*/ ctx[6] !== void 0) {
    		styleselector_props.mapStyle = /*mapStyle*/ ctx[6];
    	}

    	if (/*isReadyForStyleSwitching*/ ctx[7] !== void 0) {
    		styleselector_props.isReadyForStyleSwitching = /*isReadyForStyleSwitching*/ ctx[7];
    	}

    	styleselector = new StyleSelector({
    			props: styleselector_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind$1(styleselector, 'mapStyle', styleselector_mapStyle_binding));
    	binding_callbacks.push(() => bind$1(styleselector, 'isReadyForStyleSwitching', styleselector_isReadyForStyleSwitching_binding));
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(attentionbar.$$.fragment);
    			t1 = space();
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(layers.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div3 = element("div");
    			create_component(map.$$.fragment);
    			t4 = space();
    			div2 = element("div");
    			create_component(styleselector.$$.fragment);
    			t5 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "col-span-1 md:col-span-1 row-span-1");
    			add_location(div0, file, 43, 2, 1566);
    			attr_dev(div1, "class", "col-span-1 md:col-span-3 row-span-6 grid grid-cols-1 md:grid-cols-1 gap-4 h-fit");
    			add_location(div1, file, 42, 1, 1469);
    			attr_dev(div2, "class", "absolute top-1 left-1 ");
    			add_location(div2, file, 73, 2, 2503);
    			attr_dev(div3, "class", "col-span-1 md:col-span-9 row-span-6 relative");
    			add_location(div3, file, 71, 1, 2305);
    			attr_dev(section, "class", "grid grid-cols-1 md:grid-cols-12 grid-rows-6 gap-4 pb-4 px-4 h-fit");
    			add_location(section, file, 41, 0, 1380);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(attentionbar, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			mount_component(layers, div0, null);
    			append_dev(div1, t2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			append_dev(section, t3);
    			append_dev(section, div3);
    			mount_component(map, div3, null);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			mount_component(styleselector, div2, null);
    			insert_dev(target, t5, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const attentionbar_changes = {};

    			if (!updating_selectedMenu && dirty & /*selectedMenu*/ 1) {
    				updating_selectedMenu = true;
    				attentionbar_changes.selectedMenu = /*selectedMenu*/ ctx[0];
    				add_flush_callback(() => updating_selectedMenu = false);
    			}

    			attentionbar.$set(attentionbar_changes);
    			const layers_changes = {};

    			if (!updating_collectionList && dirty & /*collectionList*/ 4) {
    				updating_collectionList = true;
    				layers_changes.collectionList = /*collectionList*/ ctx[2];
    				add_flush_callback(() => updating_collectionList = false);
    			}

    			layers.$set(layers_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				} else {
    					if_block = null;
    				}
    			}

    			const map_changes = {};

    			if (!updating_collectionList_1 && dirty & /*collectionList*/ 4) {
    				updating_collectionList_1 = true;
    				map_changes.collectionList = /*collectionList*/ ctx[2];
    				add_flush_callback(() => updating_collectionList_1 = false);
    			}

    			if (!updating_mapStyle && dirty & /*mapStyle*/ 64) {
    				updating_mapStyle = true;
    				map_changes.mapStyle = /*mapStyle*/ ctx[6];
    				add_flush_callback(() => updating_mapStyle = false);
    			}

    			if (!updating_isReadyForStyleSwitching && dirty & /*isReadyForStyleSwitching*/ 128) {
    				updating_isReadyForStyleSwitching = true;
    				map_changes.isReadyForStyleSwitching = /*isReadyForStyleSwitching*/ ctx[7];
    				add_flush_callback(() => updating_isReadyForStyleSwitching = false);
    			}

    			if (!updating_selectedGeohash && dirty & /*selectedGeohash*/ 8) {
    				updating_selectedGeohash = true;
    				map_changes.selectedGeohash = /*selectedGeohash*/ ctx[3];
    				add_flush_callback(() => updating_selectedGeohash = false);
    			}

    			if (!updating_pointOfInterest && dirty & /*pointOfInterest*/ 2) {
    				updating_pointOfInterest = true;
    				map_changes.pointOfInterest = /*pointOfInterest*/ ctx[1];
    				add_flush_callback(() => updating_pointOfInterest = false);
    			}

    			map.$set(map_changes);
    			const styleselector_changes = {};

    			if (!updating_mapStyle_1 && dirty & /*mapStyle*/ 64) {
    				updating_mapStyle_1 = true;
    				styleselector_changes.mapStyle = /*mapStyle*/ ctx[6];
    				add_flush_callback(() => updating_mapStyle_1 = false);
    			}

    			if (!updating_isReadyForStyleSwitching_1 && dirty & /*isReadyForStyleSwitching*/ 128) {
    				updating_isReadyForStyleSwitching_1 = true;
    				styleselector_changes.isReadyForStyleSwitching = /*isReadyForStyleSwitching*/ ctx[7];
    				add_flush_callback(() => updating_isReadyForStyleSwitching_1 = false);
    			}

    			styleselector.$set(styleselector_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(attentionbar.$$.fragment, local);
    			transition_in(layers.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(map.$$.fragment, local);
    			transition_in(styleselector.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(attentionbar.$$.fragment, local);
    			transition_out(layers.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(map.$$.fragment, local);
    			transition_out(styleselector.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(attentionbar, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section);
    			destroy_component(layers);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			destroy_component(map);
    			destroy_component(styleselector);
    			if (detaching) detach_dev(t5);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HomePage', slots, []);
    	let selectedMenu = 1;
    	let pointOfInterest = null;
    	let collectionList = [];
    	let selectedGeohash = null;
    	let selectedDate = getCurrentDateInYYYYMMDD();
    	let selectedTime = getCurrentTime();
    	let mapStyle = "outdoors-v11";
    	let isReadyForStyleSwitching = false;

    	let kingstonDetails = {
    		id: 0,
    		photoURL: "https://www.meme-arsenal.com/memes/bd75c0339be8bbe24aeecd9c64764321.jpg",
    		displayName: "Kingston",
    		center: [-76.5, 44.233334],
    		zoom: 12,
    		pitch: 45,
    		bearing: -17.6
    	};

    	const fetchData = () => {
    		alert(`Fetching data for: ${selectedDate} at ${selectedTime} => Geohash : ${selectedGeohash}`);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HomePage> was created with unknown prop '${key}'`);
    	});

    	function attentionbar_selectedMenu_binding(value) {
    		selectedMenu = value;
    		$$invalidate(0, selectedMenu);
    	}

    	function layers_collectionList_binding(value) {
    		collectionList = value;
    		$$invalidate(2, collectionList);
    	}

    	function datetime_selectedDate_binding(value) {
    		selectedDate = value;
    		$$invalidate(4, selectedDate);
    	}

    	function datetime_selectedTime_binding(value) {
    		selectedTime = value;
    		$$invalidate(5, selectedTime);
    	}

    	function profile_selectedGeohash_binding(value) {
    		selectedGeohash = value;
    		$$invalidate(3, selectedGeohash);
    	}

    	function formrequest_selectedDate_binding(value) {
    		selectedDate = value;
    		$$invalidate(4, selectedDate);
    	}

    	function formrequest_selectedTime_binding(value) {
    		selectedTime = value;
    		$$invalidate(5, selectedTime);
    	}

    	function formrequest_selectedGeohash_binding(value) {
    		selectedGeohash = value;
    		$$invalidate(3, selectedGeohash);
    	}

    	function streetview_pointOfInterest_binding(value) {
    		pointOfInterest = value;
    		$$invalidate(1, pointOfInterest);
    	}

    	function map_collectionList_binding(value) {
    		collectionList = value;
    		$$invalidate(2, collectionList);
    	}

    	function map_mapStyle_binding(value) {
    		mapStyle = value;
    		$$invalidate(6, mapStyle);
    	}

    	function map_isReadyForStyleSwitching_binding(value) {
    		isReadyForStyleSwitching = value;
    		$$invalidate(7, isReadyForStyleSwitching);
    	}

    	function map_selectedGeohash_binding(value) {
    		selectedGeohash = value;
    		$$invalidate(3, selectedGeohash);
    	}

    	function map_pointOfInterest_binding(value) {
    		pointOfInterest = value;
    		$$invalidate(1, pointOfInterest);
    	}

    	function styleselector_mapStyle_binding(value) {
    		mapStyle = value;
    		$$invalidate(6, mapStyle);
    	}

    	function styleselector_isReadyForStyleSwitching_binding(value) {
    		isReadyForStyleSwitching = value;
    		$$invalidate(7, isReadyForStyleSwitching);
    	}

    	$$self.$capture_state = () => ({
    		Navbar,
    		Footer,
    		Map: Map$1,
    		AttentionBar,
    		Profile,
    		DateTime,
    		Layers,
    		StyleSelector,
    		FormRequest,
    		StreetView,
    		Chart,
    		getCurrentDateInYYYYMMDD,
    		getCurrentTime,
    		selectedMenu,
    		pointOfInterest,
    		collectionList,
    		selectedGeohash,
    		selectedDate,
    		selectedTime,
    		mapStyle,
    		isReadyForStyleSwitching,
    		kingstonDetails,
    		fetchData
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedMenu' in $$props) $$invalidate(0, selectedMenu = $$props.selectedMenu);
    		if ('pointOfInterest' in $$props) $$invalidate(1, pointOfInterest = $$props.pointOfInterest);
    		if ('collectionList' in $$props) $$invalidate(2, collectionList = $$props.collectionList);
    		if ('selectedGeohash' in $$props) $$invalidate(3, selectedGeohash = $$props.selectedGeohash);
    		if ('selectedDate' in $$props) $$invalidate(4, selectedDate = $$props.selectedDate);
    		if ('selectedTime' in $$props) $$invalidate(5, selectedTime = $$props.selectedTime);
    		if ('mapStyle' in $$props) $$invalidate(6, mapStyle = $$props.mapStyle);
    		if ('isReadyForStyleSwitching' in $$props) $$invalidate(7, isReadyForStyleSwitching = $$props.isReadyForStyleSwitching);
    		if ('kingstonDetails' in $$props) $$invalidate(8, kingstonDetails = $$props.kingstonDetails);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedMenu,
    		pointOfInterest,
    		collectionList,
    		selectedGeohash,
    		selectedDate,
    		selectedTime,
    		mapStyle,
    		isReadyForStyleSwitching,
    		kingstonDetails,
    		fetchData,
    		attentionbar_selectedMenu_binding,
    		layers_collectionList_binding,
    		datetime_selectedDate_binding,
    		datetime_selectedTime_binding,
    		profile_selectedGeohash_binding,
    		formrequest_selectedDate_binding,
    		formrequest_selectedTime_binding,
    		formrequest_selectedGeohash_binding,
    		streetview_pointOfInterest_binding,
    		map_collectionList_binding,
    		map_mapStyle_binding,
    		map_isReadyForStyleSwitching_binding,
    		map_selectedGeohash_binding,
    		map_pointOfInterest_binding,
    		styleselector_mapStyle_binding,
    		styleselector_isReadyForStyleSwitching_binding
    	];
    }

    class HomePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomePage",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\layout\App.svelte generated by Svelte v3.48.0 */

    function create_fragment(ctx) {
    	let homepage;
    	let current;
    	homepage = new HomePage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(homepage.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(homepage, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(homepage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(homepage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(homepage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ HomePage });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,

    });

    return app;

})(Stream);
//# sourceMappingURL=bundle.js.map
