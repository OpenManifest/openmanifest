(this.webpackJsonp=this.webpackJsonp||[]).push([[14],{576:function(e,n,t){"use strict";t.d(n,"a",(function(){return s}));var r=t(0),a=t(1),i=t(144),o=t(339),c=t(134);function s(e){var n=e.title,t=e.subtitle;return r.createElement(c.b,{style:u.empty},r.createElement(i.a,null,n),r.createElement(o.a,{style:{textAlign:"center"}},t))}var u=a.a.create({container:{flex:1,padding:8,display:"flex"},fab:{position:"absolute",margin:16,right:0,bottom:0},empty:{flex:1,alignItems:"center",justifyContent:"center",width:"100%",height:"100%"}})},597:function(e,n,t){"use strict";t.d(n,"a",(function(){return i}));var r=t(51),a=t(37);function i(e,n){Object(a.a)(2,arguments);var t=Object(r.a)(e),i=Object(r.a)(n);return t.getTime()-i.getTime()}},739:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return V}));var r,a=t(9),i=t.n(a),o=t(31),c=t.n(o),s=t(47),u=t(38),l=t(0),f=t(192),d=t(1),m=t(352),b=t(32),g=t(6),p=t(191),h=t(3),O=t.n(h);function v(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function j(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?v(Object(t),!0).forEach((function(n){O()(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):v(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var y=Object(b.a)(r||(r=c()(["\n  query QueryNotifications($dropzoneId: Int!) {\n    dropzone(id: $dropzoneId) {\n      id\n\n      currentUser {\n        id\n        \n        notifications {\n          edges {\n            node {\n              id\n              message\n              notificationType\n              createdAt\n\n              resource {\n                ...on Load {\n                  id\n                  loadNumber\n                  dispatchAt\n                }\n                ...on Transaction {\n                  id\n                  amount\n                  message\n                  status\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"])));var D=t(576),M=t(45),w=t.n(M),E=t(21),S=t(209),T=t(340),I=t(51),x=t(37);function N(e,n){Object(x.a)(2,arguments);var t=Object(I.a)(e),r=Object(I.a)(n),a=t.getTime()-r.getTime();return a<0?-1:a>0?1:a}function X(e,n){Object(x.a)(2,arguments);var t=Object(I.a)(e),r=Object(I.a)(n),a=t.getFullYear()-r.getFullYear(),i=t.getMonth()-r.getMonth();return 12*a+i}function A(e){Object(x.a)(1,arguments);var n=Object(I.a)(e);return n.setHours(23,59,59,999),n}function P(e){Object(x.a)(1,arguments);var n=Object(I.a)(e),t=n.getMonth();return n.setFullYear(n.getFullYear(),t+1,0),n.setHours(23,59,59,999),n}function F(e){Object(x.a)(1,arguments);var n=Object(I.a)(e);return A(n).getTime()===P(n).getTime()}function $(e,n){Object(x.a)(2,arguments);var t,r=Object(I.a)(e),a=Object(I.a)(n),i=N(r,a),o=Math.abs(X(r,a));if(o<1)t=0;else{1===r.getMonth()&&r.getDate()>27&&r.setDate(30),r.setMonth(r.getMonth()-i*o);var c=N(r,a)===-i;F(Object(I.a)(e))&&1===o&&1===N(e,a)&&(c=!1),t=i*(o-Number(c))}return 0===t?0:t}var k=t(597);function z(e,n){Object(x.a)(2,arguments);var t=Object(k.a)(e,n)/1e3;return t>0?Math.floor(t):Math.ceil(t)}var Y=t(356);function B(e){return function(e,n){if(null==e)throw new TypeError("assign requires that input parameter not be null or undefined");for(var t in n=n||{})n.hasOwnProperty(t)&&(e[t]=n[t]);return e}({},e)}var H,C=t(349);function R(e,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};Object(x.a)(2,arguments);var r=t.locale||Y.a;if(!r.formatDistance)throw new RangeError("locale must contain formatDistance property");var a=N(e,n);if(isNaN(a))throw new RangeError("Invalid time value");var i,o,c=B(t);c.addSuffix=Boolean(t.addSuffix),c.comparison=a,a>0?(i=Object(I.a)(n),o=Object(I.a)(e)):(i=Object(I.a)(e),o=Object(I.a)(n));var s,u=z(o,i),l=(Object(C.a)(o)-Object(C.a)(i))/1e3,f=Math.round((u-l)/60);if(f<2)return t.includeSeconds?u<5?r.formatDistance("lessThanXSeconds",5,c):u<10?r.formatDistance("lessThanXSeconds",10,c):u<20?r.formatDistance("lessThanXSeconds",20,c):u<40?r.formatDistance("halfAMinute",null,c):u<60?r.formatDistance("lessThanXMinutes",1,c):r.formatDistance("xMinutes",1,c):0===f?r.formatDistance("lessThanXMinutes",1,c):r.formatDistance("xMinutes",f,c);if(f<45)return r.formatDistance("xMinutes",f,c);if(f<90)return r.formatDistance("aboutXHours",1,c);if(f<1440){var d=Math.round(f/60);return r.formatDistance("aboutXHours",d,c)}if(f<2520)return r.formatDistance("xDays",1,c);if(f<43200){var m=Math.round(f/1440);return r.formatDistance("xDays",m,c)}if(f<86400)return s=Math.round(f/43200),r.formatDistance("aboutXMonths",s,c);if((s=$(o,i))<12){var b=Math.round(f/43200);return r.formatDistance("xMonths",b,c)}var g=s%12,p=Math.floor(s/12);return g<3?r.formatDistance("aboutXYears",p,c):g<9?r.formatDistance("overXYears",p,c):r.formatDistance("almostXYears",p+1,c)}function q(e,n){return Object(x.a)(1,arguments),R(e,Date.now(),n)}var J,L=Object(b.a)(H||(H=c()(["\n  mutation MarkAsSeen(\n    $id: Int,\n  ){\n    updateNotification(input: {\n      id: $id\n      attributes: {\n        isSeen: true,\n      }\n    }) {\n      notification {\n        id\n        isSeen\n        message\n        notificationType\n        receivedBy {\n          notifications {\n            edges {\n              node {\n                id\n                message\n                isSeen\n                notificationType\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"])));function Q(e){var n=e.notification,t=Object(u.useMutation)(L),r=i()(t,2);r[0],r[1];return l.createElement(l.Fragment,null,l.createElement(E.b.Item,{title:"Manifest",description:n.message,style:{width:"100%"},left:function(e){return l.createElement(E.b.Icon,w()({},e,{icon:"airplane"}))},right:function(){return l.createElement(S.a,null,q(1e3*n.createdAt))}}),l.createElement(T.a,{style:{width:"100%"}}))}var U,_=Object(b.a)(J||(J=c()(["\n  mutation MarkAsSeen(\n    $id: Int,\n  ){\n    updateNotification(input: {\n      id: $id\n      attributes: {\n        isSeen: true,\n      }\n    }) {\n      notification {\n        id\n        isSeen\n        message\n        notificationType\n        receivedBy {\n          notifications {\n            edges {\n              node {\n                id\n                message\n                isSeen\n                notificationType\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"])));function G(e){var n=e.notification,t=Object(u.useMutation)(_),r=i()(t,2);r[0],r[1];return l.createElement(l.Fragment,null,l.createElement(E.b.Item,{title:"Load #"+n.resource.loadNumber+" boarding call",description:n.message,style:{width:"100%"},left:function(e){return l.createElement(E.b.Icon,w()({},e,{icon:"airplane-takeoff"}))},right:function(){return l.createElement(S.a,null,q(1e3*n.createdAt))}}),l.createElement(T.a,{style:{width:"100%"}}))}var K=Object(b.a)(U||(U=c()(["\n  mutation MarkAsSeen(\n    $id: Int,\n  ){\n    updateNotification(input: {\n      id: $id\n      attributes: {\n        isSeen: true,\n      }\n    }) {\n      notification {\n        id\n        isSeen\n        message\n        notificationType\n        receivedBy {\n          notifications {\n            edges {\n              node {\n                id\n                message\n                isSeen\n                notificationType\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"])));function V(){var e,n,t=Object(g.c)((function(e){return e.global})),r=function(){var e,n,t=Object(g.c)((function(e){return e.global.currentDropzoneId})),r=Object(u.useQuery)(y,{variables:{dropzoneId:t},pollInterval:3e4});return j(j({},r),{},{notifications:null==r||null==(e=r.data)||null==(n=e.dropzone)?void 0:n.currentUser.notifications})}(),a=r.notifications,o=r.loading,c=r.refetch,d=Object(s.useIsFocused)();l.useEffect((function(){d&&c()}),[d]);var b=Object(u.useMutation)(K),h=i()(b,2);h[0],h[1];return l.createElement(l.Fragment,null,o&&l.createElement(m.a,{color:t.theme.colors.accent,indeterminate:!0,visible:o}),l.createElement(p.a,{contentContainerStyle:W.content,refreshControl:l.createElement(f.a,{refreshing:o,onRefresh:function(){return c()}})},null!=a&&null!=(e=a.edges)&&e.length?null==a||null==(n=a.edges)?void 0:n.map((function(e){switch(e.node.notificationType){case"boarding_call":return l.createElement(G,{notification:e.node});case"user_manifested":return l.createElement(Q,{notification:e.node});default:return null}})):l.createElement(D.a,{title:"No notifications",subtitle:"Notifications will show up here"})))}var W=d.a.create({container:{flex:1},content:{flexGrow:1,paddingBottom:56,paddingHorizontal:0},divider:{height:1,width:"100%"}})}}]);
//# sourceMappingURL=14.c544fa1d.chunk.js.map