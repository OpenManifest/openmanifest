(this.webpackJsonp=this.webpackJsonp||[]).push([[22],{655:function(e,n,r){"use strict";r.d(n,"a",(function(){return m}));var i=r(0),t=r(1),l=r(2),a=r(287),o=r(285),s=r(374),u=r(5),d=r(336),f=r(168);function m(){var e,n,r,t,m,g,h,v,p,E,b,x,F,y,w,S,W,k,$,O,j,I,N,T,C=Object(u.c)((function(e){return e.forms.user})),P=Object(u.b)();return i.useEffect((function(){var e;C.original&&(C.fields.exitWeight.value||P(u.a.forms.user.setField(["exitWeight",C.original.exitWeight||"60"])),!C.fields.rigs.value&&null!=(e=C.original)&&e.id&&P(u.a.forms.user.setField(["rigs",C.original.rigs])))}),[null==(e=C.original)?void 0:e.id]),i.createElement(i.Fragment,null,i.createElement(a.a,{style:c.field,mode:"outlined",label:"Name",error:!!C.fields.name.error,value:(null==(n=C.fields.name)||null==(r=n.value)?void 0:r.toString())||"",onChangeText:function(e){return P(u.a.forms.user.setField(["name",e]))}}),i.createElement(o.a,{type:C.fields.name.error?"error":"info"},C.fields.name.error||" "),i.createElement(a.a,{style:c.field,mode:"outlined",label:"Email",error:!!C.fields.email.error,value:(null==(t=C.fields.email)||null==(m=t.value)?void 0:m.toString())||"",onChangeText:function(e){return P(u.a.forms.user.setField(["email",e]))}}),i.createElement(o.a,{type:C.fields.email.error?"error":"info"},C.fields.email.error||" "),i.createElement(a.a,{style:c.field,mode:"outlined",label:"Phone",error:!!C.fields.phone.error,value:(null==(g=C.fields.phone)||null==(h=g.value)?void 0:h.toString())||"",onChangeText:function(e){return P(u.a.forms.user.setField(["phone",e]))}}),i.createElement(o.a,{type:C.fields.phone.error?"error":"info"},C.fields.phone.error||""),i.createElement(a.a,{style:c.field,mode:"outlined",label:"Exit weight",error:!!C.fields.exitWeight.error,value:(null==(v=C.fields.exitWeight)||null==(p=v.value)?void 0:p.toString())||"",keyboardType:"numbers-and-punctuation",right:function(){return i.createElement(a.a.Affix,{text:"kg"})},onChangeText:function(e){return P(u.a.forms.user.setField(["exitWeight",e]))}}),i.createElement(o.a,{type:C.fields.exitWeight.error?"error":"info"},C.fields.exitWeight.error||""),i.createElement(s.a,null),i.createElement(l.a,{style:{width:"100%"}},i.createElement(f.a,{value:(null==C||null==(E=C.fields)||null==(b=E.license)||null==(x=b.value)?void 0:x.federation)||C.federation.value,onSelect:function(e){return P(u.a.forms.user.setFederation(e))},required:!0}),i.createElement(o.a,{type:C.federation.error?"error":"info"},C.federation.error||""),((null==C||null==(F=C.fields)||null==(y=F.license)||null==(w=y.value)||null==(S=w.federation)?void 0:S.id)||(null==C||null==(W=C.federation)||null==(k=W.value)?void 0:k.id))&&i.createElement(i.Fragment,null,i.createElement(d.a,{value:C.fields.license.value,federationId:Number((null==C||null==($=C.fields)||null==(O=$.license)||null==(j=O.value)||null==(I=j.federation)?void 0:I.id)||(null==(N=C.federation)||null==(T=N.value)?void 0:T.id)),onSelect:function(e){return P(u.a.forms.user.setField(["license",e]))},required:!0}),i.createElement(o.a,{type:C.fields.license.error?"error":"info"},C.fields.license.error||""))))}var c=t.a.create({fields:{flex:1,width:"100%",paddingTop:32},field:{marginBottom:8,width:"100%"},ticketAddons:{marginBottom:8}})},789:function(e,n,r){"use strict";r.r(n),r.d(n,"default",(function(){return x}));var i,t=r(9),l=r.n(t),a=r(29),o=r.n(a),s=r(6),u=r.n(s),d=r(0),f=r(1),m=r(207),c=r(38),g=r(5),h=r(138),v=r(655),p=r(52),E=r(164),b=Object(c.gql)(i||(i=o()(["\n  mutation UpdateUser(\n    $id: Int,\n    $name: String,\n    $phone: String,\n    $email: String,\n    $licenseId: Int,\n    $exitWeight: Float,\n  ){\n    updateUser(input: {\n      id: $id\n      attributes: {\n        name: $name,\n        phone: $phone,\n        email: $email,\n        licenseId: $licenseId,\n        exitWeight: $exitWeight,\n      }\n    }) {\n      user {\n        id\n        name\n        exitWeight\n        email\n        phone\n        rigs {\n          id\n          model\n          make\n          serial\n          canopySize\n        }\n        jumpTypes {\n          id\n          name\n        }\n        license {\n          id\n          name\n\n          federation {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n"])));function x(){var e=Object(g.c)((function(e){return e.forms.user})),n=(Object(g.c)((function(e){return e.global})),Object(g.b)()),r=Object(p.useNavigation)(),i=Object(p.useRoute)().params.user;d.useEffect((function(){n(g.a.forms.user.setOpen(i))}),[null==i?void 0:i.id]);var t=Object(c.useMutation)(b),a=l()(t,2),o=a[0],s=a[1],f=d.useCallback((function(){var r,i,t,l,a,o,s,u,d,f=!1,m=new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);return((null==(r=e.fields.name)||null==(i=r.value)?void 0:i.length)||0)<3&&(f=!0,n(g.a.forms.user.setFieldError(["name","Name is too short"]))),((null==(t=e.fields.email)||null==(l=t.value)?void 0:l.length)||0)<3&&(f=!0,n(g.a.forms.user.setFieldError(["email","Email is too short"]))),((null==(a=e.fields.phone)||null==(o=a.value)?void 0:o.length)||0)<3&&(f=!0,n(g.a.forms.user.setFieldError(["phone","Phone number is too short"]))),m.test((null==(s=e.fields)||null==(u=s.email)?void 0:u.value)||"")||(f=!0,n(g.a.forms.user.setFieldError(["email","Please enter a valid email"]))),((null==(d=e.fields.exitWeight)?void 0:d.value)||0)<30&&(f=!0,n(g.a.forms.user.setFieldError(["exitWeight","Exit weight seems too low?"]))),!f}),[JSON.stringify(e.fields),n]),x=d.useCallback((function(){var i,t,l,a,s,d,m,c,h,v,p,E,b;return u.a.async((function(x){for(;;)switch(x.prev=x.next){case 0:if(i=e.fields,t=i.name,l=i.license,a=i.phone,s=i.email,d=i.exitWeight,!f()){x.next=12;break}return x.prev=2,x.next=5,u.a.awrap(o({variables:{id:Number(e.original.id),name:t.value,licenseId:null!=(m=l.value)&&m.id?Number(l.value.id):null,phone:a.value,exitWeight:parseFloat(d.value),email:s.value}}));case 5:v=x.sent,null!=(c=v.data)&&null!=(h=c.updateUser)&&h.user&&(p=v.data.updateUser,E=p.fieldErrors,b=p.errors,E?null==E||E.map((function(e){var r=e.field,i=e.message;switch(r){case"name":return n(g.a.forms.user.setFieldError(["name",i]));case"exit_weight":return n(g.a.forms.user.setFieldError(["exitWeight",i]));case"license_id":return n(g.a.forms.user.setFieldError(["license",i]));case"phone":return n(g.a.forms.user.setFieldError(["phone",i]));case"email":return n(g.a.forms.user.setFieldError(["email",i]))}})):null!=b&&b.length?b.map((function(e){return n(g.a.notifications.showSnackbar({message:e,variant:"error"}))})):(n(g.a.notifications.showSnackbar({message:"Profile has been updated",variant:"success"})),r.goBack(),n(g.a.forms.user.reset()))),x.next=12;break;case 9:x.prev=9,x.t0=x.catch(2),n(g.a.notifications.showSnackbar({message:x.t0.message,variant:"error"}));case 12:case"end":return x.stop()}}),null,null,[[2,9]],Promise)}),[JSON.stringify(e.fields),n,o]);return d.createElement(E.a,{contentContainerStyle:{paddingHorizontal:48}},d.createElement(v.a,null),d.createElement(h.b,{style:F.fields},d.createElement(m.a,{mode:"contained",disabled:s.loading,onPress:x,loading:s.loading},"Save")))}var F=f.a.create({container:{flex:1,alignItems:"center",paddingTop:56},title:{fontSize:20,fontWeight:"bold"},separator:{marginVertical:30,height:1,width:"80%"},fields:{width:"100%",marginBottom:16},field:{marginBottom:8}})}}]);
//# sourceMappingURL=22.23fa07e6.chunk.js.map