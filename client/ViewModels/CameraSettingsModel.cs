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
    public class CameraSettingsModel : BasePropertyItem
    {
        private CameraItem _camera;

        public CameraItem CurrentItem
        {
            get => _camera;
            set => Set(ref _camera, value);
        }


        private CameraConfig _config;
        public CameraConfig Config
        {
            get => _config;
            set => Set(ref _config, value);
        }


        private string _hostname;
        public string Hostname
        {
            get => _hostname;
            set
            {
                Set(ref _hostname, value);
            }
        }

        private List<WifiItem> _wifi;

        public List<WifiItem> Wifi
        {
            get => _wifi;
            set => Set(ref _wifi, value);
        }

        private WifiItem _selectedWifi;

        public WifiItem SelectedWifi
        {
            get => _selectedWifi;
            set => Set(ref _selectedWifi, value);
        }

        private string _wifiPassword;
        public string WifiPassword
        {
            get => _wifiPassword;
            set => Set(ref _wifiPassword, value);
        }

        private string _authPassword;
        public string AuthPassword
        {
            get => _authPassword;
            set => Set(ref _authPassword, value);
        }

        private bool _authBegun;
        public bool AuthBegun
        {
            get => _authBegun;
            set => Set(ref _authBegun, value);
        }

        private string _error;
        public string Error
        {
            get => _error;
            set
            {
                Set(ref _error, value);
                OnPropertyChanged("ErrorShowing");
            }
        }

        public bool ErrorShowing
        {
            get => _error != null && _error != "";
        }

        internal async void OnNavigated(NavigationEventArgs e)
        {
            this.CurrentItem = e.Parameter as CameraItem;

            try
            {
                Config = await ConfigService.GetConfig(CurrentItem.Url);
                Wifi = await ConfigService.GetWifi(CurrentItem.Url);
                Hostname = Config.hostName;
            } catch (Exception ex)
            {
                Error = "An error occured whilst loading data. " + ex.Message;
            }
        }

        public void HostText_Changed(object sender, TextChangedEventArgs e)
        {
            TextBox text = sender as TextBox;
            var pos = text.SelectionStart;
            text.Text = text.Text.Replace(" ", "-").ToLower();

            text.SelectionStart = pos;
        }

        public async void UpdateHostname()
        {
            try
            {
                await ConfigService.UpdateHostname(CurrentItem.Url, Hostname);
                this.GoBack();
            }
            catch (Exception e)
            {
                Error = "An error occured. " + e.Message;
            }
        }

        public async void ConnectWifi()
        {
            try
            {
                await ConfigService.ConnectWifi(CurrentItem.Url, SelectedWifi.ssid, WifiPassword);
                this.GoBack();
            }
            catch (Exception e)
            {
                Error = "An error occured. " + e.Message;
            }
        }

        public async void OpenLogin()
        {
            var uri = new Uri(CurrentItem.Url + "/integration/auth-url");

            // Launch the URI
            AuthBegun = await Windows.System.Launcher.LaunchUriAsync(uri);
        }

        public async void Authenticate()
        {
            try
            {
                await ConfigService.Authenticate(CurrentItem.Url, AuthPassword);
                this.GoBack();
            }
            catch (Exception e)
            {
                Error = "An error occured. " + e.Message;
            }
        }

        public async void UpdateConfig()
        {
            try
            {
                await ConfigService.UpdateConfig(CurrentItem.Url, Config);
                this.GoBack();
            }
            catch (Exception e)
            {
                Error = "An error occured. " + e.Message;
            }
        }

        public void GoBack()
        {
            NavigationService.NavigateBack();
        }
    }
}
