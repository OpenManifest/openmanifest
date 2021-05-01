(this.webpackJsonp=this.webpackJsonp||[]).push([[27],{404:function(e,n,t){"use strict";t.d(n,"a",(function(){return m})),t.d(n,"b",(function(){return b}));var r=t(27),a=t.n(r),l=t(13),o=t.n(l),i=t(0),c=t(59),s=t(5),u=t(197),d=t(200);function f(e,n){var t=Object(d.a)(),r=e[t];return r||u.a[t][n]}function m(e){var n=e.style,t=e.lightColor,r=e.darkColor,l=o()(e,["style","lightColor","darkColor"]),s=f({light:t,dark:r},"text");return i.createElement(c.a,a()({style:[{color:s},n]},l))}function b(e){var n=e.style,t=e.lightColor,r=e.darkColor,l=o()(e,["style","lightColor","darkColor"]),c=f({light:t,dark:r},"background");return i.createElement(s.a,a()({style:[{backgroundColor:c},n]},l))}},408:function(e,n,t){"use strict";t.d(n,"a",(function(){return s}));var r=t(0),a=t.n(r),l=t(89),o=t(4),i=t(409),c=t(60);function s(e){var n=Object(i.a)().height,t=Object(c.h)((function(e){return e.global})).theme;return a.a.createElement(l.a,{style:[u.container,{backgroundColor:t.colors.surface,height:n-112},e.style],contentContainerStyle:[u.content,e.contentContainerStyle]},e.children)}var u=o.a.create({container:{flex:1},content:{paddingHorizontal:16,alignItems:"flex-start",flexGrow:1,paddingBottom:50}})},458:function(e,n,t){"use strict";t.d(n,"a",(function(){return I}));var r,a=t(6),l=t.n(a),o=t(405),i=t.n(o),c=t(10),s=t.n(c),u=t(0),d=t.n(u),f=t(4),m=t(413),b=t(429),p=t(203),g=t(411),y=t(194),h=t(428),v=t(412),E=t(419),C=t(416),S=t(482),w=t(120),k=t(481),O=t(60),j=t(471),x=t.n(j),P=t(404),z=t(163).a.actions,F=Object(w.gql)(r||(r=i()(["\n  query QueryFederations {\n    federations {\n      id\n      name\n    }\n  }\n"])));function I(){var e,n,t,r,a=Object(O.h)((function(e){return e})),o=a.dropzoneForm,i=a.global,c=Object(O.g)(),f=Object(w.useQuery)(F),j=f.data,I=(f.loading,Object(u.useState)(!1)),N=l()(I,2),$=N[0],M=N[1],A=Object(u.useState)(null),q=l()(A,2),B=q[0],H=q[1];Object(u.useEffect)((function(){var e,n;null==j||null==(e=j.federations)||!e.length||null!=(n=o.fields.federation)&&n.value||c(z.setField(["federation",j.federations[0]]))}),[JSON.stringify(null==j?void 0:j.federations)]);var J=Object(u.useCallback)((function(){var e;return s.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:return n.prev=0,n.next=3,s.a.awrap(Object(S.a)({multiple:!1,type:"image"}));case 3:e=n.sent,c(z.setField(["banner",e.uri])),n.next=10;break;case 7:n.prev=7,n.t0=n.catch(0),console.log(n.t0);case 10:case"end":return n.stop()}}),null,null,[[0,7]],Promise)}),[c]);return d.a.createElement(d.a.Fragment,null,d.a.createElement(m.a,null,d.a.createElement(b.a,{visible:!!B,onDismiss:function(){return H(null)}},d.a.createElement(b.a.Title,null,"Pick a ","primary"===B?"primary color":"secondary color"),d.a.createElement(b.a.Content,{style:{padding:20,height:400}},d.a.createElement(k.a,{onColorSelected:function(e){c("primary"===B?z.setField(["primaryColor",e]):z.setField(["secondaryColor",e]))},style:{flex:1},sliderComponent:x.a,defaultColor:("primary"===B?o.fields.primaryColor.value:o.fields.secondaryColor.value)||void 0,hideSliders:!0})),d.a.createElement(b.a.Actions,null,d.a.createElement(p.a,{onPress:function(){return H(null)}},"Cancel"),d.a.createElement(p.a,{disabled:"primary"===B&&!o.fields.primaryColor.value||"secondary"===B&&!o.fields.secondaryColor.value,onPress:function(){console.log({current:i.theme.colors.accent,next:o.fields.secondaryColor.value}),c("primary"===B?O.b.setPrimaryColor(o.fields.primaryColor.value):O.b.setAccentColor(o.fields.secondaryColor.value)),H(null)}},"Save")))),d.a.createElement(g.a,{style:{width:"100%",maxHeight:300,marginVertical:16}},d.a.createElement(g.a.Cover,{source:{uri:o.fields.banner.value||"https://picsum.photos/700"},resizeMode:"cover"}),d.a.createElement(g.a.Actions,{style:{justifyContent:"flex-end"}},d.a.createElement(p.a,{onPress:J},"Upload"))),d.a.createElement(g.a,{style:{width:"100%",marginVertical:16,paddingHorizontal:16}},d.a.createElement(y.a.Subheader,{style:D.subheader},"Dropzone"),d.a.createElement(h.a,{style:D.field,mode:"outlined",label:"Name",error:!!o.fields.name.error,value:o.fields.name.value||"",onChangeText:function(e){return c(z.setField(["name",e]))}}),d.a.createElement(v.a,{type:"error"},o.fields.name.error||""),d.a.createElement(y.a.Subheader,{style:D.subheader},"Federation"),d.a.createElement(E.a,{onDismiss:function(){return M(!1)},visible:$,anchor:d.a.createElement(E.a.Item,{onPress:function(){return M(!0)},title:(null==(e=o.fields)||null==(n=e.federation)||null==(t=n.value)?void 0:t.name)||"",icon:"parachute"})},null==j||null==(r=j.federations)?void 0:r.map((function(e){return d.a.createElement(E.a.Item,{title:e.name,onPress:function(){c(z.setField(["federation",e])),M(!1)}})}))),d.a.createElement(v.a,{type:"error"},o.fields.federation.error||""),d.a.createElement(y.a.Subheader,{style:D.subheader},"Branding"),d.a.createElement(y.a.Item,{title:"Primary color",onPress:function(){return H("primary")},left:function(){return d.a.createElement(P.b,{style:{width:24,height:24,backgroundColor:i.theme.colors.primary}})}}),d.a.createElement(y.a.Item,{title:"Secondary color",onPress:function(){return H("secondary")},left:function(){return d.a.createElement(P.b,{style:{width:24,height:24,backgroundColor:i.theme.colors.accent}})}}),d.a.createElement(y.a.Item,{title:"Use credit system",description:"Users will be charged credits when a load is marked as landed and can't manifest with insufficient funds.",onPress:function(){return c(z.setField(["isCreditSystemEnabled",!o.fields.isCreditSystemEnabled.value]))},left:function(){return d.a.createElement(C.a,{onPress:function(){return c(z.setField(["isCreditSystemEnabled",!o.fields.isCreditSystemEnabled.value]))},status:o.fields.isCreditSystemEnabled.value?"checked":"unchecked"})}}),d.a.createElement(y.a.Item,{title:"Public",description:"Your dropzone will not be available in the app if this is disabled",onPress:function(){return c(z.setField(["isPublic",!o.fields.isPublic.value]))},left:function(){return d.a.createElement(C.a,{onPress:function(){return c(z.setField(["isPublic",!o.fields.isPublic.value]))},status:o.fields.isPublic.value?"checked":"unchecked"})}})))}var D=f.a.create({fields:{flexGrow:1,display:"flex",width:"100%"},field:{marginBottom:8,width:"100%"},subheader:{paddingLeft:0}})},461:function(e,n,t){"use strict";t.d(n,"c",(function(){return s})),t.d(n,"b",(function(){return u})),t.d(n,"d",(function(){return d})),t.d(n,"a",(function(){return f}));var r=t(6),a=t.n(r),l=t(10),o=t.n(l),i=t(120),c=t(0);function s(e){return{message:e,pattern:/.{1,}/}}function u(e){return{message:e,pattern:new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)}}function d(e,n){return{message:e,callback:n}}function f(e,n){var t=n.getPayload,r=n.fieldErrorMap,l=n.validates;return function(s){var u=s.onFieldError,d=s.onSuccess,f=s.onError,m=Object(i.useMutation)(e),b=a()(m,2),p=b[0],g=b[1],y=g.data,h=g.loading;g.error;return{loading:h,mutate:Object(c.useCallback)((function(e){var a,i,c,m,b,g;return o.a.async((function(y){for(;;)switch(y.prev=y.next){case 0:if(function(){var t=!1;return l&&Object.keys(e).forEach((function(r){var a,o=r;o in(n.validates||{})&&(null==(a=l[o])||a.forEach((function(n){n.pattern?n.pattern.test(""+e[o])||(t=!0,u&&u(o,n.message)):n.callback&&!n.callback(e)&&(t=!0,u&&u(o,n.message))})))})),!t}()){y.next=3;break}return y.abrupt("return");case 3:return y.prev=3,y.next=6,o.a.awrap(p({variables:e}));case 6:if(m=y.sent,null==(b=t(m.data))||null==(a=b.fieldErrors)||a.map((function(e){var t=e.field,a=e.message,l=t in(r||{})?n.fieldErrorMap[t]:t;s.onFieldError&&s.onFieldError(""+l,a)})),null==b||null==(i=b.errors)||!i.length||!f){y.next=12;break}return null==(g=b.errors)||g.map((function(e){return f(e)})),y.abrupt("return");case 12:return null!=b&&null!=(c=b.fieldErrors)&&c.length||d(b),y.abrupt("return",b);case 16:y.prev=16,y.t0=y.catch(3),f&&f(y.t0.message);case 19:return y.abrupt("return");case 20:case"end":return y.stop()}}),null,null,[[3,16]],Promise)}),[u,f,d,,p,t,JSON.stringify(y)])}}}},540:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return H}));var r,a=t(401),l=t(0),o=t(405),i=t.n(o),c=t(10),s=t.n(c),u=t(120),d=t(88),f=t(4),m=t(210),b=t(53),p=t(407),g=t(421),y=t(411),h=t(417),v=t(404),E=t(60),C=t(73),S=Object(d.a)(r||(r=i()(["\n  query QueryDropzones {\n    dropzones {\n      edges {\n        node {\n          id\n          name\n          banner\n          ticketTypes {\n            id\n            name\n            cost\n            allowManifestingSelf\n            currency\n          }\n          planes {\n            id\n            name,\n            registration,\n            minSlots,\n            maxSlots,\n          }\n        }\n      }\n    }\n  }\n"])));function w(){var e,n=Object(E.g)(),t=Object(u.useQuery)(S),r=t.data,a=t.loading,o=t.refetch,i=Object(C.useNavigation)();return l.createElement(v.b,{style:O.container},l.createElement(m.a,{data:(null==r||null==(e=r.dropzones)?void 0:e.edges)||[],numColumns:2,refreshing:a,onRefresh:function(){return o()},style:{flex:1},contentContainerStyle:{flexGrow:1},ListEmptyComponent:function(){return l.createElement(v.b,{style:O.empty},l.createElement(p.a,null,"No dropzones?"),l.createElement(g.a,null,"You can set one up!"))},renderItem:function(e){var t,r,a=e.item;return l.createElement(y.a,{style:{width:b.a.get("window").width/2-32,margin:8},onPress:function(){return s.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:null!=a&&a.node&&n(E.b.setDropzone(a.node));case 1:case"end":return e.stop()}}),null,null,null,Promise)}},l.createElement(y.a.Cover,{source:{uri:null==a||null==(t=a.node)?void 0:t.banner}}),l.createElement(y.a.Content,null,l.createElement(p.a,null,null==a||null==(r=a.node)?void 0:r.name)))}}),l.createElement(h.a,{style:O.fab,small:!0,icon:"plus",onPress:function(){return i.navigate("CreateDropzoneScreen")},label:"Create dropzone"}))}var k,O=f.a.create({container:{flex:1,padding:8,display:"flex"},fab:{position:"absolute",margin:16,right:0,bottom:0},empty:{flex:1,alignItems:"center",justifyContent:"center",width:"100%",height:"100%"}}),j=t(203),x=t(161),P=t(163),z=t(458),F=t(461),I=Object(d.a)(k||(k=i()(["\nmutation CreateDropzone(\n  $name: String!,\n  $banner: String!,\n  $federationId: Int!\n){\n  createDropzone(input: { attributes: { name: $name, banner: $banner, federationId: $federationId }}) {\n    dropzone {\n      id\n      name\n      banner\n\n      federation {\n        id\n        name\n      }\n    }\n  }\n}\n"]))),D=Object(F.a)(I,{getPayload:function(e){return e.createDropzone},fieldErrorMap:{federation:"federationId"},validates:{name:[Object(F.c)("Name is required")]}}),N=t(408),$=P.a.actions,M=x.a.actions;function A(){var e=Object(E.h)((function(e){return e.dropzoneForm})),n=Object(E.g)(),t=(Object(C.useNavigation)(),D({onError:function(e){return n(E.f.showSnackbar({message:e,variant:"error"}))},onFieldError:function(e,t){return n($.setFieldError([e,t]))},onSuccess:function(e){return n(M.setDropzone(e.dropzone))}}));return l.createElement(N.a,{contentContainerStyle:{paddingHorizontal:32}},l.createElement(z.a,null),l.createElement(v.b,{style:q.fields},l.createElement(j.a,{mode:"contained",disabled:t.loading,loading:t.loading,onPress:function(){return t.mutate({name:e.fields.name.value,banner:e.fields.banner.value,federationId:Number(e.fields.federation.value.id)})}},"Save")))}var q=f.a.create({container:{flex:1,alignItems:"center"},title:{fontSize:20,fontWeight:"bold"},separator:{marginVertical:30,height:1,width:"80%"},fields:{width:"100%"},field:{marginBottom:8}}),B=Object(a.a)();function H(){return l.createElement(B.Navigator,{screenOptions:{headerShown:!1,cardStyle:{flex:1}},initialRouteName:"Dropzones"},l.createElement(B.Screen,{name:"DropzonesScreen",component:w}),l.createElement(B.Screen,{name:"CreateDropzoneScreen",component:A}))}}}]);
//# sourceMappingURL=27.827584cf.chunk.js.map