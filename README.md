# Distributed Home CCTV System

A prototype of a home-based CCTV system that utilizes Raspberry Pis to process data and make scheduling decisions in a distributed way without relying on a central server.

## Overview

For my BSc Computer Science dissertation project, I developed a prototype of a home CCTV system that uses distributed smart devices like Raspberry Pis equipped with cameras to process video data and make scheduling decisions without depending on a central server.

The system allows the cameras to be auto-discovered on the network using mDNS, scheduled to record based on motion detection and other parameters, and to upload clips to the user's cloud storage. A desktop client application enables easy configuration of the cameras.

## Tech Stack

- **Hardware**: Raspberry Pi 4 Model B with camera modules
- **Server Software**: Node.js, Express, Agenda, OpenCV, FFmpeg, mDNS
- **Client Software**: C# UWP desktop application

## Features

- Decentralized architecture: Cameras operate independently without a central server
- Auto-discovery: Cameras are automatically detected on the network using mDNS
- Scheduling: Recording can be scheduled based on various parameters
- Motion detection: Cameras can detect motion and trigger recording
- Cloud storage: Recorded clips are uploaded to the user's cloud storage
- Desktop client: A UWP application allows easy configuration of the cameras

## Repository Structure

- `/server` - Contains the Node.js server code for the Raspberry Pi cameras
- `/client` - Contains the C# UWP desktop client application code

## Getting Started

1. Clone the repository
2. Set up the Raspberry Pi cameras with the server software
3. Build and run the desktop client application
4. Configure the cameras using the desktop client

More detailed documentation is planned