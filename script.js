document.addEventListener("DOMContentLoaded", async () => {
    const API_KEY = "AIzaSyDKN9Aj7ljAEOQFWSr9DlRZQIpC7Cx8bpE";
    const CHANNEL_ID = "UC8vO5Qy3HGzzrd3LqenT2fg"; // The channel ID for @vdud

    const videoGroups = {
        "More than 20M": [],
        "More than 10M": [],
        "More than 7M": [],
        "More than 4M": [],
    };

    async function fetchVideos() {
        let videos = [];
        let nextPageToken = "";

        do {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=viewCount&maxResults=50&pageToken=${nextPageToken}`
            );

            const data = await response.json();

            if (data.items) {
                videos = videos.concat(data.items);
            }

            nextPageToken = data.nextPageToken || "";
        } while (nextPageToken);

        return videos;
    }

    async function fetchVideoStats(videoIds) {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds.join(",")}&part=statistics,snippet`
        );

        const data = await response.json();
        return data.items;
    }

    function groupVideosByViews(videos) {
        videos.forEach((video) => {
            const viewCount = parseInt(video.statistics.viewCount, 10);

            if (viewCount > 20000000) {
                videoGroups["More than 20M"].push(video);
            } else if (viewCount > 10000000) {
                videoGroups["More than 10M"].push(video);
            } else if (viewCount > 7000000) {
                videoGroups["More than 7M"].push(video);
            } else if (viewCount > 4000000) {
                videoGroups["More than 4M"].push(video);
            }
        });
    }

    function renderTable() {
        const tbody = document.getElementById("videos-tbody");

        if (!tbody) {
            console.error("Table body element not found!");
            return;
        }

        Object.keys(videoGroups).forEach((group) => {
            videoGroups[group].forEach((video) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${group}</td>
                    <td>${video.snippet.title}</td>
                    <td>${video.statistics.viewCount}</td>
                    <td><a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">Watch</a></td>
                `;
                tbody.appendChild(row);
            });
        });
    }

    try {
        const videos = await fetchVideos();
        const videoIds = videos
            .filter((video) => video.id.videoId) // Ensure we only use valid video IDs
            .map((video) => video.id.videoId);

        if (videoIds.length === 0) {
            console.error("No video IDs found!");
            return;
        }

        const videoDetails = await fetchVideoStats(videoIds);
        groupVideosByViews(videoDetails);
        renderTable();
    } catch (error) {
        console.error("Error occurred while fetching and rendering videos:", error);
    }
});
