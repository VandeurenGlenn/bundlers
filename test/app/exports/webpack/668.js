(self.webpackChunkthings=self.webpackChunkthings||[]).push([[668],{0:t=>{function o(t){return Promise.resolve().then((()=>{var o=new Error("Cannot find module '"+t+"'");throw o.code="MODULE_NOT_FOUND",o}))}o.keys=()=>[],o.resolve=o,o.id=0,t.exports=o},597:(t,o,e)=>{"use strict";e.r(o);var i=e(392),s=e(732),c=e(2),d=(e(505),e(369),e(193),e(277),e(291),e(726),e(362),e(636),e(721));customElements.define("todo-view",class extends i.oi{static properties={createOpened:{type:Boolean,reflect:!0},todos:{type:Array},nothingTodo:{type:Boolean}};constructor(){super(),this.todos=[]}async connectedCallback(){if(super.connectedCallback(),globalThis.todoStorage||(globalThis.todoStorage=await new c.Z("todos"),await globalThis.todoStorage.init()),await todoStorage.length()>0){const t=await todoStorage.keys(),o=await todoStorage.values();this.todos=o.map(((o,e)=>({id:t[e],value:(new TextDecoder).decode(o)}))),this.nothingTodo=!1}else this.nothingTodo=!0}static styles=i.iv`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      --svg-icon-color: #fff;
    }

    mwc-fab {
      position: absolute;
      right: 12px;
      bottom: 12px;
    }

    .container {
      display: flex;
      flex-direction: column;
      height: 320px;
      max-width: 480px;
      width: 100%;
    }

    mwc-textfield {
      width: 100%;
    }

    mwc-check-list-item {
      --svg-icon-color: #555;
    }

    mwc-check-list-item {
      --mdc-ripple-color: transaparent !important;
    }

    .nothing-todo {
      padding: 12px;
    }

    @media(min-width: 720px) {
      :host {

        justify-content: center;
      }

      mwc-list {
        box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)
      }
    }
  `;async createclosed(t){if("confirm"===t.detail?.action){const t=this.renderRoot.querySelector("mwc-textfield").value,o=(0,d.Z)();await todoStorage.put(o,t),this.todos.push({id:o,value:t}),this.nothingTodo=!1,this.requestUpdate()}this.#t()}#t(){this.renderRoot.querySelector("mwc-textfield").value=""}async#o(t){if(!todoStorage.has(t))return;await todoStorage.delete(t);let o=0;for(const e of this.todos){if(e.id===t){const t=this.todos.indexOf(this.todos[o]);this.todos.splice(t,1);break}o++}0===this.todos.length&&(this.nothingTodo=!0),this.requestUpdate()}get todoTemplate(){return this.nothingTodo?i.dy`<span class="nothing-todo">
        Nothing todo.
      </span>`:i.dy`
      ${(0,s.U)(this.todos,((t,o)=>i.dy`
      <mwc-check-list-item hasMeta left selected todoId=${t.id}>
        ${t.value}
        <custom-svg-icon icon="delete" slot="meta" @click="${()=>this.#o(t.id)}"></custom-svg-icon>
      </mwc-check-list-item>
      ${o<this.todos.length-1?i.dy`<li divider padded role="seperator"></li>`:""}
    
    `))}
    
  `}render(){return i.dy`
    <mwc-dialog @closed="${t=>this.createclosed(t)}">
      <mwc-textfield label="What Todo?"></mwc-textfield>
      <mwc-button
        slot="primaryAction"
        dialogAction="confirm">
        confirm
      </mwc-button>

      <mwc-button
        slot="secondaryAction"
        dialogAction="cancel">
        Cancel
      </mwc-button>
    </mwc-dialog>

    <span class="container">
      <mwc-list multi>
      ${this.todoTemplate}
      </mwc-list>
    </span>
    
    <mwc-fab extended label="Create TODO" @click="${()=>this.renderRoot.querySelector("mwc-dialog").setAttribute("open","")}">
      <custom-svg-icon slot="icon" icon="add"></custom-svg-icon>
    </mwc-fab>
    `}})}}]);