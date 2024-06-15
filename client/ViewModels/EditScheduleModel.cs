using Camera_Client.Core;
using Camera_Client.Models;
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
    public class EditScheduleModel : BasePropertyItem
    {
        private CameraItem _camera;

        public CameraItem CurrentItem
        {
            get => _camera;
            set => Set(ref _camera, value);
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

        private ScheduledRecord _record;
        private bool _listLoaded;

        public ScheduledRecord Record
        {
            get => _record;
            set
            {
                Set(ref _record, value);
                OnPropertyChanged("IsEditing");
            }
        }

        public bool IsEditing
        {
            get => _record._id != null;
        }

        internal void OnNavigated(NavigationEventArgs e)
        {
            var item = e.Parameter as ScheduleNavParam;
            this.CurrentItem = item.Item;
            this.Record = item.Schedule;
        }

        public List<DayOfWeek> Days => Enum.GetValues(typeof(DayOfWeek))
                            .Cast<DayOfWeek>()
                            .ToList();

        public void ChangeSelection(object sender, SelectionChangedEventArgs e)
        {
            if (!_listLoaded) return;
            ListView listView = sender as ListView;

            this.Record.daysRunning.Clear();

            foreach (DayOfWeek item in listView.SelectedItems)
            {
                this.Record.daysRunning.Add(item);
            }
        }

        public void DaysLoaded(object sender, RoutedEventArgs e)
        {
            ListView listView = sender as ListView;

            this.Record.daysRunning.Sort();

            foreach (DayOfWeek item in this.Record.daysRunning)
            {
                listView.SelectedItems.Add(item);
            }

            _listLoaded = true;
        }

        public async void Save()
        {
            try
            {
                await ScheduleService.PutSchedule(CurrentItem.Url, Record);
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

        public async void Delete()
        {
            await ScheduleService.DeleteSchedule(CurrentItem.Url, Record);
            this.GoBack();
        }
    }
}
