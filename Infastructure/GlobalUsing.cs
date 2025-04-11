﻿global using Domain.Entities;
global using Domain.Interface;
global using Microsoft.EntityFrameworkCore;
global using Application.Helper;
global using Application.Interface;
global using Application.Interface.Api;
global using Application.Interface.ContextSerivce;
global using Application.Interface.Hubs;
global using Application.Interface.SearchAI;
global using Application.Services;
global using Infrastructure.ApiPython;
global using Infrastructure.Data.Repositories;
global using Infrastructure.Data.UnitOfWork;
global using Infrastructure.Email;
global using Infrastructure.Gemini;
global using Infrastructure.Hubs;
global using Infrastructure.Maps;
global using Infrastructure.Redis;
global using Infrastructure.Service;
global using Microsoft.Extensions.Configuration;
global using Microsoft.Extensions.DependencyInjection;
global using StackExchange.Redis;
global using Application.DTOs.Message;
global using Microsoft.AspNetCore.SignalR;
global using static Domain.Common.Enums;