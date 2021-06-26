(this.webpackJsonp=this.webpackJsonp||[]).push([[14],{532:function(e,n,t){"use strict";var r=t(533),l=t(0),a=t(2),i=t(317);n.a=function(e){var n=e.items,t=e.selected,o=e.isSelected,u=e.isDisabled,s=e.icon,d=e.renderItemLabel,c=e.onChangeSelected,m=e.autoSelectFirst;return l.useEffect((function(){(!t||!t.length&&n.length&&m)&&c([n[0]])}),[JSON.stringify(t),JSON.stringify(n),m]),l.createElement(a.a,{style:{flexDirection:"row",flexWrap:"wrap"}},n.map((function(e){return l.createElement(i.a,{key:JSON.stringify(e),mode:"outlined",icon:!t.some((function(n){return Object(r.isEqual)(e,n)}))&&s?s:void 0,style:{margin:1},disabled:u(e),selected:o?o(e):t.some((function(n){return Object(r.isEqual)(e,n)})),onPress:function(){return c(1===t.length?[e]:Object(r.xorBy)(t,[e],JSON.stringify))}},d(e))})))}},537:function(e,n,t){"use strict";t.d(n,"a",(function(){return i}));var r=t(49),l=t(0),a=t(19);function i(e,n){var t=n.getPayload;return function(n){var i=n.variables,o=n.onError,u=Object(a.b)(),s=Object(r.useQuery)(e,{variables:i}),d=s.data,c=s.loading,m=s.previousData,p=s.refetch,f=s.error,v=l.useMemo((function(){return t(d)}),[JSON.stringify(d)]);return l.useEffect((function(){JSON.stringify(m),JSON.stringify(d);null!=f&&f.message&&(!1!==n.showSnackbarErrors&&u(a.a.notifications.showSnackbar({message:f.message,variant:"error"})),o&&f.message)}),[n.onError,null==f?void 0:f.message]),{loading:c,data:v,refetch:p}}}},554:function(e,n,t){"use strict";t.d(n,"a",(function(){return v}));var r,l=t(11),a=t.n(l),i=t(57),o=t.n(i),u=t(49),s=t(58),d=t(0),c=t(176),m=t(56),p=t(276),f=Object(s.a)(r||(r=o()(["\n  query QueryAvailableRigs(\n    $dropzoneId: Int!\n    $userId: Int!\n  ) {\n    dropzone(id: $dropzoneId) {\n      id\n      dropzoneUser(userId: $userId) {\n        id\n        availableRigs {\n          id\n          make\n          model\n          canopySize\n          serial\n\n          user {\n            id\n          }\n        }\n      }\n    }\n  }\n"])));function v(e){var n,t,r,l,i,o,s,v,b=d.useState(!1),y=a()(b,2),g=y[0],I=y[1],E=Object(p.a)(),h=Object(u.useLazyQuery)(f),j=a()(h,2),z=j[0],O=j[1].data;return d.useEffect((function(){var n;e.userId&&e.dropzoneId&&z({variables:{dropzoneId:Number(null==E||null==(n=E.dropzone)?void 0:n.id),userId:Number(e.userId)}})}),[e.userId,e.dropzoneId]),d.useEffect((function(){var n,t,r;!e.value&&e.autoSelectFirst&&null!=O&&null!=(n=O.dropzone)&&null!=(t=n.dropzoneUser)&&null!=(r=t.availableRigs)&&r.length&&e.onSelect(O.dropzone.dropzoneUser.availableRigs[0])}),[e.autoSelectFirst,JSON.stringify(null==O||null==(n=O.dropzone)||null==(t=n.dropzoneUser)?void 0:t.availableRigs)]),d.createElement(c.a,{onDismiss:function(){return I(!1)},visible:g,anchor:d.createElement(m.b.Item,{onPress:function(){I(!0)},title:e.value?(null==(r=e.value)?void 0:r.make)+" "+(null==(l=e.value)?void 0:l.model)+" ("+((null==(i=e.value)?void 0:i.canopySize)||"?")+"sqft)":"Select rig",description:e.required?null:"Optional",left:function(){return d.createElement(m.b.Icon,{icon:"parachute"})}})},null==O||null==(o=O.dropzone)||null==(s=o.dropzoneUser)||null==(v=s.availableRigs)?void 0:v.map((function(n){return d.createElement(c.a.Item,{key:"rig-select-"+n.id,onPress:function(){I(!1),e.onSelect(n)},style:{width:"100%"},title:(null==n?void 0:n.make)+" "+(null==n?void 0:n.model)+" ("+(null==n?void 0:n.canopySize)+" sqft) "+(n.user?"":"[DROPZONE RIG]")})})))}},575:function(e,n,t){"use strict";t.d(n,"a",(function(){return U}));var r=t(3),l=t.n(r),a=t(11),i=t.n(a),o=t(22),u=t.n(o),s=t(57),d=t.n(s),c=t(0),m=t(77),p=t(1),f=t(56),v=t(104),b=t(238),y=t(317),g=t(318),I=t(58),E=t(533),h=t(19),j=t(532),z=t(537),O=t(326),S=t(266);var T,k=t(554),x=Object(I.a)(T||(T=d()(["\nquery QueryDropzoneUsersManifestDetails(\n  $dropzoneId: Int!\n  $dropzoneUserId: Int!\n) {\n  dropzone(id: $dropzoneId) {\n    id\n    name\n\n    dropzoneUser(userId: $dropzoneUserId) {\n      id\n\n      user {\n        id\n        name\n        exitWeight\n        license {\n          id\n          name\n        }\n        rigs {\n          id\n          make\n          model\n          canopySize\n        }\n      }\n      role {\n        id\n        name\n      }\n      user {\n        id\n        name\n        image\n      }\n    }\n  }\n}\n"]))),w=Object(z.a)(x,{getPayload:function(e){var n;return null==e||null==(n=e.dropzone)?void 0:n.dropzoneUser}});function N(e){var n,t,r,l,a,i,o,u,s=e.dropzoneId,d=e.dropzoneUserId,p=e.onChangeRig,b=e.exitWeight,I=e.rigId,j=e.onChangeExitWeight,z=Object(h.c)((function(e){return e})).global,T=w({variables:{dropzoneUserId:d,dropzoneId:s},onError:console.error}),x=T.data,N=T.loading,$=null==x||null==(n=x.user)||null==(t=n.rigs)?void 0:t.find((function(e){var n=e.id;return Number(n)===I}));return c.useEffect((function(){var e;!b&&null!=x&&null!=(e=x.user)&&e.exitWeight&&j(Number(x.user.exitWeight))}),[null==x||null==(r=x.user)?void 0:r.exitWeight]),c.createElement(v.a,{style:{width:"100%"},elevation:3},c.createElement(O.a,{indeterminate:!0,color:z.theme.colors.accent,visible:N}),c.createElement(v.a.Title,{title:null==x?void 0:x.user.name,left:function(){var e;return null!=x&&null!=(e=x.user)&&e.image?c.createElement(f.a.Image,{source:{uri:x.user.image},size:24}):c.createElement(f.a.Icon,{icon:"account",size:24})}}),c.createElement(v.a.Content,null,c.createElement(g.a,{style:{marginBottom:8}}),c.createElement(m.a,{horizontal:!0},c.createElement(y.a,{style:{marginHorizontal:1},icon:"lock",mode:"outlined",disabled:!0},null==x||null==(l=x.role)?void 0:l.name),c.createElement(y.a,{style:{marginHorizontal:1},icon:"ticket-account",mode:"outlined",disabled:!0},null==x||null==(a=x.user)||null==(i=a.license)?void 0:i.name),$&&b&&$.canopySize?c.createElement(y.a,{style:{marginHorizontal:1},icon:"escalator-down",mode:"outlined",disabled:!0},(o=b,u=$.canopySize,Object(E.round)(2.20462*o/u,2).toFixed(2))):null),c.createElement(k.a,{userId:d,dropzoneId:s,onSelect:p,value:$,autoSelectFirst:!0}),c.createElement(S.a,{value:b?""+b:"",onChangeText:function(e){return j(Number(e))},keyboardType:"number-pad",label:"Exit weight",mode:"outlined"})))}var $,F=t(276);function G(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function J(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?G(Object(t),!0).forEach((function(n){l()(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):G(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var P=Object(I.a)($||($=d()(["\nquery DropzoneUsersAllowedJumpTypes(\n  $dropzoneId: Int!,\n  $userIds: [Int!]!\n) {\n  dropzone(id: $dropzoneId) {\n    id\n\n    allowedJumpTypes(userId: $userIds) {\n      id\n      name\n    }\n\n    ticketTypes(isPublic: true) {\n      id\n      name\n      cost\n\n      extras {\n        id\n        cost\n        name\n      }\n    }\n  }\n  jumpTypes {\n    id\n    name\n  }\n}\n\n"]))),D=Object(z.a)(P,{getPayload:function(e){var n,t;return{allowedJumpTypes:(null==e||null==(n=e.dropzone)?void 0:n.allowedJumpTypes)||[],ticketTypes:(null==e||null==(t=e.dropzone)?void 0:t.ticketTypes)||[],jumpTypes:(null==e?void 0:e.jumpTypes)||[]}}});function U(){var e,n,t,r,l,a,o,s,d,p,I,z,O,S,T=Object(h.c)((function(e){return e.forms.manifestGroup})),k=(Object(h.c)((function(e){return e.global})),Object(F.a)()),x=Object(h.b)(),w=D({variables:{userIds:null==(e=T.fields.users)||null==(n=e.value)?void 0:n.map((function(e){return e.id})),dropzoneId:Number(null==k||null==(t=k.dropzone)?void 0:t.id)},onError:console.error}),$=w.data;w.loading;return c.createElement(c.Fragment,null,c.createElement(f.b.Subheader,null,"Jump type"),c.createElement(v.a,{elevation:2,style:{marginBottom:16,flexShrink:1}},c.createElement(v.a.Content,null,c.createElement(j.a,{autoSelectFirst:!0,items:Object(E.uniqBy)([].concat(u()((null==$?void 0:$.allowedJumpTypes)||[]),u()((null==$?void 0:$.jumpTypes)||[])),(function(e){return e.id}))||[],selected:T.fields.jumpType.value?[T.fields.jumpType.value]:[],renderItemLabel:function(e){return e.name},isDisabled:function(e){var n;return!(null!=$&&null!=(n=$.allowedJumpTypes)&&n.map((function(e){return e.id})).includes(e.id))},onChangeSelected:function(e){var n=i()(e,1)[0];return x(h.a.forms.manifestGroup.setField(["jumpType",n]))}}),c.createElement(b.a,{type:T.fields.jumpType.error?"error":"info"},T.fields.jumpType.error||""))),c.createElement(f.b.Subheader,null,"Ticket"),c.createElement(v.a,{elevation:2,style:{width:"100%"}},c.createElement(v.a.Content,null,c.createElement(j.a,{autoSelectFirst:!0,items:(null==$?void 0:$.ticketTypes)||[],selected:T.fields.ticketType.value?[T.fields.ticketType.value]:[],renderItemLabel:function(e){return e.name},isDisabled:function(){return!1},onChangeSelected:function(e){var n=i()(e,1)[0];return x(h.a.forms.manifestGroup.setField(["ticketType",n]))}}),c.createElement(b.a,{type:T.fields.ticketType.error?"error":"info"},T.fields.ticketType.error||""),null!=T&&null!=(r=T.fields)&&null!=(l=r.ticketType)&&null!=(a=l.value)&&null!=(o=a.extras)&&o.length?c.createElement(f.b.Subheader,null,"Ticket addons"):null,c.createElement(m.a,{horizontal:!0,style:C.ticketAddons},null==T||null==(s=T.fields)||null==(d=s.ticketType)||null==(p=d.value)||null==(I=p.extras)?void 0:I.map((function(e){var n,t,r,l;return c.createElement(y.a,{selected:null==T||null==(n=T.fields)||null==(t=n.extras.value)?void 0:t.some((function(n){return n.id===e.id})),onPress:null!=T&&null!=(r=T.fields)&&null!=(l=r.extras.value)&&l.some((function(n){return n.id===e.id}))?function(){var n,t;return x(h.a.forms.manifestGroup.setField(["extras",null==T||null==(n=T.fields)||null==(t=n.extras.value)?void 0:t.filter((function(n){return n.id!==e.id}))]))}:function(){var n,t;return x(h.a.forms.manifestGroup.setField(["extras",[].concat(u()((null==T||null==(n=T.fields)||null==(t=n.extras)?void 0:t.value)||[]),[e])]))}},e.name+" ($"+e.cost+")")}))),c.createElement(b.a,{type:T.fields.extras.error?"error":"info"},T.fields.extras.error||""))),c.createElement(g.a,null),c.createElement(f.b.Subheader,null,"Group"),null==(z=T.fields)||null==(O=z.users)||null==(S=O.value)?void 0:S.map((function(e){var n;return c.createElement(N,{dropzoneId:Number(null==k||null==(n=k.dropzone)?void 0:n.id),dropzoneUserId:Number(e.id),rigId:Number(e.rigId)||void 0,exitWeight:e.exitWeight,onChangeExitWeight:function(n){var t;return x(h.a.forms.manifestGroup.setField(["users",null==(t=T.fields.users.value)?void 0:t.map((function(t){return t.id===e.id?J(J({},e),{},{exitWeight:n}):t}))]))},onChangeRig:function(n){var t;return x(h.a.forms.manifestGroup.setField(["users",null==(t=T.fields.users.value)?void 0:t.map((function(t){return t.id===e.id?J(J({},e),{},{rigId:Number(n.id)}):t}))]))}})})))}var C=p.a.create({fields:{flex:1},field:{marginBottom:8},ticketAddons:{marginBottom:8}})},697:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return E}));var r,l=t(11),a=t.n(l),i=t(57),o=t.n(i),u=t(6),s=t.n(u),d=t(49),c=t(0),m=t(326),p=t(104),f=t(125),v=t(181),b=t(19),y=t(575),g=t(50),I=Object(d.gql)(r||(r=o()(["\n  mutation CreateSlot(\n    $jumpTypeId: Int\n    $extraIds: [Int!]\n    $loadId: Int\n    $ticketTypeId: Int\n    $userGroup: [SlotUser!]!,\n  ) {\n    createSlots(\n      input: {\n        attributes: {\n          jumpTypeId: $jumpTypeId\n          extraIds: $extraIds\n          loadId: $loadId\n          ticketTypeId: $ticketTypeId\n          userGroup: $userGroup,\n        }\n      }\n    ) {\n      errors\n      fieldErrors {\n        field\n        message\n      }\n      \n      load {\n        id\n        name\n        loadNumber\n        createdAt\n        dispatchAt\n        hasLanded\n        maxSlots\n        isFull\n        isOpen\n        plane {\n          id\n          name\n        }\n        gca {\n          id\n          user {\n            id\n            name\n          }\n        }\n        pilot {\n          id\n          user {\n            id\n            name\n          }\n        }\n        loadMaster {\n          id\n          user {\n            id\n            name\n          }\n        }\n        slots {\n          id\n          createdAt\n          user {\n            id\n            name\n          }\n          passengerName\n          passengerExitWeight\n          ticketType {\n            id\n            name\n            isTandem\n            altitude\n          }\n          jumpType {\n            id\n            name\n          }\n          extras {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n"])));function E(e){var n,t,r,l,i,o=Object(b.b)(),u=Object(b.c)((function(e){return e.forms.manifestGroup})),E=Object(b.c)((function(e){return e.global})),h=Object(d.useMutation)(I),j=a()(h,2),z=j[0],O=j[1],S=Object(g.useNavigation)(),T=c.useCallback((function(){var e,n,t=!1;return null!=(e=u.fields.jumpType.value)&&e.id||(t=!0,o(b.a.forms.manifestGroup.setFieldError(["jumpType","You must specify the type of jump"]))),null!=(n=u.fields.ticketType.value)&&n.id||(t=!0,o(b.a.forms.manifestGroup.setFieldError(["ticketType","You must select a ticket type to manifest"]))),!t}),[JSON.stringify(u.fields)]),k=c.useCallback((function(){var e,n,t,r,l,a,i,d,c,m,p,f,v,y,g,I,E;return s.a.async((function(h){for(;;)switch(h.prev=h.next){case 0:if(T()){h.next=2;break}return h.abrupt("return");case 2:return h.prev=2,h.next=5,s.a.awrap(z({variables:{jumpTypeId:Number(null==(e=u.fields.jumpType.value)?void 0:e.id),ticketTypeId:Number(null==(n=u.fields.ticketType.value)?void 0:n.id),extraIds:null==(t=u.fields.extras)||null==(r=t.value)?void 0:r.map((function(e){var n=e.id;return Number(n)})),loadId:Number(null==(l=u.fields.load.value)?void 0:l.id),userGroup:u.fields.users.value}}));case 5:if(g=h.sent,null==(a=g.data)||null==(i=a.createSlot)||null==(d=i.fieldErrors)||d.map((function(e){var n=e.field,t=e.message;switch(n){case"jump_type":return o(b.a.forms.manifestGroup.setFieldError(["jumpType",t]));case"load":return o(b.a.forms.manifestGroup.setFieldError(["load",t]));case"credits":case"extras":case"extra_ids":return o(b.a.forms.manifestGroup.setFieldError(["extras",t]));case"ticket_type":return o(b.a.forms.manifestGroup.setFieldError(["ticketType",t]))}})),null==g||null==(c=g.data)||null==(m=c.createSlots)||null==(p=m.errors)||!p.length){h.next=9;break}return h.abrupt("return",o(b.a.notifications.showSnackbar({message:null==g||null==(I=g.data)||null==(E=I.createSlots)?void 0:E.errors[0],variant:"error"})));case 9:null!=(f=g.data)&&null!=(v=f.createSlots)&&null!=(y=v.fieldErrors)&&y.length||S.navigate("Manifest",{screen:"DropzoneScreen"}),h.next=15;break;case 12:h.prev=12,h.t0=h.catch(2),o(b.a.notifications.showSnackbar({message:h.t0.message,variant:"error"}));case 15:case"end":return h.stop()}}),null,null,[[2,12]],Promise)}),[JSON.stringify(u.fields),z,e.onSuccess]);return c.createElement(v.a,null,c.createElement(m.a,{indeterminate:!0,visible:O.loading,color:E.theme.colors.accent}),c.createElement(p.a.Title,{title:"Manifest "+(null==u||null==(n=u.fields)||null==(t=n.users)||null==(r=t.value)?void 0:r.length)+" jumpers on Load #"+(null==(l=u.fields.load)||null==(i=l.value)?void 0:i.loadNumber)}),c.createElement(y.a,null),c.createElement(f.a,{mode:"contained",style:{width:"100%",marginVertical:16},onPress:function(){return k()},loading:O.loading},"Save"))}}}]);
//# sourceMappingURL=14.b96d31f8.chunk.js.map