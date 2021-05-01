(this.webpackJsonp=this.webpackJsonp||[]).push([[22],{372:function(e,t,n){"use strict";var r=n(7),a=n.n(r),i=n(0),o=n(1),l=n(2),c=n(33),s=n(41);function u(){return(u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var f=function(e){var t=e.children,n=e.style,r=e.numeric,o=a()(e,["children","style","numeric"]);return i.createElement(s.a,u({},o,{style:[d.container,r&&d.right,n]}),i.createElement(c.a,{numberOfLines:1},t))};f.displayName="DataTable.Cell";var d=o.a.create({container:{flex:1,flexDirection:"row",alignItems:"center"},right:{justifyContent:"flex-end"}}),m=f,h=n(14),g=n.n(h),p=n(18),b=n(13);function v(){return(v=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var y=function(e){var t=e.children,n=e.style,r=e.theme,o=a()(e,["children","style","theme"]),c=g()(r.dark?p.h:p.a).alpha(.12).rgb().string();return i.createElement(l.a,v({},o,{style:[O.header,{borderBottomColor:c},n]}),t)};y.displayName="DataTable.Header";var O=o.a.create({header:{flexDirection:"row",height:48,paddingHorizontal:16,borderBottomWidth:2*o.a.hairlineWidth}}),E=Object(b.c)(y),C=n(4),T=n(53),j=n(20),w=n(56);function P(){return(P=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var x=function(e){var t=e.numeric,n=e.children,r=e.onPress,o=e.sortDirection,s=e.theme,u=e.style,f=e.numberOfLines,d=void 0===f?1:f,m=a()(e,["numeric","children","onPress","sortDirection","theme","style","numberOfLines"]),h=i.useRef(new C.a.Value("ascending"===o?0:1)).current;i.useEffect((function(){C.a.timing(h,{toValue:"ascending"===o?0:1,duration:150,useNativeDriver:!0}).start()}),[o,h]);var p=g()(s.colors.text).alpha(.6).rgb().string(),b=h.interpolate({inputRange:[0,1],outputRange:["0deg","180deg"]}),v=o?i.createElement(C.a.View,{style:[k.icon,{transform:[{rotate:b}]}]},i.createElement(w.b,{name:"arrow-up",size:16,color:s.colors.text,direction:j.a.isRTL?"rtl":"ltr"})):null;return i.createElement(T.a,P({disabled:!r,onPress:r},m),i.createElement(l.a,{style:[k.container,t&&k.right,u]},v,i.createElement(c.a,{style:[k.cell,o?k.sorted:{color:p}],numberOfLines:d},n)))};x.displayName="DataTable.Title";var k=o.a.create({container:{flex:1,flexDirection:"row",alignContent:"center",paddingVertical:12},right:{justifyContent:"flex-end"},cell:{height:24,lineHeight:24,fontSize:12,fontWeight:"500",alignItems:"center"},sorted:{marginLeft:8},icon:{height:24,justifyContent:"center"}}),S=Object(b.c)(x),z=n(121);function D(){return(D=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var I=function(e){var t=e.label,n=e.page,r=e.numberOfPages,o=e.onPageChange,s=e.style,u=e.theme,f=a()(e,["label","page","numberOfPages","onPageChange","style","theme"]),d=g()(u.colors.text).alpha(.6).rgb().string();return i.createElement(l.a,D({},f,{style:[N.container,s]}),i.createElement(c.a,{style:[N.label,{color:d}],numberOfLines:1},t),i.createElement(z.a,{icon:function(e){var t=e.size,n=e.color;return i.createElement(w.b,{name:"chevron-left",color:n,size:t,direction:j.a.isRTL?"rtl":"ltr"})},color:u.colors.text,disabled:0===n,onPress:function(){return o(n-1)}}),i.createElement(z.a,{icon:function(e){var t=e.size,n=e.color;return i.createElement(w.b,{name:"chevron-right",color:n,size:t,direction:j.a.isRTL?"rtl":"ltr"})},color:u.colors.text,disabled:0===r||n===r-1,onPress:function(){return o(n+1)}}))};I.displayName="DataTable.Pagination";var N=o.a.create({container:{justifyContent:"flex-end",flexDirection:"row",alignItems:"center",paddingLeft:16},label:{fontSize:12,marginRight:44}}),R=Object(b.c)(I);function L(){return(L=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var M=o.a.create({container:{borderStyle:"solid",borderBottomWidth:o.a.hairlineWidth,minHeight:48,paddingHorizontal:16},content:{flex:1,flexDirection:"row"}}),V=Object(b.c)((function(e){var t=e.onPress,n=e.style,r=e.theme,o=e.children,c=e.pointerEvents,u=a()(e,["onPress","style","theme","children","pointerEvents"]),f=g()(r.dark?p.h:p.a).alpha(.12).rgb().string();return i.createElement(s.a,L({},u,{onPress:t,style:[M.container,{borderBottomColor:f},n]}),i.createElement(l.a,{style:M.content,pointerEvents:c},o))}));function H(){return(H=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var $=function(e){var t=e.children,n=e.style,r=a()(e,["children","style"]);return i.createElement(l.a,H({},r,{style:[B.container,n]}),t)};$.Header=E,$.Title=S,$.Row=V,$.Cell=m,$.Pagination=R;var B=o.a.create({container:{width:"100%"}});t.a=$},375:function(e,t,n){"use strict";var r=n(7),a=n.n(r),i=n(0),o=n(18),l=n(172),c=n(8),s=n(258),u=n(14),f=n.n(u),d=n(13);function m(){return(m=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var h=l.a.PlatformConstants?l.a.PlatformConstants.reactNativeVersion:void 0;t.a=Object(d.c)((function(e){var t=e.value,n=e.disabled,r=e.onValueChange,l=e.color,u=e.theme,d=a()(e,["value","disabled","onValueChange","color","theme"]),g=l||u.colors.accent,p="ios"===c.a.OS?g:n?u.dark?f()(o.h).alpha(.1).rgb().string():f()(o.a).alpha(.12).rgb().string():f()(g).alpha(.5).rgb().string(),b="ios"===c.a.OS?void 0:n?u.dark?o.e:o.c:t?g:u.dark?o.c:o.d,v=h&&0===h.major&&h.minor<=56?{onTintColor:p,thumbTintColor:b}:"web"===c.a.OS?{activeTrackColor:p,thumbColor:b,activeThumbColor:g}:{thumbColor:b,trackColor:{true:p,false:""}};return i.createElement(s.a,m({value:t,disabled:n,onValueChange:n?void 0:r},v,d))}))},523:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return T}));var r,a,i=n(9),o=n.n(i),l=n(71),c=n.n(l),s=n(49),u=n(40),f=n(72),d=n(0),m=n(1),h=n(171),g=n(312),p=n(372),b=n(375),v=n(318),y=n(21),O=n(169),E=Object(f.a)(r||(r=c()(["\n  query QueryTicketType(\n    $dropzoneId: Int!\n  ) {\n    ticketTypes(dropzoneId: $dropzoneId) {\n      id\n      cost\n      currency\n      name\n      altitude\n      allowManifestingSelf\n\n      extras {\n        id\n        name\n      }\n    }\n  }\n"]))),C=Object(f.a)(a||(a=c()(["\n  mutation UpdateTicketTypePublic(\n    $id: Int!,\n    $allowManifestingSelf: Boolean\n  ){\n    updateTicketType(input: {\n      id: $id\n      attributes: {\n        allowManifestingSelf: $allowManifestingSelf\n      }\n    }) {\n      ticketType {\n        id\n        name\n        altitude\n        cost\n        allowManifestingSelf\n        isTandem\n        extras {\n          id\n          name\n          cost\n        }\n      }\n    }\n  }\n"])));function T(){var e,t,n=Object(y.l)((function(e){return e.global})),r=Object(s.useQuery)(E,{variables:{dropzoneId:Number(null==(e=n.currentDropzone)?void 0:e.id)}}),a=r.data,i=r.loading,l=r.refetch,c=Object(u.useNavigation)(),f=Object(u.useRoute)(),m=Object(u.useIsFocused)();d.useEffect((function(){m&&l()}),[m]);var T=Object(s.useMutation)(C),w=o()(T,2),P=w[0];w[1];return d.useEffect((function(){"TicketTypesScreen"===f.name&&l()}),[f.name]),d.createElement(O.a,{style:j.container,contentContainerStyle:[j.content,{backgroundColor:"white"}],refreshControl:d.createElement(h.a,{refreshing:i,onRefresh:l})},d.createElement(g.a,{visible:i,color:n.theme.colors.accent}),d.createElement(p.a,null,d.createElement(p.a.Header,null,d.createElement(p.a.Title,null,"Name"),d.createElement(p.a.Title,{numeric:!0},"Cost"),d.createElement(p.a.Title,{numeric:!0},"Altitude"),d.createElement(p.a.Title,{numeric:!0},"Public")),null==a||null==(t=a.ticketTypes)?void 0:t.map((function(e){return d.createElement(p.a.Row,{onPress:function(){return c.navigate("UpdateTicketTypeScreen",{ticketType:e})},pointerEvents:"none"},d.createElement(p.a.Cell,null,e.name),d.createElement(p.a.Cell,{numeric:!0},"$",e.cost),d.createElement(p.a.Cell,{numeric:!0},e.altitude),d.createElement(p.a.Cell,{numeric:!0},d.createElement(b.a,{onValueChange:function(){P({variables:{id:Number(e.id),allowManifestingSelf:!e.allowManifestingSelf}})},value:!!e.allowManifestingSelf})))}))),d.createElement(v.a,{style:j.fab,small:!0,icon:"plus",onPress:function(){return c.navigate("CreateTicketTypeScreen")},label:"New ticket type"}))}var j=m.a.create({container:{flex:1,display:"flex"},content:{flexGrow:1},fab:{position:"absolute",margin:16,right:0,bottom:0},empty:{flex:1,alignItems:"center",justifyContent:"center",width:"100%",height:"100%"}})}}]);
//# sourceMappingURL=22.614387fc.chunk.js.map