using System.Text.Json.Serialization;
namespace WebApiService.Models
{
    public class Registration
    {
        public int RegistrationID { get; set; }
        public int StudentID { get; set; }
        public int CourseID { get; set; }
        public DateTime RegistrationDate { get; set; }

        [JsonIgnore]
        public Student? Student { get; set; }
        public Course? Course { get; set; }
    }

    public class RegistrationDto
    {
        public int CourseID { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int Age { get; set; }
        public string? Email { get; set; }
    }
}
