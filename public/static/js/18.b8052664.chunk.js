(this.webpackJsonp=this.webpackJsonp||[]).push([[18],{482:function(e,t,n){"use strict";n.d(t,"a",(function(){return r}));var a=n(143),l=n(256),r=a.a.actions;l.a},498:function(e,t,n){"use strict";n.d(t,"a",(function(){return S}));var a,l=n(22),r=n.n(l),i=n(9),s=n.n(i),o=n(71),u=n.n(o),c=n(49),d=n(72),f=n(0),m=n(1),v=n(2),p=n(249),g=n(221),b=n(165),h=n(52),E=n(222),k=n(303),w=n(20),y=n(228).a.actions,T=Object(d.a)(a||(a=u()(["\n  query QueryExtras(\n    $dropzoneId: Int!\n  ) {\n    extras(dropzoneId: $dropzoneId) {\n      id\n      cost\n      name\n\n      ticketTypes {\n        id\n        name\n      }\n    }\n  }\n"])));function S(){var e,t,n,a,l,i=Object(w.k)((function(e){return e.ticketTypeForm})),o=Object(w.j)(),u=Object(w.k)((function(e){return e.global})),d=f.useState(!1),m=s()(d,2),S=m[0],I=m[1],F=Object(c.useQuery)(T,{variables:{dropzoneId:Number(null==(e=u.currentDropzone)?void 0:e.id)}}),$=F.data;F.loading,F.refetch;return f.createElement(f.Fragment,null,f.createElement(p.a,{style:x.field,mode:"outlined",label:"Name",error:!!i.fields.name.error,value:i.fields.name.value||"",onChangeText:function(e){return o(y.setField(["name",e]))}}),f.createElement(g.a,{type:i.fields.name.error?"error":"info"},i.fields.name.error||"Name of the ticket users will see"),f.createElement(p.a,{style:x.field,mode:"outlined",label:"Price",error:!!i.fields.cost.error,value:null==(t=i.fields.cost)||null==(n=t.value)?void 0:n.toString(),onChangeText:function(e){return o(y.setField(["cost",Number(e)]))}}),f.createElement(g.a,{type:i.fields.cost.error?"error":"info"},i.fields.cost.error||"Base cost without extra ticket addons"),f.createElement(v.a,{style:{width:"100%"}},f.createElement(b.a,{onDismiss:function(){return I(!1)},visible:S,style:{position:"absolute",right:"10%",left:"10%",flex:1},anchor:f.createElement(h.b.Item,{onPress:function(){I(!0)},title:i.fields.altitude.value&&[4e3,14e3].includes(i.fields.altitude.value)?{14e3:"Height",4e3:"Hop n Pop"}[i.fields.altitude.value.toString()]:"Custom",style:{width:"100%",flex:1},right:function(){return f.createElement(h.b.Icon,{icon:i.fields.altitude.value&&[4e3,14e3].includes(i.fields.altitude.value)?{14e3:"airplane",4e3:"parachute"}[i.fields.altitude.value.toString()]:"pencil-plus"})}})},f.createElement(h.b.Item,{onPress:function(){o(y.setField(["altitude",4e3])),I(!1)},title:"Hop n Pop",right:function(){return f.createElement(h.b.Icon,{icon:"parachute"})}}),f.createElement(h.b.Item,{onPress:function(){o(y.setField(["altitude",14e3])),I(!1)},title:"Height",right:function(){return f.createElement(h.b.Icon,{icon:"airplane-takeoff"})}}),f.createElement(h.b.Item,{onPress:function(){o(y.setField(["altitude",7e3])),I(!1)},title:"Other",right:function(){return f.createElement(h.b.Icon,{icon:"parachute"})}})),(!i.fields.altitude.value||![4e3,14e3].includes(i.fields.altitude.value))&&f.createElement(p.a,{style:x.field,mode:"outlined",label:"Custom altitude",error:!!i.fields.altitude.error,value:null==(a=i.fields.altitude)||null==(l=a.value)?void 0:l.toString(),onChangeText:function(e){return o(y.setField(["altitude",Number(e)]))}}),f.createElement(E.a.Item,{label:"Tandem",style:{width:"100%"},status:i.fields.isTandem.value?"checked":"unchecked",onPress:function(){return o(y.setField(["isTandem",!i.fields.isTandem.value]))}}),f.createElement(g.a,{type:i.fields.isTandem.error?"error":"info"},i.fields.isTandem.error||"Allow also manifesting a passenger when using this ticket type"),f.createElement(E.a.Item,{label:"Public manifesting",style:{width:"100%"},status:i.fields.allowManifestingSelf.value?"checked":"unchecked",onPress:function(){return o(y.setField(["allowManifestingSelf",!i.fields.allowManifestingSelf.value]))}}),f.createElement(g.a,{type:i.fields.allowManifestingSelf.error?"error":"info"},i.fields.allowManifestingSelf.error||"Allow users to manifest themselves with this ticket"),f.createElement(k.a,null),f.createElement(h.b.Subheader,null,"Enabled ticket add-ons"),null==$?void 0:$.extras.map((function(e){var t;return f.createElement(E.a.Item,{key:"extra-"+e.id,label:e.name,status:null!=(t=i.fields.extras.value)&&t.map((function(e){return e.id})).includes(e.id)?"checked":"unchecked",onPress:function(){var t,n;return o(y.setField(["extras",null!=(t=i.fields.extras.value)&&t.map((function(e){return e.id})).includes(e.id)?null==(n=i.fields.extras.value)?void 0:n.filter((function(t){return t.id!==e.id})):[].concat(r()(i.fields.extras.value),[e])]))}})}))))}var x=m.a.create({field:{marginBottom:8,width:"100%"}})},525:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return x}));var a,l=n(9),r=n.n(l),i=n(71),s=n.n(i),o=n(11),u=n.n(o),c=n(0),d=n(1),f=n(116),m=n(49),v=n(20),p=n(36),g=n(482),b=n(112),h=n(228),E=n(498),k=n(40),w=n(169),y=n(351),T=h.a.actions,S=(b.a.actions,Object(m.gql)(a||(a=s()(["\n  mutation CreateTicketType(\n    $name: String,\n    $cost: Float,\n    $dropzoneId: Int!\n    $altitude: Int\n    $allowManifestingSelf: Boolean\n    $isTandem: Boolean\n  ){\n    createTicketType(input: {\n      attributes: {\n        name: $name,\n        cost: $cost,\n        dropzoneId: $dropzoneId\n        altitude: $altitude\n        allowManifestingSelf: $allowManifestingSelf\n        isTandem: $isTandem\n      }\n    }) {\n      ticketType {\n        id\n        name\n        altitude\n        cost\n        allowManifestingSelf\n        extras {\n          id\n          name\n          cost\n        }\n      }\n    }\n  }\n"]))));function x(){var e=Object(v.k)((function(e){return e})),t=e.ticketTypeForm,n=e.global,a=Object(v.j)(),l=Object(k.useNavigation)(),i=Object(m.useMutation)(S),s=r()(i,2),o=s[0],d=s[1],b=Object(k.useIsFocused)();c.useEffect((function(){b&&a(T.reset())}),[b]);var h=c.useCallback((function(){var e=!1;return(!t.fields.name.value||t.fields.name.value.length<3)&&(e=!0,a(T.setFieldError(["name","Name is too short"]))),t.fields.cost.value<1&&(e=!0,a(T.setFieldError(["cost","Cost must be at least $1"]))),t.fields.altitude.value||(e=!0,a(T.setFieldError(["altitude","Altitude must be specified"]))),!e}),[JSON.stringify(t.fields),a]),x=c.useCallback((function(){var e,r,i,s,c,d,f,m,p,b,E,k,w,y,S,x,I,F,$,O;return u.a.async((function(j){for(;;)switch(j.prev=j.next){case 0:if(e=t.fields,r=e.name,i=e.cost,s=e.allowManifestingSelf,c=e.altitude,d=e.extras,f=e.isTandem,!h()){j.next=15;break}return j.prev=2,j.next=5,u.a.awrap(o({variables:{dropzoneId:Number(null==(m=n.currentDropzone)?void 0:m.id),name:r.value,cost:i.value,altitude:c.value,allowManifestingSelf:s.value,extraIds:null==d||null==(p=d.value)?void 0:p.map((function(e){return e.id})),isTandem:!!f.value}}));case 5:if(null==(F=j.sent)||null==(b=F.data)||null==(E=b.createTicketType)||null==(k=E.fieldErrors)||k.map((function(e){var t=e.field,n=e.message;switch(t){case"name":return a(T.setFieldError(["name",n]));case"altitude":return a(T.setFieldError(["altitude",n]));case"cost":return a(T.setFieldError(["cost",n]));case"allow_manifesting_self":return a(T.setFieldError(["allowManifestingSelf",n]));case"extras":return a(T.setFieldError(["extras",n]))}})),null==F||null==(w=F.data)||null==(y=w.createTicketType)||null==(S=y.errors)||!S.length){j.next=9;break}return j.abrupt("return",a(v.i.showSnackbar({message:null==F||null==($=F.data)||null==(O=$.createTicketType)?void 0:O.errors[0],variant:"error"})));case 9:null!=(x=F.data)&&null!=(I=x.createTicketType)&&I.ticketType&&(a(g.a.showSnackbar({message:"Saved",variant:"success"})),l.goBack()),j.next=15;break;case 12:j.prev=12,j.t0=j.catch(2),a(g.a.showSnackbar({message:j.t0.message,variant:"error"}));case 15:case"end":return j.stop()}}),null,null,[[2,12]],Promise)}),[JSON.stringify(t.fields),a,o]);return c.createElement(w.a,{contentContainerStyle:{paddingHorizontal:48}},c.createElement(y.a,{name:"ticket",size:100,color:"#999999",style:{alignSelf:"center"}}),c.createElement(E.a,null),c.createElement(p.b,{style:I.actions},c.createElement(f.a,{mode:"contained",disabled:d.loading,onPress:x,loading:d.loading},"Save")))}var I=d.a.create({separator:{marginVertical:30,height:1,width:"80%"},actions:{marginVertical:16,width:"100%"}})}}]);
//# sourceMappingURL=18.b8052664.chunk.js.map