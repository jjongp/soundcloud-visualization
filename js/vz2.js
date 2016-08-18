var visualizer
var sc_id = 'YOUR_CLIENT_ID'
$(document).ready(function () {
    function isIE() { 
        return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null))); 
    }				    
    function fnCheck(){
        if(isIE()){
            $('#WebGLCanvas').css({width:'100%', height: window.innerHeight+'px', 'background-color': 'black', color: '#fff', 'font-size': '18px'}) 
            $('#all').html("")						              
            $('#WebGLCanvas').html('Your browser does not seem to support HTML5 perfectly.<br>Please use <a href="http://www.google.com/chrome" target="_blank">Google Chrome</a> browser.')
        }else{
            visualizer = new AudioVisualizer()
            visualizer.initialize()
            visualizer.createObject()
            visualizer.btnBox()
        }
    }
    $('.footer').css({marginTop: (window.innerHeight-220)+'px'})
    $('#search').focus()
    
    SC.initialize({
      client_id: sc_id//'7d46f95286398652d69810f503cf57c4'
    });
    fnCheck()    
})
function AudioVisualizer() {    
    this.numberOfvx

	this.scene;
    this.camera;
    this.renderer;
    this.controls;
    this.geometry
    this.material
    this.plane
    this.plane1
    this.vertices
    this.container
    this.state
    this.textureLoader

    this.javascriptNode
    this.audioContext
    this.sourceBuffer
    this.analyser
    
    this.tracks
    this.songNum = 0
    this.songList = {}
    
    this.audio = document.querySelector('audio')
    this.audio.crossOrigin = "anonymous";
    
    this.searchBtn = document.getElementById('search_btn')
    this.search = document.getElementById('search')
    this.next = document.getElementById('next')
    this.prev = document.getElementById('prev')
}
AudioVisualizer.prototype.initialize = function(){    
    var that = this
    var WIDTH = window.innerWidth, HEIGHT = window.innerHeight    
    
    window.addEventListener('resize', function () {
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight
        that.renderer.setSize(WIDTH, HEIGHT)
        that.camera.aspect = WIDTH / HEIGHT
        that.camera.updateProjectionMatrix()   
        $('.footer').css({marginTop: (HEIGHT-220)+'px'})
    })
    
    this.container = document.getElementById('WebGLCanvas')
    this.scene = new THREE.Scene()
     
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(WIDTH, HEIGHT)
    this.container.appendChild(this.renderer.domElement)
    this.renderer.setClearColor(0xeeeeee, 1)   
    
    this.camera = new THREE.PerspectiveCamera(65, WIDTH / HEIGHT, 1, 20000)
    this.camera.position.set(8, 40, 25)    
    this.scene.add(this.camera)
   
    var dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(0,300,0)
    
    var spotlight = new THREE.SpotLight(0xffffff, 2)
    spotlight.castShadow = true
    spotlight.angle = 5
    spotlight.penumbra = 0.2
    spotlight.decay = 0
    spotlight.distance = 70
    spotlight.position.set(0,50,0)
    
    var plight = new THREE.PointLight( 0xffffff, 1.8 );
    plight.position.set(0, 30, 0);
    this.scene.add(plight);
    
    var plight1 = new THREE.PointLight( 0xffffff, 1 );
    plight1.position.set(0, -40, 0);
    this.scene.add(plight1);

    this.controls = new THREE.TrackballControls(this.camera, this.container)
}

AudioVisualizer.prototype.createObject = function(){
    var that = this
    this.textureLoader = new THREE.TextureLoader()
    this.textureLoader.crossOrigin = ""
    this.geometry = new THREE.PlaneGeometry(50, 40, 20, 20)
    this.material = new THREE.MeshLambertMaterial({
        map : that.textureLoader.load('artwork.jpg'),
        side: THREE.DoubleSide, 
        color: 0x00A896,
        morphTargets: true
    })     
    var material1 = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide, 
        wireframe:true, 
        color: 0xffffff, 
        morphTargets: true, 
        transparent:true, 
        opacity: 0.1
    })     
    
    for ( var i = 0; i < this.geometry.vertices.length; i ++ ) {
        this.vertices = []
        for ( var v = 0; v < this.geometry.vertices.length; v ++ ) {
            this.vertices.push( this.geometry.vertices[ v ].clone() )
            if ( v === i ) {
                this.vertices[ this.vertices.length - 1 ].x *= 2
                this.vertices[ this.vertices.length - 1 ].y *= 2
                this.vertices[ this.vertices.length - 1 ].z *= 2
            }
        }
        this.geometry.morphTargets.push({name:"target" + i, vertices:this.vertices})
    }
    
    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.plane1 = new THREE.Mesh(this.geometry, material1)
    this.scene.add(this.plane)
    this.scene.add(this.plane1)
    this.plane.rotation.x = -1.55
    this.plane1.rotation.x = -1.55
    
    visualizer.setupAudioProcessing()
}

AudioVisualizer.prototype.setupAudioProcessing = function(){
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.javascriptNode = this.audioContext.createScriptProcessor(4096, 1, 1)
    this.javascriptNode.connect(this.audioContext.destination)
    visualizer.sourceBuffers()
}

