(this.webpackJsonp=this.webpackJsonp||[]).push([[23],{545:function(e,n,t){"use strict";t.d(n,"a",(function(){return d}));var r=t(11),i=t.n(r),l=t(0),a=t(178),o=t(50),c=t(552),u=t.n(c),s=(t(553),t(550));function d(e){var n=l.useState(!1),t=i()(n,2),r=t[0],c=t[1];l.useCallback((function(){c(!1)}),[c]),l.useCallback((function(n){var t=n.date;c(!1),e.onChange(t.getTime()/1e3)}),[c,e.onChange]);return l.createElement(l.Fragment,null,l.createElement(a.a,{onDismiss:function(){return c(!1)},visible:r,anchor:l.createElement(o.b.Item,{onPress:function(){return c(!0)},disabled:!!e.disabled,title:e.label,description:e.timestamp?Object(s.a)(1e3*e.timestamp,"yyyy/MM/dd"):"No date selected",left:function(){return l.createElement(o.b.Icon,{icon:"calendar"})}})},l.createElement(u.a,{selectedDays:e.timestamp?[new Date(1e3*e.timestamp)]:[],onDayClick:function(n){e.onChange(n.getTime()/1e3),c(!1)}})))}},570:function(e,n,t){"use strict";t.d(n,"a",(function(){return g}));var r=t(3),i=t.n(r),l=t(0),a=t(2),o=t(268),c=t(240),u=t(50),s=t(242),d=t(98),f=t(97),p=t(545);function m(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function b(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?m(Object(t),!0).forEach((function(n){i()(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):m(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function g(e){var n,t,r,i,m,g,v,y,O=Object(f.a)(d.a.ActAsRigInspector);return null!=(n=e.config)&&n.valueType&&"string"===(null==(t=e.config)?void 0:t.valueType)?l.createElement(a.a,{style:{flex:1}},l.createElement(o.a,{mode:"outlined",disabled:!O,style:{marginVertical:8},value:e.value,onChangeText:function(n){return e.onChange(b(b({},e.config),{},{value:n}))},label:e.config.label||""}),l.createElement(c.a,{type:"info"},e.config.description||"No description")):null!=(r=e.config)&&r.valueType&&"boolean"===(null==(i=e.config)?void 0:i.valueType)?l.createElement(u.b.Item,{title:e.config.label||"",disabled:!O,description:e.config.description,style:{marginVertical:8},right:function(){return l.createElement(s.a.Android,{status:e.value?"checked":"unchecked"})},onPress:function(){return e.onChange(b(b({},e.config),{},{value:!e.value}))}}):null!=(m=e.config)&&m.valueType&&"integer"===(null==(g=e.config)?void 0:g.valueType)?l.createElement(a.a,{style:{flex:1}},l.createElement(o.a,{disabled:!O,value:e.value,mode:"outlined",onChangeText:function(n){return e.onChange(b(b({},e.config),{},{value:n}))},label:e.config.label||"",keyboardType:"number-pad",style:{marginVertical:8}}),l.createElement(c.a,{type:"info"},e.config.description||"No description")):null!=(v=e.config)&&v.valueType&&"date"===(null==(y=e.config)?void 0:y.valueType)?l.createElement(a.a,{style:{flex:1}},l.createElement(p.a,{disabled:!O,timestamp:Number(e.value),onChange:function(n){return e.onChange(b(b({},e.config),{},{value:n.toString()}))},label:e.config.label||""}),l.createElement(c.a,{type:"info"},e.config.description||"No description")):null}},723:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return M}));var r=t(11),i=t.n(r),l=t(57),a=t.n(l),o=t(6),c=t.n(o),u=t(51),s=t(58),d=t(0),f=t(105),p=t(125),m=t(22),b=t.n(m),g=t(3),v=t.n(g),y=t(1),O=t(2),E=t(19),h=t(570),T=t(129),j=t(323),I=t(169),P=t(156),w=t(268),C=t(242),x=t(336);function k(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function S(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?k(Object(t),!0).forEach((function(n){v()(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):k(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function z(){var e,n=Object(E.c)((function(e){return e.forms.rigInspectionTemplate})),t=d.useState(null),r=i()(t,2),l=r[0],a=r[1],o=d.useState(!1),c=i()(o,2),u=c[0],s=c[1],f=Object(E.b)();return d.createElement(d.Fragment,null,null==(e=n.fields)?void 0:e.map((function(e,t){return d.createElement(d.Fragment,null,d.createElement(O.a,{style:{display:"flex",flexDirection:"row",alignItems:"center"}},d.createElement(O.a,{style:{flexGrow:1},onTouchEnd:function(){return a(S(S({},e),{},{index:t}))}},d.createElement(h.a,{config:e,value:(null==e?void 0:e.value)||"",onChange:function(){return null}})),d.createElement(T.a,{icon:"delete",onPress:function(){return f(E.a.forms.rigInspectionTemplate.setFields(n.fields.filter((function(e,n){return n!==t}))))}})),d.createElement(j.a,null))})),d.createElement(I.a,null,d.createElement(P.a,{visible:!!l},d.createElement(P.a.Title,null,"New field"),d.createElement(P.a.Content,null,d.createElement(w.a,{label:"Name",mode:"outlined",value:null==l?void 0:l.label,onChangeText:function(e){return a(S(S({},l),{},{label:e}))}}),d.createElement(w.a,{label:"Description",placeholder:"optional",mode:"outlined",value:null==l?void 0:l.description,onChangeText:function(e){return a(S(S({},l),{},{description:e}))}}),d.createElement(C.a.Item,{label:"This is a required field",mode:"android",onPress:function(){return a(S(S({},l),{},{isRequired:!(null!=l&&l.isRequired)}))},status:null!=l&&l.isRequired?"checked":"unchecked"})),d.createElement(P.a.Actions,null,d.createElement(p.a,{onPress:function(){return a(null)}},"Cancel"),d.createElement(p.a,{onPress:function(){void 0!==(null==l?void 0:l.index)?f(E.a.forms.rigInspectionTemplate.setFields(n.fields.map((function(e,n){return n===l.index?l:e})))):f(E.a.forms.rigInspectionTemplate.setFields([].concat(b()(n.fields),[l]))),a(null)}},"Save"))),d.createElement(x.a.Group,{open:u,visible:!0,icon:u?"close":"plus",actions:[{icon:"pencil",label:"Text",onPress:function(){return a({valueType:"string"})}},{icon:"calendar",label:"Date",onPress:function(){return a({valueType:"date"})}},{icon:"counter",label:"Number",onPress:function(){return a({valueType:"integer"})}},{icon:"checkbox-marked-circle-outline",label:"Checkbox",onPress:function(){return a({valueType:"boolean"})}}],onStateChange:function(e){var n=e.open;return s(n)}})))}y.a.create({fields:{flex:1},field:{marginBottom:8}});var D,N,F=t(183),$=t(278),R=t(98),q=t(97),A=Object(s.a)(D||(D=a()(["\n  query RigInspection($dropzoneId: Int!) {\n    dropzone(id: $dropzoneId) {\n      id\n      rigInspectionTemplate {\n        id\n        name\n        definition\n      }\n    }\n  }\n"]))),J=Object(s.a)(N||(N=a()(["\n  mutation UpdateRigInspectionTemplate(\n    $dropzoneId: Int,\n    $formId: Int,\n    $definition: String\n  ) {\n    updateFormTemplate(input: {\n      id: $formId\n      attributes: {\n        dropzoneId: $dropzoneId,\n        definition: $definition\n      }\n    }) {\n      formTemplate {\n        id\n        name\n        definition\n      }\n      fieldErrors {\n        field\n        message\n      }\n      errors\n    }\n  }\n"])));function M(){var e,n,t,r,l=Object(E.c)((function(e){return e.forms.rigInspectionTemplate})),a=Object($.a)(),o=Object(E.b)(),s=Object(u.useQuery)(A,{variables:{dropzoneId:Number(null==a||null==(e=a.dropzone)?void 0:e.id)}}),m=s.data,b=(s.loading,Object(q.a)(R.a.UpdateFormTemplate)),g=Object(u.useMutation)(J),v=i()(g,2),y=v[0],O=v[1];d.useEffect((function(){var e;null!=m&&null!=(e=m.dropzone)&&e.rigInspectionTemplate&&o(E.a.forms.rigInspectionTemplate.setOpen(m.dropzone.rigInspectionTemplate))}),[JSON.stringify(null==m||null==(n=m.dropzone)?void 0:n.rigInspectionTemplate)]);var h=d.useCallback((function(){var e;return c.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:return n.prev=0,n.next=3,c.a.awrap(y({variables:{formId:Number(null==m?void 0:m.dropzone.rigInspectionTemplate.id),dropzoneId:Number(null==m||null==(e=m.dropzone)?void 0:e.id),definition:JSON.stringify(l.fields)}}));case 3:o(E.a.notifications.showSnackbar({message:"Template saved",variant:"success"})),n.next=9;break;case 6:n.prev=6,n.t0=n.catch(0),o(E.a.notifications.showSnackbar({message:n.t0.message,variant:"error"}));case 9:case"end":return n.stop()}}),null,null,[[0,6]],Promise)}),[JSON.stringify(l.fields),null==l||null==(t=l.original)?void 0:t.id,null==a||null==(r=a.dropzone)?void 0:r.id]);return d.createElement(F.a,null,d.createElement(f.a,{style:{width:"100%"}},d.createElement(f.a.Title,{title:"Rig Inspection Form Template"}),d.createElement(f.a.Content,null,d.createElement(z,null)),d.createElement(f.a.Actions,null,d.createElement(p.a,{disabled:!b,mode:"contained",loading:O.loading,onPress:function(){return h()},style:{width:"100%"}},"Save template"))))}}}]);
//# sourceMappingURL=23.7f5fd128.chunk.js.map