using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repload.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDayIndexAndNotesToWorkouts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DayIndex",
                table: "ProgramWorkouts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "ProgramWorkouts",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DayIndex",
                table: "ProgramWorkouts");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "ProgramWorkouts");
        }
    }
}
