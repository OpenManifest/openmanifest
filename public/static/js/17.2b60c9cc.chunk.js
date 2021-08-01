(this.webpackJsonp=this.webpackJsonp||[]).push([[17],{578:function(e,n,t){"use strict";t.d(n,"a",(function(){return o}));var r=t(138),a=t(295),o=r.a.actions;a.a},584:function(e,n,t){"use strict";t.d(n,"a",(function(){return s}));var r=t(0),a=t(1),o=t(251),i=t(249),l=t(4);function s(){var e,n,t,a,s=Object(l.c)((function(e){return e.forms.plane})),m=Object(l.b)();return r.createElement(r.Fragment,null,r.createElement(o.a,{style:u.field,mode:"outlined",label:"Name",error:!!s.fields.name.error,value:s.fields.name.value,onChangeText:function(e){return m(l.a.forms.plane.setField(["name",e]))}}),r.createElement(i.a,{type:s.fields.name.error?"error":"info"},s.fields.name.error||""),r.createElement(o.a,{style:u.field,mode:"outlined",label:"Registration",error:!!s.fields.registration.error,value:s.fields.registration.value,onChangeText:function(e){return m(l.a.forms.plane.setField(["registration",e]))}}),r.createElement(i.a,{type:s.fields.registration.error?"error":"info"},s.fields.registration.error||""),r.createElement(o.a,{style:u.field,mode:"outlined",label:"hours",error:!!s.fields.hours.error,value:null==(e=s.fields.hours)||null==(n=e.value)?void 0:n.toString(),placeholder:"Optional",onChangeText:function(e){return m(l.a.forms.plane.setField(["hours",Number(e)]))}}),r.createElement(i.a,{type:s.fields.hours.error?"error":"info"},s.fields.hours.error||""),r.createElement(o.a,{style:u.field,mode:"outlined",label:"Min slots",error:!!s.fields.minSlots.error,value:null==(t=s.fields.minSlots.value)?void 0:t.toString(),keyboardType:"number-pad",onChangeText:function(e){return m(l.a.forms.plane.setField(["minSlots",Number(e)]))}}),r.createElement(i.a,{type:s.fields.minSlots.error?"error":"info"},s.fields.minSlots.error||"Minimum tickets required to send it"),r.createElement(o.a,{style:u.field,mode:"outlined",label:"Max slots",error:!!s.fields.maxSlots.error,value:null==(a=s.fields.maxSlots)?void 0:a.value.toString(),keyboardType:"number-pad",onChangeText:function(e){return m(l.a.forms.plane.setField(["maxSlots",Number(e)]))}}),r.createElement(i.a,{type:s.fields.maxSlots.error?"error":"info"},s.fields.maxSlots.error||"Maximum amount of jumpers who can be manifested on one load"))}var u=a.a.create({fields:{width:"100%",flex:1},field:{width:"100%",marginBottom:8}})},730:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return E}));var r,a=t(9),o=t.n(a),i=t(32),l=t.n(i),s=t(5),u=t.n(s),m=t(0),d=t(1),c=t(174),f=t(39),p=t(47),g=t(4),v=t(136),b=t(578),S=t(584),h=t(135),x=t(397),y=Object(f.gql)(r||(r=l()(["\n  mutation UpdatePlane(\n    $id: Int!,\n    $name: String!,\n    $registration: String!,\n    $minSlots: Int!\n    $maxSlots: Int!\n    $hours: Int\n    $nextMaintenanceHours: Int\n  ){\n    updatePlane(input: {\n      id: $id\n      attributes: {\n        name: $name,\n        registration: $registration,\n        minSlots: $minSlots\n        maxSlots: $maxSlots\n        hours: $hours\n        nextMaintenanceHours: $nextMaintenanceHours\n      }\n    }) {\n      plane {\n        id\n        name\n        registration\n        minSlots\n        maxSlots\n        hours\n        nextMaintenanceHours\n\n        dropzone {\n          id\n          name\n          planes {\n            id\n            name\n            registration\n            minSlots\n            maxSlots\n            hours\n            nextMaintenanceHours\n          }\n        }\n      }\n    }\n  }\n"])));function E(){var e=Object(g.c)((function(e){return e.forms.plane})),n=(Object(g.c)((function(e){return e.global})),Object(g.b)()),t=Object(p.useNavigation)(),r=Object(p.useRoute)().params.plane;m.useEffect((function(){n(g.a.forms.plane.setOpen(r))}),[null==r?void 0:r.id]);var a=Object(f.useMutation)(y),i=o()(a,2),l=i[0],s=i[1],d=m.useCallback((function(){var t=!1;return e.fields.name.value.length<3&&(t=!0,n(g.a.forms.plane.setFieldError(["name","Name is too short"]))),e.fields.registration.value.length<3&&(t=!0,n(g.a.forms.plane.setFieldError(["registration","Registration is too short"]))),e.fields.maxSlots.value||(t=!0,n(g.a.forms.plane.setFieldError(["maxSlots","Max slots must be specified"]))),!t}),[JSON.stringify(e.fields),n]),E=m.useCallback((function(){var r,a,o,i,s,m,c,f,p,g,v;return u.a.async((function(S){for(;;)switch(S.prev=S.next){case 0:if(r=e.fields,a=r.name,o=r.registration,i=r.maxSlots,s=r.minSlots,m=r.hours,c=r.nextMaintenanceHours,!d()){S.next=12;break}return S.prev=2,S.next=5,u.a.awrap(l({variables:{id:Number(e.original.id),name:a.value,registration:o.value,minSlots:s.value,maxSlots:i.value,hours:m.value,nextMaintenanceHours:c.value}}));case 5:g=S.sent,null!=(f=g.data)&&null!=(p=f.updatePlane)&&p.plane&&(v=g.data.updatePlane.plane,n(b.a.showSnackbar({message:"Saved plane "+v.name,variant:"success"})),t.goBack()),S.next=12;break;case 9:S.prev=9,S.t0=S.catch(2),n(b.a.showSnackbar({message:S.t0.message,variant:"error"}));case 12:case"end":return S.stop()}}),null,null,[[2,9]],Promise)}),[JSON.stringify(e.fields),n,l]);return m.createElement(h.a,{contentContainerStyle:$.content},m.createElement(x.a,{name:"airplane",size:100,color:"#999999",style:{alignSelf:"center"}}),m.createElement(S.a,null),m.createElement(v.b,{style:$.actions},m.createElement(c.a,{mode:"contained",disabled:s.loading,onPress:E,loading:s.loading},"Save")))}var $=d.a.create({content:{paddingHorizontal:48},title:{fontSize:20,fontWeight:"bold"},separator:{marginVertical:30,height:1,width:"80%"},actions:{width:"100%",marginBottom:16},field:{marginBottom:8}})}}]);
//# sourceMappingURL=17.2b60c9cc.chunk.js.map