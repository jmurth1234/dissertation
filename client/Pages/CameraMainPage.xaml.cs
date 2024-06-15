﻿using Camera_Client.ViewModels;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=234238

namespace Camera_Client.Pages
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class CameraMainPage : Page
    {
        public CameraMainPageModel Model { get; } = new CameraMainPageModel();

        public CameraMainPage()
        {
            this.InitializeComponent();
            Player.MediaPlayer.RealTimePlayback = true;
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            Model.OnNavigated(e);
        }
        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            Player.MediaPlayer.Pause();

            Model.OnNavigatedFrom(e);
        }
    }
}