AudioVisualizer.prototype.sourceBuffers = function(){
    var that = this
    this.numberOfvx = this.geometry.vertices.length
    this.sourceBuffer = this.audioContext.createMediaElementSource(that.audio) 
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.smoothingTimeConstant = 0.8
    this.analyser.fftSize = 2048
    this.sourceBuffer.connect(this.analyser)
    this.analyser.connect(this.javascriptNode)
    this.sourceBuffer.connect(this.audioContext.destination)
    
    function draw(){
        var array = new Uint8Array(that.analyser.frequencyBinCount)
        that.analyser.getByteFrequencyData(array)
        var value = 0

        for(var i = 0; i < that.numberOfvx; i++){
            value = array[i] / 13
            value = value < 1 ? 1 : value
            
            if(value != 1){
                that.geometry.vertices[i].z += (value - that.geometry.vertices[i].z)/10
            }else{
                that.geometry.vertices[i].z += (0 - that.geometry.vertices[i].z)/10
            }
        }
        
        that.plane.geometry.verticesNeedUpdate = true
        that.plane1.geometry.verticesNeedUpdate = true

        requestAnimationFrame( draw )
        that.renderer.render(that.scene, that.camera)
        that.controls.update()        
    }
    draw()   
}

AudioVisualizer.prototype.scStream = function(search){    
    var that = this
    this.tracks = []
    this.songNum = 0
        
    SC.get('/tracks', {
      q: search
    }).then(function(tracks) {
        that.tracks = tracks
        that.songSet()
    })       
}
AudioVisualizer.prototype.songSet = function(){
    var that = this
    var s_url, a_url, ar_url
    var title = document.getElementById('songTitle')
    
    if($.isEmptyObject(this.songList)){
        s_url = that.tracks[this.songNum].stream_url+"?client_id=" + sc_id
        this.audio.setAttribute('src', s_url)

        // artwork
        ar_url = that.tracks[this.songNum].artwork_url
        if(ar_url != null) {
            a_url = ar_url.replace("large", "crop")
            that.material.map = that.textureLoader.load(a_url)
        }else{
            that.material.map = that.textureLoader.load("artwork.jpg")
        }

        // title
        title.innerHTML = that.tracks[this.songNum].title
    
        for(var i = 0; i<that.tracks.length; i++){
            this.songList.title = that.tracks[i].title
            $('#list').append("<li><a href='#'>"+that.tracks[i].title+"</a></li>")            
        }
        
        // list
        $('#list li').eq(that.songNum).css({'text-decoration': 'underline'})
        $('#list li').mousedown(function(){
            var idx = $(this).index()
            that.songNum = idx
            $('li').remove()
            that.songList = {}
            that.songSet()
            $('#list li').eq(idx).css({'text-decoration': 'underline'})
            
            if(idx == that.tracks.length - 1){
                that.prev.removeAttribute('disabled')
                that.next.setAttribute('disabled', 'disabled')
            }else if(idx == 0){
                that.prev.setAttribute('disabled', 'disabled')
                that.next.removeAttribute('disabled')
            }
        })
    }
}
AudioVisualizer.prototype.btnBox = function(){    
    var that = this
    
    this.next.setAttribute('disabled', 'disabled')
    this.prev.setAttribute('disabled', 'disabled')
    
    this.searchBtn.onmousedown = function(){
        that.scStream(that.search.value)
        this.prev.setAttribute('disabled', 'disabled')
        that.next.removeAttribute('disabled')
        $('li').remove()
        that.songList = {}
    }
    this.search.onkeydown = function(e){
        if(e.key == "Enter" ){
            that.scStream(that.search.value)
            that.prev.setAttribute('disabled', 'disabled')
            that.next.removeAttribute('disabled')
            $('li').remove()
            that.songList = {}     
        }
    }    
    
    this.next.onmousedown = function(){
        that.songNum++;
        that.prev.removeAttribute('disabled')
        if(that.songNum == that.tracks.length-1){
            that.next.setAttribute('disabled', 'disabled')
        }
        $('li').remove()
        that.songList = {}
        that.songSet()
    }
    this.prev.onmousedown = function(){
        that.songNum--;        
        if(that.songNum <= 0){
            that.prev.setAttribute('disabled', 'disabled')
        }
        $('li').remove()
        that.songList = {}
        that.songSet()
    }  
    document.onkeydown = function(e){
        if(e.key == 'ArrowRight' && that.next.getAttribute('disabled') == null){
            that.songNum++;
            that.prev.removeAttribute('disabled')
            if(that.songNum == that.tracks.length-1){
                that.next.setAttribute('disabled', 'disabled')
            }
            $('li').remove()
            that.songList = {}
            that.songSet()
        }else if(e.key == 'ArrowLeft' && that.prev.getAttribute('disabled') == null){
            that.songNum--;
            if(that.songNum <= 0){
                that.prev.setAttribute('disabled', 'disabled')
            }
            $('li').remove()
            that.songList = {}
            that.songSet()
        }
    }
}


