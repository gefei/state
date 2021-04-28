var state;(()=>{"use strict";var t={732:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Instance=void 0;const r=i(206),n=i(822);class s extends Map{constructor(t,e){super(),this.name=t,this.root=e,this.deferredEventPool=[],this.transactional((t=>{this.root.doEnter(t,!1,this.root,void 0),this.evaluateDeferred(t)}))}evaluate(t){return r.log.write((()=>`${this} evaluate ${t}`),r.log.Evaluate),this.transaction?(this.defer(t),!1):this.transactional((e=>{const i=this.root.evaluate(e,!1,t);return i&&this.evaluateDeferred(e),i}))}transactional(t){try{this.transaction=new n.Transaction(this);const e=t(this.transaction);for(const[t,e]of this.transaction)this.set(t,e);return e}finally{this.transaction=void 0}}defer(t){r.log.write((()=>`${this} deferring ${t}`),r.log.Evaluate),this.deferredEventPool.push(t)}evaluateDeferred(t){this.deferredEventPool.length&&(this.processDeferred(t),this.deferredEventPool=this.deferredEventPool.filter((t=>t)))}processDeferred(t){this.deferredEventPool.forEach(((e,i)=>{e&&-1===this.root.getDeferrableTriggers(t).indexOf(e.constructor)&&(delete this.deferredEventPool[i],r.log.write((()=>`${this} evaluate deferred ${e}`),r.log.Evaluate),this.root.evaluate(t,!1,e))&&this.processDeferred(t)}))}toString(){return this.name}}e.Instance=s},885:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.JSONSerializer=void 0;class i{constructor(t){this.name=t.name}}class r extends i{constructor(t){super(t),this.children=[]}}class n extends i{constructor(t,e){super(t),this.activeState=e,this.children=[]}}e.JSONSerializer=class{constructor(t,e){this.instance=t,this.deferedEventSerializer=e,this.stateMap=new Map,this.regionMap=new Map}visitPseudoState(){}visitPseudoStateTail(){}visitState(t){const e=new r(t);if(this.stateMap.set(t,e),t.parent){const i=this.regionMap.get(t.parent);i&&i.children.push(e)}else this.root=e}visitStateTail(){}visitRegion(t){const e=this.instance.get(t),i=new n(t,e?e.name:void 0);this.regionMap.set(t,i);const r=this.stateMap.get(t.parent);r&&r.children.push(i)}visitRegionTail(){}toString(){return this.instance.deferredEventPool.length&&this.deferedEventSerializer&&this.root&&(this.root.deferredEventPool=this.instance.deferredEventPool.map(this.deferedEventSerializer)),JSON.stringify(this.root)}}},624:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.PseudoState=void 0;const r=i(497),n=i(206),s=i(947);class o extends n.Vertex{constructor(t,e,i=n.PseudoStateKind.Initial){super(t),this.kind=i,this.parent=e instanceof n.State?e.getDefaultRegion():e,this.parent.vertices.push(this),this.kind&n.PseudoStateKind.Starting&&(this.parent.initial=this)}else(t,e=s.TransitionKind.External){return this.elseTransition=new n.Transition(this).to(t,e).when((()=>!1))}getTransition(t){return(this.kind&n.PseudoStateKind.Choice?r.random(this.outgoing.filter((e=>e.evaluate(t)))):super.getTransition(t))||this.elseTransition}doEnter(t,e,i,r){n.log.write((()=>`${t.instance} enter ${this}`),n.log.Entry),t.setVertex(this),r||this.kind&n.PseudoStateKind.Junction||this.evaluate(t,e,i)}doExit(t){n.log.write((()=>`${t.instance} leave ${this}`),n.log.Exit)}accept(t){t.visitPseudoState(this),t.visitPseudoStateTail(this)}}e.PseudoState=o},32:(t,e)=>{var i;Object.defineProperty(e,"__esModule",{value:!0}),e.PseudoStateKind=void 0,(i=e.PseudoStateKind||(e.PseudoStateKind={}))[i.Choice=1]="Choice",i[i.DeepHistory=2]="DeepHistory",i[i.Initial=4]="Initial",i[i.Junction=8]="Junction",i[i.ShallowHistory=16]="ShallowHistory",i[i.History=18]="History",i[i.Starting=22]="Starting"},65:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Region=void 0;const r=i(206);e.Region=class{constructor(t,e){this.name=t,this.parent=e,this.vertices=[],r.log.write((()=>`Created ${this}`),r.log.Create),e.regions.push(this)}isComplete(t){const e=t.get(this);return void 0!==e&&e.isFinal()}history(t,e){return t||void 0!==this.initial&&!!(this.initial.kind&e)}doEnter(t,e,i,n){if(r.log.write((()=>`${t.instance} enter ${this}`),r.log.Entry),!n){const n=this.history(e,r.PseudoStateKind.History)&&t.get(this)||this.initial;if(!n)throw new Error(`No staring vertex found when entering region ${this}`);n.doEnter(t,this.history(e,r.PseudoStateKind.DeepHistory),i,void 0)}}doExit(t,e,i){const n=t.getVertex(this);n&&n.doExit(t,e,i),r.log.write((()=>`${t.instance} leave ${this}`),r.log.Exit)}accept(t){t.visitRegion(this),this.vertices.forEach((e=>e.accept(t))),t.visitRegionTail(this)}toString(){return`${this.parent}.${this.name}`}}},751:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.State=void 0;const r=i(206);class n extends r.Vertex{constructor(t,e){super(t),this.regions=[],this.deferrableTriggers=[],this.entryActions=[],this.exitActions=[],this.parent=e instanceof n?e.getDefaultRegion():e,this.parent&&this.parent.vertices.push(this)}entry(...t){return this.entryActions.push(...t),this}exit(...t){return this.exitActions.push(...t),this}defer(...t){return this.deferrableTriggers.push(...t),this}getDefaultRegion(){return this.defaultRegion||(this.defaultRegion=new r.Region("default",this))}isSimple(){return 0===this.regions.length}isComposite(){return this.regions.length>0}isOrthogonal(){return this.regions.length>1}isFinal(){return 0===this.outgoing.length}isComplete(t){return!this.regions.some((e=>!e.isComplete(t)))}evaluate(t,e,i){const r=this.delegate(t,e,i)||super.evaluate(t,e,i)||this.deferrable(t,i);return r&&this.completion(t,e),r}delegate(t,e,i){let r=!1;for(let n=0,s=this.regions.length;n<s&&this.isActive(t);++n){const s=t.get(this.regions[n]);s&&(r=s.evaluate(t,e,i)||r)}return r}deferrable(t,e){return-1!==this.deferrableTriggers.indexOf(e.constructor)&&(t.instance.defer(e),!0)}getDeferrableTriggers(t){return this.regions.reduce(((e,i)=>{const r=t.get(i);return r?e.concat(r.getDeferrableTriggers(t)):e}),this.deferrableTriggers)}doEnter(t,e,i,n){n&&this.regions.forEach((r=>{r!==n&&r.doEnter(t,e,i,void 0)})),r.log.write((()=>`${t.instance} enter ${this}`),r.log.Entry),t.setVertex(this),this.entryActions.forEach((e=>e(i,t.instance))),n||(this.regions.forEach((r=>r.doEnter(t,e,i,void 0))),this.completion(t,e))}doExit(t,e,i){this.regions.forEach((r=>r.doExit(t,e,i))),r.log.write((()=>`${t.instance} leave ${this}`),r.log.Exit),this.exitActions.forEach((e=>e(i,t.instance)))}completion(t,e){this.isComplete(t)&&super.evaluate(t,e,this)}accept(t){t.visitState(this),this.regions.forEach((e=>e.accept(t))),t.visitStateTail(this)}}e.State=n},822:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Transaction=void 0;const r=i(206);class n extends Map{constructor(t){super(),this.instance=t,this.lastKnownVertex=new Map}get(t){return super.get(t)||this.instance.get(t)}setVertex(t){t.parent&&(this.lastKnownVertex.set(t.parent,t),t instanceof r.State&&this.set(t.parent,t))}getVertex(t){return this.lastKnownVertex.get(t)||this.instance.get(t)}}e.Transaction=n},564:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Transition=void 0;const r=i(206);function n(t,e,i,n){r.log.write((()=>`${t.instance} traverse internal transition at ${n.target}`),r.log.Transition),n.actions.forEach((e=>e(i,t.instance))),n.target instanceof r.State&&n.target.completion(t,e)}function s(t,e,i,n){r.log.write((()=>`${t.instance} traverse local transition to ${n.target}`),r.log.Transition);const s=function(t,e){for(;e.parent&&e.parent.parent&&!e.parent.parent.isActive(t);)e=e.parent.parent;return e}(t,n.target);if(!s.isActive(t)&&s.parent){const r=t.getVertex(s.parent);r&&r.doExit(t,e,i)}n.actions.forEach((e=>e(i,t.instance))),s&&!s.isActive(t)&&s.doEnter(t,e,i,void 0)}function*o(t){t.parent&&(yield*o(t.parent)),yield t}e.Transition=class{constructor(t){this.source=t,this.typeGuard=()=>!0,this.userGuard=()=>!0,this.actions=[],this.target=t,this.execute=n,this.source.outgoing.push(this)}on(t){return this.typeGuard=e=>e.constructor===t,this}when(t){return this.userGuard=t,this}to(t,e=r.TransitionKind.External){return this.target=t,e===r.TransitionKind.External?this.execute=function(t,e){let i,n=[];const s=o(t),a=o(e);let h=s.next(),c=a.next();do{i=h.value,n=[c.value],h=s.next(),c=a.next()}while(i===n[0]&&!h.done&&!c.done);for(;!c.done;)n.push(c.value),c=a.next();return e instanceof r.PseudoState&&e.kind&r.PseudoStateKind.History&&n.pop(),(s,o,a,h)=>{r.log.write((()=>`${s.instance} traverse external transition from ${t} to ${e}`),r.log.Transition),i.doExit(s,o,a),h.actions.forEach((t=>t(a,s.instance))),n.forEach(((t,e)=>t.doEnter(s,o,a,n[e+1])))}}(this.source,this.target):this.execute=s,this}effect(...t){return this.actions.push(...t),this}evaluate(t){return this.typeGuard(t)&&this.userGuard(t)}traverse(t,e,i){var n=this;const s=[n];for(;n.target instanceof r.PseudoState&&n.target.kind&r.PseudoStateKind.Junction&&(n=n.target.getTransition(i));)s.push(n);s.forEach((r=>r.execute(t,e,i,r)))}}},947:(t,e)=>{var i;Object.defineProperty(e,"__esModule",{value:!0}),e.TransitionKind=void 0,(i=e.TransitionKind||(e.TransitionKind={}))[i.External=0]="External",i[i.Local=1]="Local"},588:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Vertex=void 0;const r=i(206);e.Vertex=class{constructor(t){this.name=t,this.outgoing=[],r.log.write((()=>`Created ${this}`),r.log.Create)}on(t){return new r.Transition(this).on(t)}when(t){return new r.Transition(this).when(t)}to(t,e=r.TransitionKind.External){return new r.Transition(this).to(t,e)}isActive(t){return!this.parent||t.getVertex(this.parent)===this}evaluate(t,e,i){const r=this.getTransition(i);return r&&r.traverse(t,e,i),!!r}getTransition(t){return this.outgoing.find((e=>e.evaluate(t)))}toString(){return this.parent?`${this.parent}.${this.name}`:this.name}}},206:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0});var r=i(666);Object.defineProperty(e,"log",{enumerable:!0,get:function(){return r.log}});var n=i(497);Object.defineProperty(e,"random",{enumerable:!0,get:function(){return n.random}});var s=i(32);Object.defineProperty(e,"PseudoStateKind",{enumerable:!0,get:function(){return s.PseudoStateKind}});var o=i(947);Object.defineProperty(e,"TransitionKind",{enumerable:!0,get:function(){return o.TransitionKind}});var a=i(588);Object.defineProperty(e,"Vertex",{enumerable:!0,get:function(){return a.Vertex}});var h=i(65);Object.defineProperty(e,"Region",{enumerable:!0,get:function(){return h.Region}});var c=i(751);Object.defineProperty(e,"State",{enumerable:!0,get:function(){return c.State}});var u=i(624);Object.defineProperty(e,"PseudoState",{enumerable:!0,get:function(){return u.PseudoState}});var l=i(564);Object.defineProperty(e,"Transition",{enumerable:!0,get:function(){return l.Transition}});var d=i(732);Object.defineProperty(e,"Instance",{enumerable:!0,get:function(){return d.Instance}});var g=i(885);Object.defineProperty(e,"JSONSerializer",{enumerable:!0,get:function(){return g.JSONSerializer}})},666:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.log=void 0,function(t){const e=[];t.Create=1,t.Entry=2,t.Exit=4,t.Evaluate=8,t.Transition=16,t.User=128,t.add=function(t,...i){return e.push({consumer:t,category:i.reduce(((t,e)=>t|e))})},t.remove=function(t){delete e[t]},t.write=function(t,i){let r;e.forEach((e=>{e&&i&e.category&&e.consumer(r||(r=t()))}))}}(e.log||(e.log={}))},497:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.random=void 0;let i=t=>Math.floor(Math.random()*t);function r(t){return t[i(t.length)]}e.random=r,r.set=function(t){const e=i;return i=t,e}}},e={},i=function i(r){var n=e[r];if(void 0!==n)return n.exports;var s=e[r]={exports:{}};return t[r](s,s.exports,i),s.exports}(206);state=i})();