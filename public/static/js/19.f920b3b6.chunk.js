(this.webpackJsonp=this.webpackJsonp||[]).push([[19],{543:function(e,t,n){"use strict";n.d(t,"a",(function(){return i}));var a=n(130),r=n(280),i=a.a.actions;r.a},558:function(e,t,n){"use strict";n.d(t,"a",(function(){return k}));var a,r=n(57),i=n.n(r),o=n(51),l=n(58),s=n(0),c=n(1),d=n(2),u=n(268),m=n(240),f=n(50),p=n(242),b=n(540),v=n(19),g=n(278),y=Object(l.a)(a||(a=i()(["\n  query QueryTicketType(\n    $dropzoneId: Int!\n  ) {\n    ticketTypes(dropzoneId: $dropzoneId) {\n      id\n      cost\n      currency\n      name\n      allowManifestingSelf\n\n      extras {\n        id\n        name\n      }\n    }\n  }\n"])));function k(){var e,t,n,a=Object(v.c)((function(e){return e.forms.extra})),r=Object(v.b)(),i=Object(g.a)(),l=Object(o.useQuery)(y,{variables:{dropzoneId:Number(null==i||null==(e=i.dropzone)?void 0:e.id)}}).data;return s.createElement(s.Fragment,null,s.createElement(u.a,{style:x.field,mode:"outlined",label:"Name",error:!!a.fields.name.error,value:a.fields.name.value,onChangeText:function(e){return r(v.a.forms.extra.setField(["name",e]))}}),s.createElement(m.a,{type:a.fields.name.error?"error":"info"},a.fields.name.error||""),s.createElement(u.a,{style:x.field,mode:"outlined",label:"Price",error:!!a.fields.cost.error,value:null==(t=a.fields.cost)||null==(n=t.value)?void 0:n.toString(),onChangeText:function(e){return r(v.a.forms.extra.setField(["cost",Number(e)]))}}),s.createElement(m.a,{type:a.fields.cost.error?"error":"info"},a.fields.cost.error||""),s.createElement(d.a,{style:{width:"100%"}},s.createElement(f.b.Subheader,null,"Compatible tickets"),null==l?void 0:l.ticketTypes.map((function(e){return s.createElement(p.a.Item,{label:e.name,status:a.fields.ticketTypeIds.value.includes(Number(e.id))?"checked":"unchecked",onPress:function(){return r(v.a.forms.extra.setField(["ticketTypeIds",Object(b.xor)(a.fields.ticketTypeIds.value,[Number(e.id)])]))}})}))))}var x=c.a.create({fields:{width:"100%",flex:1},field:{marginBottom:8,width:"100%"}})},713:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return E}));var a,r=n(11),i=n.n(r),o=n(57),l=n.n(o),s=n(6),c=n.n(s),d=n(0),u=n(1),m=n(125),f=n(51),p=n(19),b=n(99),v=n(543),g=n(558),y=n(40),k=n(183),x=n(372),h=n(278),I=Object(f.gql)(a||(a=l()(["\n  mutation UpdateExtra(\n    $id: Int!,\n    $name: String,\n    $ticketTypeIds: [Int!]\n    $cost: Float\n    $dropzoneId: Int\n  ){\n    updateExtra(input: {\n      id: $id\n      attributes: {\n        name: $name,\n        ticketTypeIds: $ticketTypeIds\n        cost: $cost\n        dropzoneId: $dropzoneId\n      }\n    }) {\n      extra {\n        id\n        name\n\n        ticketTypes {\n          id\n          name\n          cost\n          altitude\n          allowManifestingSelf\n        }\n      }\n    }\n  }\n"])));function E(){var e=Object(h.a)(),t=Object(p.c)((function(e){return e.forms.extra})),n=Object(p.b)(),a=Object(y.useNavigation)(),r=Object(y.useRoute)().params.extra;d.useEffect((function(){n(p.a.forms.extra.setOpen(r))}),[null==r?void 0:r.id]);var o=Object(f.useMutation)(I),l=i()(o,2),s=l[0],u=l[1],E=d.useCallback((function(){var e=!1;return t.fields.name.value.length<3&&(e=!0,n(p.a.forms.extra.setFieldError(["name","Name is too short"]))),Number(t.fields.cost.value)<0&&(e=!0,n(p.a.forms.extra.setFieldError(["cost","Price must be a number"]))),!e}),[JSON.stringify(t.fields),n]),T=d.useCallback((function(){var r,i,o,l,d,u,m,f;return c.a.async((function(p){for(;;)switch(p.prev=p.next){case 0:if(r=t.fields,i=r.name,o=r.cost,l=r.ticketTypeIds,!E()){p.next=12;break}return p.prev=2,p.next=5,c.a.awrap(s({variables:{id:Number(t.original.id),dropzoneId:Number(null==e||null==(d=e.dropzone)?void 0:d.id),name:i.value,cost:o.value,ticketTypeIds:l.value}}));case 5:f=p.sent,null!=(u=f.data)&&null!=(m=u.updateExtra)&&m.extra&&(n(v.a.showSnackbar({message:"Saved",variant:"success"})),a.goBack()),p.next=12;break;case 9:p.prev=9,p.t0=p.catch(2),n(v.a.showSnackbar({message:p.t0.message,variant:"error"}));case 12:case"end":return p.stop()}}),null,null,[[2,9]],Promise)}),[JSON.stringify(t.fields),n,s]);return d.createElement(k.a,{contentContainerStyle:{paddingHorizontal:48}},d.createElement(x.a,{name:"ticket-percent",size:100,color:"#999999",style:{alignSelf:"center"}}),d.createElement(g.a,null),d.createElement(b.b,{style:O.fields},d.createElement(m.a,{mode:"contained",disabled:u.loading,onPress:T,loading:u.loading},"Save")))}var O=u.a.create({container:{flex:1},title:{fontSize:20,fontWeight:"bold"},separator:{marginVertical:30,height:1,width:"80%"},fields:{width:"100%",marginBottom:16},field:{marginBottom:8}})}}]);
//# sourceMappingURL=19.f920b3b6.chunk.js.map