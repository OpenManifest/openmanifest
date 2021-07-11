(this.webpackJsonp=this.webpackJsonp||[]).push([[17],{630:function(e,n,t){"use strict";t.d(n,"a",(function(){return o}));var r=t(165),a=t(332),o=r.a.actions;a.a},636:function(e,n,t){"use strict";t.d(n,"a",(function(){return s}));var r=t(0),a=t(1),o=t(287),l=t(285),i=t(5);function s(){var e,n,t,a,s=Object(i.c)((function(e){return e.forms.plane})),d=Object(i.b)();return r.createElement(r.Fragment,null,r.createElement(o.a,{style:u.field,mode:"outlined",label:"Name",error:!!s.fields.name.error,value:s.fields.name.value,onChangeText:function(e){return d(i.a.forms.plane.setField(["name",e]))}}),r.createElement(l.a,{type:s.fields.name.error?"error":"info"},s.fields.name.error||""),r.createElement(o.a,{style:u.field,mode:"outlined",label:"Registration",error:!!s.fields.registration.error,value:s.fields.registration.value,onChangeText:function(e){return d(i.a.forms.plane.setField(["registration",e]))}}),r.createElement(l.a,{type:s.fields.registration.error?"error":"info"},s.fields.registration.error||""),r.createElement(o.a,{style:u.field,mode:"outlined",label:"hours",error:!!s.fields.hours.error,value:null==(e=s.fields.hours)||null==(n=e.value)?void 0:n.toString(),placeholder:"Optional",onChangeText:function(e){return d(i.a.forms.plane.setField(["hours",Number(e)]))}}),r.createElement(l.a,{type:s.fields.hours.error?"error":"info"},s.fields.hours.error||""),r.createElement(o.a,{style:u.field,mode:"outlined",label:"Min slots",error:!!s.fields.minSlots.error,value:null==(t=s.fields.minSlots.value)?void 0:t.toString(),keyboardType:"number-pad",onChangeText:function(e){return d(i.a.forms.plane.setField(["minSlots",Number(e)]))}}),r.createElement(l.a,{type:s.fields.minSlots.error?"error":"info"},s.fields.minSlots.error||"Minimum tickets required to send it"),r.createElement(o.a,{style:u.field,mode:"outlined",label:"Max slots",error:!!s.fields.maxSlots.error,value:null==(a=s.fields.maxSlots)?void 0:a.value.toString(),keyboardType:"number-pad",onChangeText:function(e){return d(i.a.forms.plane.setField(["maxSlots",Number(e)]))}}),r.createElement(l.a,{type:s.fields.maxSlots.error?"error":"info"},s.fields.maxSlots.error||"Maximum amount of jumpers who can be manifested on one load"))}var u=a.a.create({fields:{width:"100%",flex:1},field:{width:"100%",marginBottom:8}})},785:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return $}));var r,a=t(11),o=t.n(a),l=t(28),i=t.n(l),s=t(6),u=t.n(s),d=t(0),m=t(1),c=t(207),f=t(36),p=t(5),g=t(137),v=t(630),b=t(636),S=t(51),h=t(162),x=t(441),y=t(161),E=Object(f.gql)(r||(r=i()(["\n  mutation CreatePlane(\n    $name: String!,\n    $registration: String!,\n    $dropzoneId: Int!\n    $minSlots: Int!\n    $maxSlots: Int!\n    $hours: Int\n    $nextMaintenanceHours: Int\n  ){\n    createPlane(input: {\n      attributes: {\n        name: $name,\n        registration: $registration,\n        dropzoneId: $dropzoneId\n        minSlots: $minSlots\n        maxSlots: $maxSlots\n        hours: $hours\n        nextMaintenanceHours: $nextMaintenanceHours\n      }\n    }) {\n      plane {\n        id\n        name\n        registration\n        minSlots\n        maxSlots\n        hours\n        nextMaintenanceHours\n\n        dropzone {\n          id\n          name\n          planes {\n            id\n            name\n            registration\n            minSlots\n            maxSlots\n            hours\n            nextMaintenanceHours\n          }\n        }\n      }\n    }\n  }\n"])));function $(){var e=Object(p.c)((function(e){return e.forms.plane})),n=Object(y.b)(),t=Object(p.b)(),r=Object(S.useNavigation)(),a=Object(f.useMutation)(E),l=o()(a,2),i=l[0],s=l[1],m=Object(S.useIsFocused)();d.useEffect((function(){m&&t(p.a.forms.plane.reset())}),[m]);var $=d.useCallback((function(){var n=!1;return e.fields.name.value.length<3&&(n=!0,t(p.a.forms.plane.setFieldError(["name","Name is too short"]))),e.fields.registration.value.length<3&&(n=!0,t(p.a.forms.plane.setFieldError(["registration","Registration is too short"]))),e.fields.maxSlots.value||(n=!0,t(p.a.forms.plane.setFieldError(["maxSlots","Max slots must be specified"]))),!n}),[JSON.stringify(e.fields),t]),k=d.useCallback((function(){var a,o,l,s,d,m,c,f,p,g,b,S;return u.a.async((function(h){for(;;)switch(h.prev=h.next){case 0:if(a=e.fields,o=a.name,l=a.registration,s=a.maxSlots,d=a.minSlots,m=a.hours,c=a.nextMaintenanceHours,!$()){h.next=12;break}return h.prev=2,h.next=5,u.a.awrap(i({variables:{dropzoneId:Number(null==n||null==(f=n.dropzone)?void 0:f.id),name:o.value,registration:l.value,minSlots:d.value,maxSlots:s.value,hours:m.value,nextMaintenanceHours:c.value}}));case 5:b=h.sent,null!=(p=b.data)&&null!=(g=p.createPlane)&&g.plane&&(S=b.data.createPlane.plane,t(v.a.showSnackbar({message:"Added plane "+S.name,variant:"success"})),r.goBack()),h.next=12;break;case 9:h.prev=9,h.t0=h.catch(2),t(v.a.showSnackbar({message:h.t0.message,variant:"error"}));case 12:case"end":return h.stop()}}),null,null,[[2,9]],Promise)}),[JSON.stringify(e.fields),t,i]);return d.createElement(h.a,{contentContainerStyle:M.content},d.createElement(x.a,{name:"airplane",size:100,color:"#999999",style:{alignSelf:"center"}}),d.createElement(b.a,null),d.createElement(g.b,{style:M.fields},d.createElement(c.a,{mode:"contained",disabled:s.loading,onPress:k,loading:s.loading},"Save")))}var M=m.a.create({content:{paddingHorizontal:48},title:{fontSize:20,fontWeight:"bold"},separator:{marginVertical:30,height:1,width:"80%"},fields:{width:"100%",marginBottom:16},field:{marginBottom:8}})}}]);
//# sourceMappingURL=17.a1e2ac0e.chunk.js.map