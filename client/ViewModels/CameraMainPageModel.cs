using Camera_Client.Core;
using Camera_Client.Models;
using Camera_Client.Pages;
using Camera_Client.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reactive;
using System.Reactive.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.ApplicationModel.Core;
using Windows.Media.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Navigation;
using Zeroconf;

namespace Camera_Client.ViewModels
{
    public class CameraMainPageModel : BasePropertyItem
    {
        private MediaSource _source;
        private CameraItem _camera;

        public CameraItem CurrentItem 
        {
            get => _camera;
            set => Set(ref _camera, value);
        }

        public MediaSource Source
        {
            get => _source;
            set => Set(ref _source, value);
        }

        internal void OnNavigated(NavigationEventArgs e)
        {
            this.CurrentItem = e.Parameter as CameraItem;
            Source = MediaSource.CreateFromUri(new Uri(CurrentItem.Video));
        }

        public void ViewSchedule()
        {
            NavigationService.NavigateTo(typeof(Schedules), CurrentItem);
        }

        public void ViewSettings()
        {
            NavigationService.NavigateTo(typeof(CameraSettings), CurrentItem);
        }

        internal void OnNavigatedFrom(NavigationEventArgs e)
        {
            this.Source = null;
        }
    }
}
