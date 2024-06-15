using Camera_Client.Core;
using Camera_Client.Models;
using Camera_Client.Pages;
using Camera_Client.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
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

namespace Camera_Client.Controls
{
    public sealed partial class CameraGridItem : UserControl, INotifyPropertyChanged
    {
        internal static readonly DependencyProperty CameraItemProperty = DependencyProperty.Register(
            "Camera", typeof(CameraItem), typeof(CameraGridItem), new PropertyMetadata(null)
        );

        public event PropertyChangedEventHandler PropertyChanged;

        public void NotifyPropertyChanged([CallerMemberName] String propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public CameraItem Camera
        {
            get { return (CameraItem) GetValue(CameraItemProperty); }
            set
            { 
                SetValue(CameraItemProperty, value);
                NotifyPropertyChanged();
            }
        }
        
        public CameraGridItem()
        {
            this.InitializeComponent();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.NavigateTo(typeof(CameraSettings), Camera);
        }
    }
}
