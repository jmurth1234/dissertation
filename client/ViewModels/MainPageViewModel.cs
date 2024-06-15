using Camera_Client.Core;
using Camera_Client.Models;
using Camera_Client.Pages;
using Camera_Client.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Reactive;
using System.Reactive.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Windows.ApplicationModel.Core;
using Windows.ApplicationModel.Store;
using Windows.Media.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Zeroconf;

namespace Camera_Client.ViewModels
{
    public class MainPageViewModel : BasePropertyItem
    {
        private CameraItem _currentItem;
        private Timer _timer;

        public ObservableCollection<CameraItem> ServersList { get; set; } = new ObservableCollection<CameraItem>();

        public bool NoItems => ServersList.Count == 0;

        public CameraItem CurrentItem
        {
            get => _currentItem;
            set => Set(ref _currentItem, value);
        }

        public async void MainPage_Loaded()
        {
            await RefreshServers();

            _timer = new Timer((state) =>
            {
                _ = CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, async () =>
                {
                    await this.RefreshServers();
                });

            }, null, 20000, 20000);
        }

        public async Task RefreshServers()
        {
            var results = await ZeroconfResolver.ResolveAsync("_http._tcp.local.");

            foreach (var value in results)
            {
                var url = $"http://{value.IPAddress}:3000";

                try
                {
                    var result = new CameraItem()
                    {
                        Name = value.DisplayName,
                        Id = value.Id,
                        Url = url,
                        Config = await ConfigService.GetConfig(url)
                    };

                    if (!ServersList.Contains(result))
                    {
                        ServersList.Add(result);
                    }
                }
                catch (Exception e) 
                {
                    Debug.WriteLine(e);
                }
            }

            var toRemove = new List<CameraItem>();

            foreach (var server in ServersList)
            {
                if (results.FirstOrDefault(other => server.Id == other.Id) == null)
                {
                    toRemove.Add(server);
                }
            }

            toRemove.ForEach(item => ServersList.Remove(item));
            this.OnPropertyChanged("NoItems");
        }

        public void Servers_SelectionChanged()
        {
            if (CurrentItem == null)
            {
                NavigationService.Blank();
            }
            else 
            {
                NavigationService.NavigateTo(typeof(CameraMainPage), CurrentItem);
            }
        }
    }
}
