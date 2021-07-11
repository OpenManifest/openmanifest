(this.webpackJsonp=this.webpackJsonp||[]).push([[16],{630:function(e,t,n){"use strict";n.d(t,"a",(function(){return i}));var r=n(165),a=n(332),i=r.a.actions;a.a},640:function(e,t,n){"use strict";n.d(t,"a",(function(){return k}));var r,a=n(28),i=n.n(a),o=n(36),l=n(37),s=n(0),c=n(1),d=n(2),u=n(287),m=n(285),f=n(22),b=n(288),p=n(138),v=n(5),g=n(161),y=Object(l.a)(r||(r=i()(["\n  query QueryTicketType(\n    $dropzoneId: Int!\n  ) {\n    ticketTypes(dropzoneId: $dropzoneId) {\n      id\n      cost\n      currency\n      name\n      allowManifestingSelf\n\n      extras {\n        id\n        name\n      }\n    }\n  }\n"])));function k(){var e,t,n,r=Object(v.c)((function(e){return e.forms.extra})),a=Object(v.b)(),i=Object(g.b)(),l=Object(o.useQuery)(y,{variables:{dropzoneId:Number(null==i||null==(e=i.dropzone)?void 0:e.id)}}).data;return s.createElement(s.Fragment,null,s.createElement(u.a,{style:x.field,mode:"outlined",label:"Name",error:!!r.fields.name.error,value:r.fields.name.value,onChangeText:function(e){return a(v.a.forms.extra.setField(["name",e]))}}),s.createElement(m.a,{type:r.fields.name.error?"error":"info"},r.fields.name.error||""),s.createElement(u.a,{style:x.field,mode:"outlined",label:"Price",error:!!r.fields.cost.error,value:null==(t=r.fields.cost)||null==(n=t.value)?void 0:n.toString(),onChangeText:function(e){return a(v.a.forms.extra.setField(["cost",Number(e)]))}}),s.createElement(m.a,{type:r.fields.cost.error?"error":"info"},r.fields.cost.error||""),s.createElement(d.a,{style:{width:"100%"}},s.createElement(f.b.Subheader,null,"Compatible tickets"),null==l?void 0:l.ticketTypes.map((function(e){return s.createElement(b.a.Item,{label:e.name,status:r.fields.ticketTypeIds.value.includes(Number(e.id))?"checked":"unchecked",onPress:function(){return a(v.a.forms.extra.setField(["ticketTypeIds",Object(p.xor)(r.fields.ticketTypeIds.value,[Number(e.id)])]))}})}))))}var x=c.a.create({fields:{width:"100%",flex:1},field:{marginBottom:8,width:"100%"}})},792:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return E}));var r,a=n(11),i=n.n(a),o=n(28),l=n.n(o),s=n(6),c=n.n(s),d=n(0),u=n(1),m=n(207),f=n(36),b=n(5),p=n(137),v=n(630),g=n(640),y=n(51),k=n(162),x=n(441),h=n(161),I=Object(f.gql)(r||(r=l()(["\n  mutation UpdateExtra(\n    $id: Int!,\n    $name: String,\n    $ticketTypeIds: [Int!]\n    $cost: Float\n    $dropzoneId: Int\n  ){\n    updateExtra(input: {\n      id: $id\n      attributes: {\n        name: $name,\n        ticketTypeIds: $ticketTypeIds\n        cost: $cost\n        dropzoneId: $dropzoneId\n      }\n    }) {\n      extra {\n        id\n        name\n\n        ticketTypes {\n          id\n          name\n          cost\n          altitude\n          allowManifestingSelf\n        }\n      }\n    }\n  }\n"])));function E(){var e=Object(h.b)(),t=Object(b.c)((function(e){return e.forms.extra})),n=Object(b.b)(),r=Object(y.useNavigation)(),a=Object(y.useRoute)().params.extra;d.useEffect((function(){n(b.a.forms.extra.setOpen(a))}),[null==a?void 0:a.id]);var o=Object(f.useMutation)(I),l=i()(o,2),s=l[0],u=l[1],E=d.useCallback((function(){var e=!1;return t.fields.name.value.length<3&&(e=!0,n(b.a.forms.extra.setFieldError(["name","Name is too short"]))),Number(t.fields.cost.value)<0&&(e=!0,n(b.a.forms.extra.setFieldError(["cost","Price must be a number"]))),!e}),[JSON.stringify(t.fields),n]),T=d.useCallback((function(){var a,i,o,l,d,u,m,f;return c.a.async((function(b){for(;;)switch(b.prev=b.next){case 0:if(a=t.fields,i=a.name,o=a.cost,l=a.ticketTypeIds,!E()){b.next=12;break}return b.prev=2,b.next=5,c.a.awrap(s({variables:{id:Number(t.original.id),dropzoneId:Number(null==e||null==(d=e.dropzone)?void 0:d.id),name:i.value,cost:o.value,ticketTypeIds:l.value}}));case 5:f=b.sent,null!=(u=f.data)&&null!=(m=u.updateExtra)&&m.extra&&(n(v.a.showSnackbar({message:"Saved",variant:"success"})),r.goBack()),b.next=12;break;case 9:b.prev=9,b.t0=b.catch(2),n(v.a.showSnackbar({message:b.t0.message,variant:"error"}));case 12:case"end":return b.stop()}}),null,null,[[2,9]],Promise)}),[JSON.stringify(t.fields),n,s]);return d.createElement(k.a,{contentContainerStyle:{paddingHorizontal:48}},d.createElement(x.a,{name:"ticket-percent",size:100,color:"#999999",style:{alignSelf:"center"}}),d.createElement(g.a,null),d.createElement(p.b,{style:O.fields},d.createElement(m.a,{mode:"contained",disabled:u.loading,onPress:T,loading:u.loading},"Save")))}var O=u.a.create({container:{flex:1},title:{fontSize:20,fontWeight:"bold"},separator:{marginVertical:30,height:1,width:"80%"},fields:{width:"100%",marginBottom:16},field:{marginBottom:8}})}}]);
//# sourceMappingURL=16.0d487a46.chunk.js.map