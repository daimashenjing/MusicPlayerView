/**
 * Created by HuaSao1024 on 2016/12/16.
 */
$(document).ready(function () {
    var index = 0;
    var mLen = playlist.length;
    var audio = getId('music-play');
    var soundTime = 0;
    var mHeadImg = getClass('play-head')[0];
    var musicName = '';
    var isRunning = false;
    var errCurrentTime = 0;
    loadImg('img/2.0/icon_loading_music.png');//预加载图片
    loadImg('img/2.0/btn_music_pause.png');//预加载图片
    setTimeout(function () {
        setMusicInfo(playlist[index], true);//初始化音乐信息
    }, 100);
    //点击播放
    $(".play-pause").tap(function (e) {
        var mPlay = $(this).attr('play');
        if (mPlay === 'no') {
            playMusic();
        } else if (mPlay === 'yes') {
            pauseMusic(this);
        }
    });
    //下一曲
    $(".play-next").tap(function (e) {
        $('.current-time').text('00:00');
        $('#songProgressCurrent').css('width', '0%');
        $('#songProgressHideBar').css('left', '0%');
        setPlayNext()
    });
    //上一曲
    $(".play-last").tap(function (e) {
        $('.current-time').text('00:00');
        $('#songProgressCurrent').css('width', '0%');
        $('#songProgressHideBar').css('left', '0%');
        setPlayLast();
    });
    //下一曲
    function setPlayNext() {
        pauseMusic('.play-pause');
        if (index === (mLen - 1)) {
            index = 0;
        } else {
            index++;
        }
        setMusicInfo(playlist[index], true);
        playMusic();
    }

    //上一曲
    function setPlayLast() {
        pauseMusic('.play-pause');
        if (index === 0) {
            index = (mLen - 1);
        } else {
            index--;
        }
        setMusicInfo(playlist[index], true);
        playMusic();
    }

    //设置音乐详情
    function setMusicInfo(value, isCheck) {
        if (value) {
            musicName = value.songName + ' No.' + (index+1);
            $('.music-name').text(musicName);
            $('#donorsName').text(value.donorsName);
            mHeadImg.src = value.coverImage ? value.coverImage : 'img/user_avatar_icon.jpg';
            audio.src = value.mp3;
            if (isCheck) {
                $("input[name=select-music]:eq(" + index + ")").get(0).checked = true;
            }
        }
    }

    //播放
    function playMusic() {
        if (audio.src === '' || audio.src === null || audio.src === undefined) {
            showToast('音乐文件不存在');
            return;
        }
        $('.play-pause').css({
            'background': 'url("img/2.0/icon_loading_music.png") 50% 50% / 3.2rem 3.2rem no-repeat',
            'animation': 'headAni 3s infinite linear',
            'webkitAnimation': 'headAni 3s infinite linear'
        });
        $('.music-name').text('加载中...');
        isRunning = true;
        audio.play();
    }

    //暂停
    function pauseMusic(obj) {
        if (audio.src === '' || audio.src === null || audio.src === undefined) {
            showToast('音乐文件不存在');
            return;
        }
        $(obj).attr('play', 'no');
        $(obj).css({'background': 'url("img/2.0/btn_music_paly.png") 50% 50% / 3.2rem 3.2rem no-repeat'});
        $(mHeadImg).css({'animationPlayState': 'paused', 'webkitAnimationPlayState': 'paused'});
        $('.cd_brush').css({'animationPlayState': 'paused', 'webkitAnimationPlayState': 'paused'});
        audio.pause()
    }

    bindEventListeners(audio, 'timeupdate', setTimeDate);
    bindEventListeners(audio, 'loadedmetadata', setTimeDate);
    bindEventListeners(audio, 'progress', setDownload);
    bindEventListeners(audio, 'error', function () {
        pauseMusic('.play-pause');
        audio.load();
        audio.currentTime = Math.floor(errCurrentTime);
        $('.music-name').text('加载失败,点击重试');
        $('.play-pause').attr('play', 'no');
        $('.play-pause').css({
            'background': 'url("img/2.0/btn_music_paly.png") 50% 50% / 3.2rem 3.2rem no-repeat',
            'animation': '',
            'webkitAnimation': ''
        });
        isRunning = false;
        $('.music-name').tap(function () {
            playMusic()
        });
    });

    bindEventListeners(audio, 'playing', function () {
        if (isRunning) {
            isRunning = false;
            $('.play-pause').attr('play', 'yes');
            $('.play-pause').css({
                'background': 'url("img/2.0/btn_music_pause.png") 50% 50% / 3.2rem 3.2rem no-repeat',
                'animation': '',
                'webkitAnimation': ''
            });
            $(mHeadImg).css({'animationPlayState': 'running', 'webkitAnimationPlayState': 'running'});
            $('.cd_brush').css({'animationPlayState': 'running', 'webkitAnimationPlayState': 'running'});
            $('.music-name').text(musicName);
        }
    });
    bindEventListeners(audio, 'waiting', function () {
        $('.music-name').text('加载中...');

        $('.play-pause').css({
            'background': 'url("img/2.0/icon_loading_music.png") 50% 50% / 3.2rem 3.2rem no-repeat',
            'animation': 'headAni 3s infinite linear',
            'webkitAnimation': 'headAni 3s infinite linear'
        });
        isRunning = true;

    });

    bindEventListeners(audio, 'canplay', function () {
        $('.music-name').text(musicName);
    });
    var MaxWidth = parseInt($('#songProgressBar').width());
    $('#songProgressClick').tap(function (e) {
        e = e || event;
        if (soundTime != 0) {
            audio.pause();
            var Rect = getClientRect(this);
            var percent = (e.clientX - Rect.left) / MaxWidth * 100;
            $('#songProgressCurrent').css('width', percent + '%');
            $('#songProgressHideBar').css('left', (percent) + '%');
            var currentTime = parseInt(percent / 100 * soundTime);
            if (currentTime > soundTime) {
                currentTime = soundTime
            }
            audio.currentTime = Math.floor(currentTime);
            audio.play();
        }
        L(percent, true);
    });
    $('#songProgressHideBar').bind('touchstart', function (e) {
        if (soundTime === 0) {
            return;
        }
        e = e || event;
        preventDefault(e);
        var events = e.touches[0];
        var clientX = parseInt(events.clientX);
        var mLeft = parseInt($('#songProgressHideBar').css('left'));
        var mWidth = parseInt($('#songProgressCurrent').width());
        var mCurrentLeft = Math.floor(mLeft) > 0 ? Math.floor(mLeft) : 0;
        var mCurrentWidth = Math.floor(mWidth) ? Math.floor(mWidth) : 0;
        var mMoveLeft, mMoveWidth;
        $('#songProgressHideBar').bind('touchmove', function (e) {
            e = e || event;
            preventDefault(e);
            var events = e.touches[0];
            mMoveLeft = parseInt(events.clientX) + mCurrentLeft - clientX;
            mMoveWidth = parseInt(events.clientX) + mCurrentWidth - clientX;
            mMoveLeft = mMoveLeft / MaxWidth * 100;
            mMoveWidth = mMoveWidth / MaxWidth * 100;
            mMoveLeft = mMoveLeft < 0 ? 0 : mMoveLeft;
            mMoveLeft = mMoveLeft > 100 ? 100 : mMoveLeft;
            mMoveWidth = mMoveWidth < 0 ? 0 : mMoveWidth;
            mMoveWidth = mMoveWidth > 100 ? 100 : mMoveWidth;
            $('#songProgressCurrent').css('width', mMoveWidth + '%');
            $('#songProgressHideBar').css('left', (mMoveLeft) + '%');
        });
        $('#songProgressHideBar').bind('touchend', function (e) {
            e = e || event;
            preventDefault(e);
            if (soundTime != 0) {
                audio.pause();
                var currentTime = parseInt(mMoveWidth / 100 * soundTime);
                if (currentTime > soundTime) {
                    currentTime = soundTime
                }
                audio.currentTime = Math.floor(currentTime);
                audio.play();
            }
            $('#songProgressHideBar').bind('touchstart', Noop);
            $('#songProgressHideBar').bind('touchmove', Noop);
            $('#songProgressHideBar').bind('touchend', Noop);

        });
    });
    function preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function Noop() {

    }

    //更新时间进度
    function setTimeDate(e) {
        errCurrentTime = audio.currentTime;
        soundTime = parseInt(audio.duration);
        var time = parseInt(soundTime / 60);
        var str = parseInt(soundTime % 60);
        var surplus = errCurrentTime;
        var surplusMin = parseInt(surplus / 60);
        var surplusSecond = parseInt(surplus % 60);
        !time ? time = 0 : '';
        !str ? str = 0 : '';
        !surplusMin ? surplusMin = 0 : '';
        !surplusSecond ? surplusSecond = 0 : '';
        time < 10 ? time = '0' + time : '';
        str < 10 ? str = '0' + str : '';
        surplusMin < 10 ? surplusMin = '0' + surplusMin : '';
        surplusSecond < 10 ? surplusSecond = '0' + surplusSecond : '';
        var mCurrentTime = surplusMin + ':' + surplusSecond;
        var mEndTime = time + ':' + str;
        $('.current-time').text(mCurrentTime);
        $('.end-time').text(mEndTime);
        var progressValue = audio.currentTime / audio.duration * 100;
        $('#songProgressCurrent').css('width', progressValue + '%');
        $('#songProgressHideBar').css('left', (progressValue) + '%');
        if (mCurrentTime === mEndTime && mEndTime != '00:00') {
            setPlayNext();
        }
    }

    function setDownload(e) {
        // 获取已缓冲部分的 TimeRanges 对象
//            var timeRanges = audio.buffered;
//            // 获取以缓存的时间
//            var timeBuffered = timeRanges.end(timeRanges.length - 1);
//            // 获取缓存进度，值为0到1
//            var bufferPercent = timeBuffered / audio.duration;
//            L(timeBuffered, true);
    }

    setTimeout(function () {
        $("input[name=select-music]").tap(function () {
            var id = parseInt($(this).attr('value'));
            if (id === index) {
                if (audio.paused) {
                    playMusic();
                } else {
                    pauseMusic('.play-pause');
                }
            } else {
                index = id;
                setMusicInfo(playlist[index], false);
                playMusic();
            }

        });
    }, 300);
});