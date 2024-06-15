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
    public class SchedulesModel : BasePropertyItem
    {
        private CameraItem _camera;

        public CameraItem CurrentItem
        {
            get => _camera;
            set => Set(ref _camera, value);
        }

        private List<ScheduledRecord> _schedules;

        public List<ScheduledRecord> Schedules
        {
            get => _schedules;
            set => Set(ref _schedules, value);
        }

        internal async void OnNavigated(NavigationEventArgs e)
        {
            this.CurrentItem = e.Parameter as CameraItem;

            Schedules = await ScheduleService.GetSchedules(this.CurrentItem.Url);
        }

        public async void CreateNew()
        {
            NavigationService.NavigateTo(typeof(EditSchedule), new ScheduleNavParam() 
            { 
                Item = this.CurrentItem,
                Schedule = await ScheduleService.GetScheduleTemplate(this.CurrentItem.Url)
            });
        }

        public void EditSchedule(object sender, SelectionChangedEventArgs e)
        {
            var schedule = e.AddedItems[0] as ScheduledRecord;

            NavigationService.NavigateTo(typeof(EditSchedule), new ScheduleNavParam()
            {
                Item = this.CurrentItem,
                Schedule = schedule
            });
        }

        public void GoBack()
        {
            NavigationService.NavigateBack();
        }
    }
}
