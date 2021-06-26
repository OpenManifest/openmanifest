(this.webpackJsonp=this.webpackJsonp||[]).push([[24],{532:function(e,n,t){"use strict";var r=t(533),i=t(0),l=t(2),a=t(317);n.a=function(e){var n=e.items,t=e.selected,o=e.isSelected,s=e.isDisabled,u=e.icon,d=e.renderItemLabel,c=e.onChangeSelected,f=e.autoSelectFirst;return i.useEffect((function(){(!t||!t.length&&n.length&&f)&&c([n[0]])}),[JSON.stringify(t),JSON.stringify(n),f]),i.createElement(l.a,{style:{flexDirection:"row",flexWrap:"wrap"}},n.map((function(e){return i.createElement(a.a,{key:JSON.stringify(e),mode:"outlined",icon:!t.some((function(n){return Object(r.isEqual)(e,n)}))&&u?u:void 0,style:{margin:1},disabled:s(e),selected:o?o(e):t.some((function(n){return Object(r.isEqual)(e,n)})),onPress:function(){return c(1===t.length?[e]:Object(r.xorBy)(t,[e],JSON.stringify))}},d(e))})))}},576:function(e,n,t){"use strict";t.d(n,"a",(function(){return w}));var r,i=t(0),l=t(1),a=t(2),o=t(266),s=t(238),u=t(318),d=t(19),c=t(11),f=t.n(c),m=t(57),g=t.n(m),v=t(49),h=t(58),p=t(56),b=t(532),E=Object(h.a)(r||(r=g()(["\n  query Licenses($federationId: Int) {\n    licenses(federationId: $federationId) {\n      id\n      name\n\n      federation {\n        id\n        name\n      }\n\n    }\n  }\n"])));function x(e){var n=Object(v.useQuery)(E,{variables:{federationId:e.federationId}}).data;return i.createElement(i.Fragment,null,i.createElement(p.b.Subheader,null,"License"),i.createElement(b.a,{autoSelectFirst:!0,icon:"ticket-account",items:(null==n?void 0:n.licenses)||[],selected:[e.value].filter(Boolean),isSelected:function(n){var t;return n.id===(null==(t=e.value)?void 0:t.id)},renderItemLabel:function(e){return null==e?void 0:e.name},isDisabled:function(){return!1},onChangeSelected:function(n){var t=f()(n,1)[0];return t?e.onSelect(t):null}}))}var S,y=t(176),F=Object(h.a)(S||(S=g()(["\n  query Federations {\n    federations {\n      id\n      name\n    }\n  }\n"])));function O(e){var n,t,r=i.useState(!1),l=f()(r,2),a=l[0],o=l[1],s=Object(v.useQuery)(F).data;return i.useEffect((function(){var n;1!==(null==s||null==(n=s.federations)?void 0:n.length)||e.value||e.onSelect(s.federations[0])}),[JSON.stringify(null==s?void 0:s.federations)]),i.createElement(i.Fragment,null,i.createElement(p.b.Subheader,null,"Federation"),i.createElement(y.a,{onDismiss:function(){return o(!1)},visible:a,anchor:i.createElement(p.b.Item,{onPress:function(){o(!0)},title:(null==(n=e.value)?void 0:n.name)||"Please select federation",description:e.required?null:"Optional"})},null==s||null==(t=s.federations)?void 0:t.map((function(n){return i.createElement(y.a.Item,{onPress:function(){o(!1),e.onSelect(n)},title:n.name||"-",key:"federation-select-"+n.id})}))))}function w(){var e,n,t,r,l,c,f,m,g,v,h,p,b,E,S,y,F,w,I,j,k,$,N,P,C=Object(d.c)((function(e){return e.forms.user})),J=Object(d.b)();return i.useEffect((function(){var e;C.original&&(C.fields.exitWeight.value||J(d.a.forms.user.setField(["exitWeight",C.original.exitWeight||"60"])),!C.fields.rigs.value&&null!=(e=C.original)&&e.id&&J(d.a.forms.user.setField(["rigs",C.original.rigs])))}),[null==(e=C.original)?void 0:e.id]),i.createElement(i.Fragment,null,i.createElement(o.a,{style:W.field,mode:"outlined",label:"Name",error:!!C.fields.name.error,value:(null==(n=C.fields.name)||null==(t=n.value)?void 0:t.toString())||"",onChangeText:function(e){return J(d.a.forms.user.setField(["name",e]))}}),i.createElement(s.a,{type:C.fields.name.error?"error":"info"},C.fields.name.error||" "),i.createElement(o.a,{style:W.field,mode:"outlined",label:"Email",error:!!C.fields.email.error,value:(null==(r=C.fields.email)||null==(l=r.value)?void 0:l.toString())||"",onChangeText:function(e){return J(d.a.forms.user.setField(["email",e]))}}),i.createElement(s.a,{type:C.fields.email.error?"error":"info"},C.fields.email.error||" "),i.createElement(o.a,{style:W.field,mode:"outlined",label:"Phone",error:!!C.fields.phone.error,value:(null==(c=C.fields.phone)||null==(f=c.value)?void 0:f.toString())||"",onChangeText:function(e){return J(d.a.forms.user.setField(["phone",e]))}}),i.createElement(s.a,{type:C.fields.phone.error?"error":"info"},C.fields.phone.error||""),i.createElement(o.a,{style:W.field,mode:"outlined",label:"Exit weight",error:!!C.fields.exitWeight.error,value:(null==(m=C.fields.exitWeight)||null==(g=m.value)?void 0:g.toString())||"",keyboardType:"numbers-and-punctuation",right:function(){return i.createElement(o.a.Affix,{text:"kg"})},onChangeText:function(e){return J(d.a.forms.user.setField(["exitWeight",e]))}}),i.createElement(s.a,{type:C.fields.exitWeight.error?"error":"info"},C.fields.exitWeight.error||""),i.createElement(u.a,null),i.createElement(a.a,{style:{width:"100%"}},i.createElement(O,{value:(null==C||null==(v=C.fields)||null==(h=v.license)||null==(p=h.value)?void 0:p.federation)||C.federation.value,onSelect:function(e){return J(d.a.forms.user.setFederation(e))},required:!0}),i.createElement(s.a,{type:C.federation.error?"error":"info"},C.federation.error||""),((null==C||null==(b=C.fields)||null==(E=b.license)||null==(S=E.value)||null==(y=S.federation)?void 0:y.id)||(null==C||null==(F=C.federation)||null==(w=F.value)?void 0:w.id))&&i.createElement(i.Fragment,null,i.createElement(x,{value:C.fields.license.value,federationId:Number((null==C||null==(I=C.fields)||null==(j=I.license)||null==(k=j.value)||null==($=k.federation)?void 0:$.id)||(null==(N=C.federation)||null==(P=N.value)?void 0:P.id)),onSelect:function(e){return J(d.a.forms.user.setField(["license",e]))},required:!0}),i.createElement(s.a,{type:C.fields.license.error?"error":"info"},C.fields.license.error||""))))}var W=l.a.create({fields:{flex:1,width:"100%",paddingTop:32},field:{marginBottom:8,width:"100%"},ticketAddons:{marginBottom:8}})},699:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return x}));var r,i=t(11),l=t.n(i),a=t(57),o=t.n(a),s=t(6),u=t.n(s),d=t(0),c=t(1),f=t(125),m=t(49),g=t(19),v=t(82),h=t(576),p=t(50),b=t(181),E=Object(m.gql)(r||(r=o()(["\n  mutation UpdateUser(\n    $id: Int,\n    $name: String,\n    $phone: String,\n    $email: String,\n    $licenseId: Int,\n    $exitWeight: Float,\n  ){\n    updateUser(input: {\n      id: $id\n      attributes: {\n        name: $name,\n        phone: $phone,\n        email: $email,\n        licenseId: $licenseId,\n        exitWeight: $exitWeight,\n      }\n    }) {\n      user {\n        id\n        name\n        exitWeight\n        email\n        phone\n        rigs {\n          id\n          model\n          make\n          serial\n          canopySize\n        }\n        jumpTypes {\n          id\n          name\n        }\n        license {\n          id\n          name\n\n          federation {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n"])));function x(){var e=Object(g.c)((function(e){return e.forms.user})),n=(Object(g.c)((function(e){return e.global})),Object(g.b)()),t=Object(p.useNavigation)(),r=Object(p.useRoute)().params.user;d.useEffect((function(){n(g.a.forms.user.setOpen(r))}),[null==r?void 0:r.id]);var i=Object(m.useMutation)(E),a=l()(i,2),o=a[0],s=a[1],c=d.useCallback((function(){var t,r,i,l,a,o,s,u,d,c=!1,f=new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);return((null==(t=e.fields.name)||null==(r=t.value)?void 0:r.length)||0)<3&&(c=!0,n(g.a.forms.user.setFieldError(["name","Name is too short"]))),((null==(i=e.fields.email)||null==(l=i.value)?void 0:l.length)||0)<3&&(c=!0,n(g.a.forms.user.setFieldError(["email","Email is too short"]))),((null==(a=e.fields.phone)||null==(o=a.value)?void 0:o.length)||0)<3&&(c=!0,n(g.a.forms.user.setFieldError(["phone","Phone number is too short"]))),f.test((null==(s=e.fields)||null==(u=s.email)?void 0:u.value)||"")||(c=!0,n(g.a.forms.user.setFieldError(["email","Please enter a valid email"]))),((null==(d=e.fields.exitWeight)?void 0:d.value)||0)<30&&(c=!0,n(g.a.forms.user.setFieldError(["exitWeight","Exit weight seems too low?"]))),!c}),[JSON.stringify(e.fields),n]),x=d.useCallback((function(){var r,i,l,a,s,d,f,m,v,h,p,b,E;return u.a.async((function(x){for(;;)switch(x.prev=x.next){case 0:if(r=e.fields,i=r.name,l=r.license,a=r.phone,s=r.email,d=r.exitWeight,!c()){x.next=12;break}return x.prev=2,x.next=5,u.a.awrap(o({variables:{id:Number(e.original.id),name:i.value,licenseId:null!=(f=l.value)&&f.id?Number(l.value.id):null,phone:a.value,exitWeight:parseFloat(d.value),email:s.value}}));case 5:h=x.sent,null!=(m=h.data)&&null!=(v=m.updateUser)&&v.user&&(p=h.data.updateUser,b=p.fieldErrors,E=p.errors,b?null==b||b.map((function(e){var t=e.field,r=e.message;switch(t){case"name":return n(g.a.forms.user.setFieldError(["name",r]));case"exit_weight":return n(g.a.forms.user.setFieldError(["exitWeight",r]));case"license_id":return n(g.a.forms.user.setFieldError(["license",r]));case"phone":return n(g.a.forms.user.setFieldError(["phone",r]));case"email":return n(g.a.forms.user.setFieldError(["email",r]))}})):null!=E&&E.length?E.map((function(e){return n(g.a.notifications.showSnackbar({message:e,variant:"error"}))})):(n(g.a.notifications.showSnackbar({message:"Profile has been updated",variant:"success"})),t.goBack(),n(g.a.forms.user.reset()))),x.next=12;break;case 9:x.prev=9,x.t0=x.catch(2),n(g.a.notifications.showSnackbar({message:x.t0.message,variant:"error"}));case 12:case"end":return x.stop()}}),null,null,[[2,9]],Promise)}),[JSON.stringify(e.fields),n,o]);return d.createElement(b.a,{contentContainerStyle:{paddingHorizontal:48}},d.createElement(h.a,null),d.createElement(v.b,{style:S.fields},d.createElement(f.a,{mode:"contained",disabled:s.loading,onPress:x,loading:s.loading},"Save")))}var S=c.a.create({container:{flex:1,alignItems:"center",paddingTop:56},title:{fontSize:20,fontWeight:"bold"},separator:{marginVertical:30,height:1,width:"80%"},fields:{width:"100%",marginBottom:16},field:{marginBottom:8}})}}]);
//# sourceMappingURL=24.113ce1bf.chunk.js.map