# soundcloud-visualization


[![alt text](https://raw.githubusercontent.com/jjongp/soundcloud-visualization/3fc707b823507a930ea2ee94df0c16c3cc294ffe/image.jpg)]


### Soundcloud Search API
[https://developers.soundcloud.com/docs/api/guide#search](https://developers.soundcloud.com/docs/api/guide#search)
```html
<script src="https://connect.soundcloud.com/sdk/sdk-3.1.2.js"></script>
<script>
SC.initialize({
  client_id: 'YOUR_CLIENT_ID'
});

// find all sounds of buskers licensed under 'creative commons share alike'
SC.get('/tracks', {
  q: 'buskers', license: 'cc-by-sa'
}).then(function(tracks) {
  console.log(tracks);
});
</script>
```


### URL
[http://www.p-young.com/lab/vz/visualization_v2.html](http://www.p-young.com/lab/vz/visualization_v2.html)


### License
Copyright (c) pyoung (http://www.p-young.com)

Licensed under the MIT license.

 - http://www.opensource.org/licenses/mit-license.php
