(this.webpackJsonp=this.webpackJsonp||[]).push([[13],{635:function(e,n,t){"use strict";t.d(n,"a",(function(){return i}));var r=t(38),l=t(0),a=t(5);function i(e,n){var t=n.getPayload;return function(n){var i=n.variables,o=n.onError,u=Object(a.b)(),s=Object(r.useQuery)(e,{variables:i}),d=s.data,c=s.loading,m=s.previousData,p=s.refetch,f=s.error,v=l.useMemo((function(){return t(d)}),[JSON.stringify(d)]);return l.useEffect((function(){JSON.stringify(m),JSON.stringify(d);null!=f&&f.message&&(!1!==n.showSnackbarErrors&&u(a.a.notifications.showSnackbar({message:f.message,variant:"error"})),o&&f.message)}),[n.onError,null==f?void 0:f.message]),{loading:c,data:v,refetch:p}}}},647:function(e,n,t){"use strict";t.d(n,"a",(function(){return v}));var r,l=t(9),a=t.n(l),i=t(29),o=t.n(i),u=t(38),s=t(37),d=t(0),c=t(109),m=t(21),p=t(5),f=Object(s.a)(r||(r=o()(["\n  query QueryAvailableRigs(\n    $dropzoneId: Int!\n    $userId: Int!\n  ) {\n    dropzone(id: $dropzoneId) {\n      id\n      dropzoneUser(userId: $userId) {\n        id\n        availableRigs {\n          id\n          make\n          model\n          canopySize\n          serial\n\n          user {\n            id\n          }\n        }\n      }\n    }\n  }\n"])));function v(e){var n,t,r,l,i,o,s,v,b=d.useState(!1),y=a()(b,2),g=y[0],I=y[1],E=Object(p.c)((function(e){return e.global})).currentDropzoneId,h=Object(u.useLazyQuery)(f),z=a()(h,2),j=z[0],T=z[1].data;return d.useEffect((function(){e.userId&&e.dropzoneId&&j({variables:{dropzoneId:E,userId:Number(e.userId)}})}),[e.userId,e.dropzoneId]),d.useEffect((function(){var n,t,r;!e.value&&e.autoSelectFirst&&null!=T&&null!=(n=T.dropzone)&&null!=(t=n.dropzoneUser)&&null!=(r=t.availableRigs)&&r.length&&e.onSelect(T.dropzone.dropzoneUser.availableRigs[0])}),[e.autoSelectFirst,JSON.stringify(null==T||null==(n=T.dropzone)||null==(t=n.dropzoneUser)?void 0:t.availableRigs)]),d.createElement(c.a,{onDismiss:function(){return I(!1)},visible:g,anchor:d.createElement(m.b.Item,{onPress:function(){I(!0)},title:e.value?(null==(r=e.value)?void 0:r.make)+" "+(null==(l=e.value)?void 0:l.model)+" ("+((null==(i=e.value)?void 0:i.canopySize)||"?")+"sqft)":"Select rig",description:e.required?null:"Optional",left:function(){return d.createElement(m.b.Icon,{icon:"parachute"})}})},null==T||null==(o=T.dropzone)||null==(s=o.dropzoneUser)||null==(v=s.availableRigs)?void 0:v.map((function(n){return d.createElement(c.a.Item,{key:"rig-select-"+n.id,onPress:function(){I(!1),e.onSelect(n)},style:{width:"100%"},title:(null==n?void 0:n.make)+" "+(null==n?void 0:n.model)+" ("+(null==n?void 0:n.canopySize)+" sqft) "+(n.user?"":"[DROPZONE RIG]")})})))}},666:function(e,n,t){"use strict";t.d(n,"a",(function(){return J}));var r=t(4),l=t.n(r),a=t(9),i=t.n(a),o=t(23),u=t.n(o),s=t(29),d=t.n(s),c=t(0),m=t(80),p=t(1),f=t(21),v=t(106),b=t(285),y=t(122),g=t(374),I=t(37),E=t(123),h=t(5),z=t(330),j=t(635),T=t(398),O=t(287);var k,S,x=t(647),w=Object(I.a)(k||(k=d()(["\nquery QueryDropzoneUsersManifestDetails(\n  $dropzoneId: Int!\n  $dropzoneUserId: Int!\n) {\n  dropzone(id: $dropzoneId) {\n    id\n    name\n\n    dropzoneUser(id: $dropzoneUserId) {\n      id\n\n      user {\n        id\n        name\n        exitWeight\n        license {\n          id\n          name\n        }\n        rigs {\n          id\n          make\n          model\n          canopySize\n        }\n      }\n      role {\n        id\n        name\n      }\n      user {\n        id\n        name\n        image\n      }\n    }\n  }\n}\n"]))),$=Object(j.a)(w,{getPayload:function(e){var n;return null==e||null==(n=e.dropzone)?void 0:n.dropzoneUser}});function N(e){var n,t,r,l,a,i,o,u,s=e.dropzoneId,d=e.dropzoneUserId,p=e.onChangeRig,b=e.exitWeight,I=e.rigId,z=e.onChangeExitWeight,j=Object(h.c)((function(e){return e})).global,k=$({variables:{dropzoneUserId:d,dropzoneId:s},onError:console.error}),S=k.data,w=k.loading,N=null==S||null==(n=S.user)||null==(t=n.rigs)?void 0:t.find((function(e){var n=e.id;return Number(n)===I}));return c.useEffect((function(){var e;!b&&null!=S&&null!=(e=S.user)&&e.exitWeight&&z(Number(S.user.exitWeight))}),[null==S||null==(r=S.user)?void 0:r.exitWeight]),c.createElement(v.a,{style:{width:"100%"},elevation:3},c.createElement(T.a,{indeterminate:!0,color:j.theme.colors.accent,visible:w}),c.createElement(v.a.Title,{title:null==S?void 0:S.user.name,left:function(){var e;return null!=S&&null!=(e=S.user)&&e.image?c.createElement(f.a.Image,{source:{uri:S.user.image},size:24}):c.createElement(f.a.Icon,{icon:"account",size:24})}}),c.createElement(v.a.Content,null,c.createElement(g.a,{style:{marginBottom:8}}),c.createElement(m.a,{horizontal:!0},c.createElement(y.a,{style:{marginHorizontal:1},icon:"lock",mode:"outlined",disabled:!0},null==S||null==(l=S.role)?void 0:l.name),c.createElement(y.a,{style:{marginHorizontal:1},icon:"ticket-account",mode:"outlined",disabled:!0},null==S||null==(a=S.user)||null==(i=a.license)?void 0:i.name),N&&b&&N.canopySize?c.createElement(y.a,{style:{marginHorizontal:1},icon:"escalator-down",mode:"outlined",disabled:!0},(o=b,u=N.canopySize,Object(E.round)(2.20462*o/u,2).toFixed(2))):null),c.createElement(x.a,{userId:d,dropzoneId:s,onSelect:p,value:N,autoSelectFirst:!0}),c.createElement(O.a,{value:b?""+b:"",onChangeText:function(e){return z(Number(e))},keyboardType:"number-pad",label:"Exit weight",mode:"outlined"})))}function F(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function G(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?F(Object(t),!0).forEach((function(n){l()(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):F(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var P=Object(I.a)(S||(S=d()(["\nquery DropzoneUsersAllowedJumpTypes(\n  $dropzoneId: Int!,\n  $userIds: [Int!]!\n) {\n  dropzone(id: $dropzoneId) {\n    id\n\n    allowedJumpTypes(userId: $userIds) {\n      id\n      name\n    }\n\n    ticketTypes(isPublic: true) {\n      id\n      name\n      cost\n\n      extras {\n        id\n        cost\n        name\n      }\n    }\n  }\n  jumpTypes {\n    id\n    name\n  }\n}\n\n"]))),D=Object(j.a)(P,{getPayload:function(e){var n,t;return{allowedJumpTypes:(null==e||null==(n=e.dropzone)?void 0:n.allowedJumpTypes)||[],ticketTypes:(null==e||null==(t=e.dropzone)?void 0:t.ticketTypes)||[],jumpTypes:(null==e?void 0:e.jumpTypes)||[]}}});function J(){var e,n,t,r,l,a,o,s,d,p,I,j,T,O=Object(h.c)((function(e){return e.forms.manifestGroup})),k=Object(h.c)((function(e){return e.global})),S=Object(h.b)(),x=D({variables:{userIds:null==(e=O.fields.users)||null==(n=e.value)?void 0:n.map((function(e){return e.id})),dropzoneId:k.currentDropzoneId},onError:console.error}),w=x.data;x.loading;return c.createElement(c.Fragment,null,c.createElement(f.b.Subheader,null,"Jump type"),c.createElement(v.a,{elevation:2,style:{marginBottom:16,flexShrink:1}},c.createElement(v.a.Content,null,c.createElement(z.a,{autoSelectFirst:!0,items:Object(E.uniqBy)([].concat(u()((null==w?void 0:w.allowedJumpTypes)||[]),u()((null==w?void 0:w.jumpTypes)||[])),(function(e){return e.id}))||[],selected:O.fields.jumpType.value?[O.fields.jumpType.value]:[],renderItemLabel:function(e){return e.name},isDisabled:function(e){var n;return!(null!=w&&null!=(n=w.allowedJumpTypes)&&n.map((function(e){return e.id})).includes(e.id))},onChangeSelected:function(e){var n=i()(e,1)[0];return S(h.a.forms.manifestGroup.setField(["jumpType",n]))}}),c.createElement(b.a,{type:O.fields.jumpType.error?"error":"info"},O.fields.jumpType.error||""))),c.createElement(f.b.Subheader,null,"Ticket"),c.createElement(v.a,{elevation:2,style:{width:"100%"}},c.createElement(v.a.Content,null,c.createElement(z.a,{autoSelectFirst:!0,items:(null==w?void 0:w.ticketTypes)||[],selected:O.fields.ticketType.value?[O.fields.ticketType.value]:[],renderItemLabel:function(e){return e.name},isDisabled:function(){return!1},onChangeSelected:function(e){var n=i()(e,1)[0];return S(h.a.forms.manifestGroup.setField(["ticketType",n]))}}),c.createElement(b.a,{type:O.fields.ticketType.error?"error":"info"},O.fields.ticketType.error||""),null!=O&&null!=(t=O.fields)&&null!=(r=t.ticketType)&&null!=(l=r.value)&&null!=(a=l.extras)&&a.length?c.createElement(f.b.Subheader,null,"Ticket addons"):null,c.createElement(m.a,{horizontal:!0,style:U.ticketAddons},null==O||null==(o=O.fields)||null==(s=o.ticketType)||null==(d=s.value)||null==(p=d.extras)?void 0:p.map((function(e){var n,t,r,l;return c.createElement(y.a,{selected:null==O||null==(n=O.fields)||null==(t=n.extras.value)?void 0:t.some((function(n){return n.id===e.id})),onPress:null!=O&&null!=(r=O.fields)&&null!=(l=r.extras.value)&&l.some((function(n){return n.id===e.id}))?function(){var n,t;return S(h.a.forms.manifestGroup.setField(["extras",null==O||null==(n=O.fields)||null==(t=n.extras.value)?void 0:t.filter((function(n){return n.id!==e.id}))]))}:function(){var n,t;return S(h.a.forms.manifestGroup.setField(["extras",[].concat(u()((null==O||null==(n=O.fields)||null==(t=n.extras)?void 0:t.value)||[]),[e])]))}},e.name+" ($"+e.cost+")")}))),c.createElement(b.a,{type:O.fields.extras.error?"error":"info"},O.fields.extras.error||""))),c.createElement(g.a,null),c.createElement(f.b.Subheader,null,"Group"),null==(I=O.fields)||null==(j=I.users)||null==(T=j.value)?void 0:T.map((function(e){return c.createElement(N,{dropzoneId:k.currentDropzoneId,dropzoneUserId:Number(e.id),rigId:Number(e.rigId)||void 0,exitWeight:e.exitWeight,onChangeExitWeight:function(n){var t;return S(h.a.forms.manifestGroup.setField(["users",null==(t=O.fields.users.value)?void 0:t.map((function(t){return t.id===e.id?G(G({},e),{},{exitWeight:n}):t}))]))},onChangeRig:function(n){var t;return S(h.a.forms.manifestGroup.setField(["users",null==(t=O.fields.users.value)?void 0:t.map((function(t){return t.id===e.id?G(G({},e),{},{rigId:Number(n.id)}):t}))]))}})})))}var U=p.a.create({fields:{flex:1},field:{marginBottom:8},ticketAddons:{marginBottom:8}})},787:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return E}));var r,l=t(9),a=t.n(l),i=t(29),o=t.n(i),u=t(6),s=t.n(u),d=t(38),c=t(0),m=t(398),p=t(106),f=t(207),v=t(164),b=t(5),y=t(666),g=t(52),I=Object(d.gql)(r||(r=o()(["\n  mutation CreateSlot(\n    $jumpTypeId: Int\n    $extraIds: [Int!]\n    $loadId: Int\n    $ticketTypeId: Int\n    $userGroup: [SlotUser!]!,\n  ) {\n    createSlots(\n      input: {\n        attributes: {\n          jumpTypeId: $jumpTypeId\n          extraIds: $extraIds\n          loadId: $loadId\n          ticketTypeId: $ticketTypeId\n          userGroup: $userGroup,\n        }\n      }\n    ) {\n      errors\n      fieldErrors {\n        field\n        message\n      }\n      \n      load {\n        id\n        name\n        loadNumber\n        createdAt\n        dispatchAt\n        hasLanded\n        maxSlots\n        isFull\n        isOpen\n        plane {\n          id\n          name\n        }\n        gca {\n          id\n          user {\n            id\n            name\n          }\n        }\n        pilot {\n          id\n          user {\n            id\n            name\n          }\n        }\n        loadMaster {\n          id\n          user {\n            id\n            name\n          }\n        }\n        slots {\n          id\n          createdAt\n          user {\n            id\n            name\n          }\n          passengerName\n          passengerExitWeight\n          ticketType {\n            id\n            name\n            isTandem\n            altitude\n          }\n          jumpType {\n            id\n            name\n          }\n          extras {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n"])));function E(e){var n,t,r,l,i,o=Object(b.b)(),u=Object(b.c)((function(e){return e.forms.manifestGroup})),E=Object(b.c)((function(e){return e.global})),h=Object(d.useMutation)(I),z=a()(h,2),j=z[0],T=z[1],O=Object(g.useNavigation)(),k=c.useCallback((function(){var e,n,t=!1;return null!=(e=u.fields.jumpType.value)&&e.id||(t=!0,o(b.a.forms.manifestGroup.setFieldError(["jumpType","You must specify the type of jump"]))),null!=(n=u.fields.ticketType.value)&&n.id||(t=!0,o(b.a.forms.manifestGroup.setFieldError(["ticketType","You must select a ticket type to manifest"]))),!t}),[JSON.stringify(u.fields)]),S=c.useCallback((function(){var e,n,t,r,l,a,i,d,c,m,p,f,v,y,g,I,E;return s.a.async((function(h){for(;;)switch(h.prev=h.next){case 0:if(k()){h.next=2;break}return h.abrupt("return");case 2:return h.prev=2,h.next=5,s.a.awrap(j({variables:{jumpTypeId:Number(null==(e=u.fields.jumpType.value)?void 0:e.id),ticketTypeId:Number(null==(n=u.fields.ticketType.value)?void 0:n.id),extraIds:null==(t=u.fields.extras)||null==(r=t.value)?void 0:r.map((function(e){var n=e.id;return Number(n)})),loadId:Number(null==(l=u.fields.load.value)?void 0:l.id),userGroup:u.fields.users.value}}));case 5:if(g=h.sent,null==(a=g.data)||null==(i=a.createSlot)||null==(d=i.fieldErrors)||d.map((function(e){var n=e.field,t=e.message;switch(n){case"jump_type":return o(b.a.forms.manifestGroup.setFieldError(["jumpType",t]));case"load":return o(b.a.forms.manifestGroup.setFieldError(["load",t]));case"credits":case"extras":case"extra_ids":return o(b.a.forms.manifestGroup.setFieldError(["extras",t]));case"ticket_type":return o(b.a.forms.manifestGroup.setFieldError(["ticketType",t]))}})),null==g||null==(c=g.data)||null==(m=c.createSlots)||null==(p=m.errors)||!p.length){h.next=9;break}return h.abrupt("return",o(b.a.notifications.showSnackbar({message:null==g||null==(I=g.data)||null==(E=I.createSlots)?void 0:E.errors[0],variant:"error"})));case 9:null!=(f=g.data)&&null!=(v=f.createSlots)&&null!=(y=v.fieldErrors)&&y.length||O.navigate("Manifest",{screen:"DropzoneScreen"}),h.next=15;break;case 12:h.prev=12,h.t0=h.catch(2),o(b.a.notifications.showSnackbar({message:h.t0.message,variant:"error"}));case 15:case"end":return h.stop()}}),null,null,[[2,12]],Promise)}),[JSON.stringify(u.fields),j,e.onSuccess]);return c.createElement(v.a,null,c.createElement(m.a,{indeterminate:!0,visible:T.loading,color:E.theme.colors.accent}),c.createElement(p.a.Title,{title:"Manifest "+(null==u||null==(n=u.fields)||null==(t=n.users)||null==(r=t.value)?void 0:r.length)+" jumpers on Load #"+(null==(l=u.fields.load)||null==(i=l.value)?void 0:i.loadNumber)}),c.createElement(y.a,null),c.createElement(f.a,{mode:"contained",style:{width:"100%",marginVertical:16},onPress:function(){return S()},loading:T.loading},"Save"))}}}]);
//# sourceMappingURL=13.f75192f7.chunk.js.map