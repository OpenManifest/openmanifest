(this.webpackJsonp=this.webpackJsonp||[]).push([[16],{482:function(e,n,t){"use strict";t.d(n,"a",(function(){return o}));var r=t(143),a=t(256),o=r.a.actions;a.a},496:function(e,n,t){"use strict";t.d(n,"a",(function(){return u}));var r=t(0),a=t(1),o=t(249),i=t(221),l=t(20),s=t(227).a.actions;function u(){var e,n,t,a,u=Object(l.k)((function(e){return e.planeForm})),m=Object(l.j)();return r.createElement(r.Fragment,null,r.createElement(o.a,{style:d.field,mode:"outlined",label:"Name",error:!!u.fields.name.error,value:u.fields.name.value,onChangeText:function(e){return m(s.setField(["name",e]))}}),r.createElement(i.a,{type:u.fields.name.error?"error":"info"},u.fields.name.error||""),r.createElement(o.a,{style:d.field,mode:"outlined",label:"Registration",error:!!u.fields.registration.error,value:u.fields.registration.value,onChangeText:function(e){return m(s.setField(["registration",e]))}}),r.createElement(i.a,{type:u.fields.registration.error?"error":"info"},u.fields.registration.error||""),r.createElement(o.a,{style:d.field,mode:"outlined",label:"hours",error:!!u.fields.hours.error,value:null==(e=u.fields.hours)||null==(n=e.value)?void 0:n.toString(),placeholder:"Optional",onChangeText:function(e){return m(s.setField(["hours",Number(e)]))}}),r.createElement(i.a,{type:u.fields.hours.error?"error":"info"},u.fields.hours.error||""),r.createElement(o.a,{style:d.field,mode:"outlined",label:"Min slots",error:!!u.fields.minSlots.error,value:null==(t=u.fields.minSlots.value)?void 0:t.toString(),keyboardType:"number-pad",onChangeText:function(e){return m(s.setField(["minSlots",Number(e)]))}}),r.createElement(i.a,{type:u.fields.minSlots.error?"error":"info"},u.fields.minSlots.error||"Minimum tickets required to send it"),r.createElement(o.a,{style:d.field,mode:"outlined",label:"Max slots",error:!!u.fields.maxSlots.error,value:null==(a=u.fields.maxSlots)?void 0:a.value.toString(),keyboardType:"number-pad",onChangeText:function(e){return m(s.setField(["maxSlots",Number(e)]))}}),r.createElement(i.a,{type:u.fields.maxSlots.error?"error":"info"},u.fields.maxSlots.error||"Maximum amount of jumpers who can be manifested on one load"))}var d=a.a.create({fields:{width:"100%",flex:1},field:{width:"100%",marginBottom:8}})},521:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return M}));var r,a=t(9),o=t.n(a),i=t(71),l=t.n(i),s=t(11),u=t.n(s),d=t(0),m=t(1),c=t(116),f=t(49),g=t(20),v=t(36),p=t(482),S=t(112),h=t(227),b=t(496),x=t(40),y=t(169),E=t(351),k=h.a.actions,$=(S.a.actions,Object(f.gql)(r||(r=l()(["\n  mutation CreatePlane(\n    $name: String!,\n    $registration: String!,\n    $dropzoneId: Int!\n    $minSlots: Int!\n    $maxSlots: Int!\n    $hours: Int\n    $nextMaintenanceHours: Int\n  ){\n    createPlane(input: {\n      attributes: {\n        name: $name,\n        registration: $registration,\n        dropzoneId: $dropzoneId\n        minSlots: $minSlots\n        maxSlots: $maxSlots\n        hours: $hours\n        nextMaintenanceHours: $nextMaintenanceHours\n      }\n    }) {\n      plane {\n        id\n        name\n        registration\n        minSlots\n        maxSlots\n        hours\n        nextMaintenanceHours\n\n        dropzone {\n          id\n          name\n          planes {\n            id\n            name\n            registration\n            minSlots\n            maxSlots\n            hours\n            nextMaintenanceHours\n          }\n        }\n      }\n    }\n  }\n"]))));function M(){var e=Object(g.k)((function(e){return e})),n=e.planeForm,t=e.global,r=Object(g.j)(),a=Object(x.useNavigation)(),i=Object(f.useMutation)($),l=o()(i,2),s=l[0],m=l[1],S=Object(x.useIsFocused)();d.useEffect((function(){S&&r(k.reset())}),[S]);var h=d.useCallback((function(){var e=!1;return n.fields.name.value.length<3&&(e=!0,r(k.setFieldError(["name","Name is too short"]))),n.fields.registration.value.length<3&&(e=!0,r(k.setFieldError(["registration","Registration is too short"]))),n.fields.maxSlots.value||(e=!0,r(k.setFieldError(["maxSlots","Max slots must be specified"]))),!e}),[JSON.stringify(n.fields),r]),M=d.useCallback((function(){var e,o,i,l,d,m,c,f,g,v,S,b;return u.a.async((function(x){for(;;)switch(x.prev=x.next){case 0:if(e=n.fields,o=e.name,i=e.registration,l=e.maxSlots,d=e.minSlots,m=e.hours,c=e.nextMaintenanceHours,!h()){x.next=12;break}return x.prev=2,x.next=5,u.a.awrap(s({variables:{dropzoneId:Number(null==(f=t.currentDropzone)?void 0:f.id),name:o.value,registration:i.value,minSlots:d.value,maxSlots:l.value,hours:m.value,nextMaintenanceHours:c.value}}));case 5:S=x.sent,null!=(g=S.data)&&null!=(v=g.createPlane)&&v.plane&&(b=S.data.createPlane.plane,r(p.a.showSnackbar({message:"Added plane "+b.name,variant:"success"})),a.goBack()),x.next=12;break;case 9:x.prev=9,x.t0=x.catch(2),r(p.a.showSnackbar({message:x.t0.message,variant:"error"}));case 12:case"end":return x.stop()}}),null,null,[[2,9]],Promise)}),[JSON.stringify(n.fields),r,s]);return d.createElement(y.a,{contentContainerStyle:F.content},d.createElement(E.a,{name:"airplane",size:100,color:"#999999",style:{alignSelf:"center"}}),d.createElement(b.a,null),d.createElement(v.b,{style:F.fields},d.createElement(c.a,{mode:"contained",disabled:m.loading,onPress:M,loading:m.loading},"Save")))}var F=m.a.create({content:{paddingHorizontal:48},title:{fontSize:20,fontWeight:"bold"},separator:{marginVertical:30,height:1,width:"80%"},fields:{width:"100%",marginBottom:16},field:{marginBottom:8}})}}]);
//# sourceMappingURL=16.6f76c273.chunk.js.map