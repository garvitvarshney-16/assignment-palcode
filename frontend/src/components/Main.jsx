import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComplexNavbar from './Navbar';
import SidebarWithContentSeparator from './Sider';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
} from "@material-tailwind/react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";


const Main = () => {
    const [playlists, setPlaylists] = useState([]);
    const [videos, setVideos] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('youtube_token') || '');
    const [selectedVideos, setSelectedVideos] = useState([]);


    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const match = hash.match(/access_token=([^&]*)/);
            if (match && match[1]) {
                const accessToken = match[1];
                localStorage.setItem('youtube_token', accessToken);
                setToken(accessToken);
                window.history.replaceState(null, '', window.location.pathname);
            }
        }
    }, []);

    const handleYouTubeLogin = () => {
        const clientId = import.meta.env.VITE_clientId;
        const redirectUri = import.meta.env.VITE_redirectUri;
        const scope = import.meta.env.VITE_scope;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${encodeURIComponent(
            scope
        )}`;

        window.location.href = authUrl;
    };

    const fetchPlaylists = async () => {
        if (!token) {
            alert('No token found. Please login first.');
            return;
        }

        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/playlists`,
                {
                    params: {
                        part: 'snippet',
                        mine: true,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPlaylists(response.data.items || []);
        } catch (err) {
            console.error('Error fetching playlists:', err);
            if (err.response && err.response.status === 401) {
                alert('Token expired. Please login again.');
                localStorage.removeItem('youtube_token');
                setToken('');
            }
        }
    };
    
    const fetchVideos = async (playlistId) => {
        if (!token) {
            alert('No token found. Please login first.');
            return;
        }

        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/playlistItems`,
                {
                    params: {
                        part: 'snippet',
                        playlistId,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setVideos(response.data.items || []);
        } catch (err) {
            console.error('Error fetching videos:', err);
        }
    };

    const saveLayout = async () => {
        const layoutData = {
            playlists,
            videos,
            selectedVideos,
        };

        try {
            const docRef = doc(db, "layouts", "user-layout");
            await setDoc(docRef, layoutData);
            alert("Layout saved successfully!");
        } catch (err) {
            console.error("Error saving layout:", err);
        }
    };

    const loadLayout = async () => {
        try {
            const docRef = doc(db, "layouts", "user-layout");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const layoutData = docSnap.data();
                setPlaylists(layoutData.playlists);
                setVideos(layoutData.videos);
                setSelectedVideos(layoutData.selectedVideos);
                alert("Layout loaded successfully!");
            } else {
                alert("No saved layout found.");
            }
        } catch (err) {
            console.error("Error loading layout:", err);
        }
    };

    return (
        <div className="grid grid-cols-[25%_75%] gap-10">

            <SidebarWithContentSeparator />

            <div>

                <ComplexNavbar />


                <header className="header mt-5 mb-5">
                    <h1>YouTube Playlist Importer</h1>
                    <div className="flex flex-row gap-5 mt-4">
                        <button className="login-btn" onClick={handleYouTubeLogin}>
                            Import From YouTube
                        </button>
                        <button className="fetch-btn" onClick={fetchPlaylists}>
                            Fetch Playlists
                        </button>
                        <button className="login-btn" onClick={saveLayout}>
                            Save Layout
                        </button>
                        <button className="fetch-btn" onClick={loadLayout}>
                            Load Layout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-2 gap-6">
                    <section className="playlist-section">
                        <Typography variant="h5" className="text-gray-300 font-bold mb-4">
                            Playlists
                        </Typography>
                        <div className="grid grid-cols-2 gap-2">
                            {playlists.map((playlist) => (
                                <Card
                                    key={playlist.id}
                                    className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-gray-800 text-white"
                                    onClick={() => fetchVideos(playlist.id)}
                                >
                                    <img
                                        src={playlist.snippet.thumbnails?.medium?.url}
                                        alt={playlist.snippet.title || "Playlist"}
                                        className="h-full w-full object-cover"
                                    />
                                    <CardBody className="p-4">
                                        <Typography variant="h6" className="truncate">
                                            {playlist.snippet.title || "Untitled Playlist"}
                                        </Typography>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section className="">
                        <Typography variant="h5" className="text-gray-300 font-bold mb-4">
                            Videos
                        </Typography>
                        <div className="grid grid-cols-2 gap-2">
                            {videos.map((video) => (
                                <Card key={video.id} className='shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-gray-800 text-white' >
                                    <img
                                        src={video.snippet.thumbnails?.medium?.url}
                                        alt={video.snippet.title}
                                        className="h-full w-full object-cover"
                                    />
                                    <Typography>{video.snippet.title}</Typography>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>


            </div>
        </div>
    );
};

export default Main;
